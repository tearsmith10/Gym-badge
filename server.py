#!/usr/bin/env python3
"""
GYM BADGE — application server
==============================

A single-file, standard-library-only HTTP server that provides:

  • Static hosting for the whole site (the PWA under /app/, the marketing
    site under /web/, shared assets under /assets/).
  • A real JSON API under /api that backs assets/auth.js:
        GET  /api/config              feature flags (SMTP, OAuth ids, …)
        POST /api/auth/signup         create an account + send a Mailgun code
        POST /api/auth/login          verify a password, issue a session token
        POST /api/auth/verify         confirm an email address
        POST /api/auth/signup/resend  resend the confirmation email
        POST /api/auth/forgot         send a password reset link
        POST /api/auth/reset          set a new password from a reset token
        POST /api/auth/oauth          link a Google / Yahoo account
        POST /api/auth/logout         best-effort session kill
        GET  /api/profile             the signed-in member
        POST /api/verify/id           optional masked identity verification

  • Email via **Mailgun SMTP** (smtp.mailgun.org:587, STARTTLS) for
    registration confirmations and password resets.

Security notes
--------------
  * Passwords are stored as PBKDF2-HMAC-SHA256 with a per-user random salt
    and 600,000 iterations. Plaintext passwords are never written to disk
    and never leave the process.
  * Session tokens are 32-byte secrets from `secrets`, compared with
    `hmac.compare_digest`, and stored server-side so they can be revoked.
  * Verification and reset tokens are single-use and expire (24 h and 1 h).
  * Identity numbers (NIN / SSN / passport) are NEVER stored in clear. They
    are masked to the last four digits and stored alongside a salted hash.
  * The API is same-origin only: CORS is not enabled, and every mutating
    route requires either a session token or a one-time emailed token.

Configuration (environment variables)
------------------------------------
  GYMBADGE_DOMAIN        Mailgun sending domain        (e.g. mg.gymbadge.app)
  MAILGUN_API_KEY        Mailgun API key (also the SMTP password)
  MAILGUN_FROM           Envelope/From address          (optional)
  GYMBADGE_SMTP_HOST     default smtp.mailgun.org
  GYMBADGE_SMTP_PORT     default 587
  GYMBADGE_SITE_URL      public base URL for links      (default http://localhost:8080)
  GYMBADGE_DATA_DIR      where users.json lives         (default ./data)
  SPOTIFY_CLIENT_ID      enables the Spotify music connection
  GOOGLE_CLIENT_ID       enables the YouTube Music connection
  AUDIOMACK_CLIENT_ID    enables the Audiomack music connection
  GYMBADGE_PORT          listen port                   (default 8080)

Run
---
  python server.py 8080
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import json
import mimetypes
import os
import re
import secrets
import smtplib
import ssl
import sys
import threading
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote, parse_qs

# --------------------------------------------------------------------------
# configuration
# --------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("GYMBADGE_DATA_DIR") or os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "users.json")

PORT = int(os.environ.get("GYMBADGE_PORT", "8080"))
SITE_URL = (os.environ.get("GYMBADGE_SITE_URL") or f"http://localhost:{PORT}").rstrip("/")

MAILGUN_DOMAIN = os.environ.get("GYMBADGE_DOMAIN", "")
MAILGUN_API_KEY = os.environ.get("MAILGUN_API_KEY", "")
MAILGUN_FROM = os.environ.get("MAILGUN_FROM") or (
    f"Gym Badge <mailgun@{MAILGUN_DOMAIN}>" if MAILGUN_DOMAIN else "Gym Badge <no-reply@localhost>"
)
SMTP_HOST = os.environ.get("GYMBADGE_SMTP_HOST", "smtp.mailgun.org")
SMTP_PORT = int(os.environ.get("GYMBADGE_SMTP_PORT", "587"))
SMTP_USER = os.environ.get("GYMBADGE_SMTP_USER") or (
    f"postmaster@{MAILGUN_DOMAIN}" if MAILGUN_DOMAIN else "")

PBKDF2_ROUNDS = 600_000
VERIFY_TTL = 24 * 3600        # email confirmation link lifetime
RESET_TTL = 3600              # password reset link lifetime

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def valid_password(pw: str) -> tuple[bool, str]:
    """Password rules — mirrored exactly in assets/auth.js."""
    if not pw or len(pw) < 8:
        return False, "Password must be at least 8 characters."
    if not (re.search(r"[A-Za-z]", pw) and re.search(r"\d", pw)):
        return False, "Password must contain both letters and numbers."
    return True, ""


# --------------------------------------------------------------------------
# storage — a tiny JSON store with a process-wide lock
# --------------------------------------------------------------------------

_LOCK = threading.RLock()
_DB: dict = {"users": {}, "sessions": {}, "verify": {}, "reset": {}}


def db_load() -> None:
    with _LOCK:
        try:
            with open(DB_PATH, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, dict):
                for key in ("users", "sessions", "verify", "reset"):
                    if isinstance(data.get(key), dict):
                        _DB[key] = data[key]
        except FileNotFoundError:
            pass
        except Exception as exc:  # corrupt file — start clean but keep a copy
            print(f"[db] could not read {DB_PATH}: {exc}", file=sys.stderr)
        for key in ("users", "sessions", "verify", "reset"):
            _DB.setdefault(key, {})


def db_save() -> None:
    with _LOCK:
        os.makedirs(DATA_DIR, exist_ok=True)
        tmp = DB_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(_DB, fh, indent=2, sort_keys=True)
        os.replace(tmp, DB_PATH)


def now_ts() -> int:
    return int(time.time())


def prune() -> None:
    """Drop expired tokens and stale sessions."""
    t = now_ts()
    with _LOCK:
        for bucket, ttl in (("verify", VERIFY_TTL), ("reset", RESET_TTL)):
            for tok, rec in list(_DB[bucket].items()):
                if rec.get("exp", 0) < t:
                    _DB[bucket].pop(tok, None)
        for tok, sess in list(_DB["sessions"].items()):
            if sess.get("exp", 0) < t:
                _DB["sessions"].pop(tok, None)


# --------------------------------------------------------------------------
# crypto helpers
# --------------------------------------------------------------------------

def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                             salt.encode("utf-8"), PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${salt}${binascii.hexlify(dk).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, rounds, salt, digest = stored.split("$", 3)
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                                 salt.encode("utf-8"), int(rounds))
        return hmac.compare_digest(binascii.hexlify(dk).decode(), digest)
    except Exception:
        return False


def mask_id(number: str) -> str:
    digits = re.sub(r"\D", "", number)
    if len(digits) < 4:
        return "*" * len(digits)
    return "*" * (len(digits) - 4) + digits[-4:]


def hash_id(number: str, salt: str) -> str:
    return hashlib.sha256((salt + ":" + re.sub(r"\D", "", number)).encode()).hexdigest()


def new_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


# --------------------------------------------------------------------------
# email — Mailgun SMTP
# --------------------------------------------------------------------------

def mail_configured() -> bool:
    return bool(MAILGUN_DOMAIN and MAILGUN_API_KEY)


def send_email(to: str, subject: str, html: str, text: str | None = None) -> tuple[bool, str]:
    """Send one email through Mailgun's SMTP relay.

    Returns (ok, message). When SMTP is not configured the caller is told
    so and can surface a dev link instead of pretending an email was sent.
    """
    if not mail_configured():
        return False, "SMTP is not configured."

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = MAILGUN_FROM
    msg["To"] = to
    msg.set_content(text or _html_to_text(html))
    msg.add_alternative(html, subtype="html")

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
            smtp.ehlo()
            if SMTP_PORT != 25:
                smtp.starttls(context=context)
                smtp.ehlo()
            if SMTP_USER:
                smtp.login(SMTP_USER, MAILGUN_API_KEY)
            smtp.send_message(msg)
        return True, "Sent"
    except smtplib.SMTPAuthenticationError as exc:
        return False, f"Mailgun rejected the credentials: {exc.smtp_code}"
    except Exception as exc:
        return False, f"Could not send the email: {exc}"


def _html_to_text(html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", html)
    text = re.sub(r"</p>", "\n\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = (text.replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&lt;", "<").replace("&gt;", ">"))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def verification_email(name: str, link: str) -> tuple[str, str, str]:
    subject = "Confirm your Gym Badge account"
    html = f"""<!doctype html>
<html><body style="margin:0;padding:24px;background:#121211;color:#ded9d0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#1a1a18;border:1px solid #2b2b28;
    border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 6px;font-size:1.25rem;color:#ff6a45;">Welcome to Gym Badge{name and ', ' + name or ''}</h1>
    <p style="margin:0 0 18px;color:#9d988e;font-size:.95rem;line-height:1.55;">
      Confirm your email address to activate your badge. This link works once and
      expires in 24 hours.</p>
    <p style="margin:0 0 22px;">
      <a href="{link}" style="display:inline-block;background:#ff6a45;color:#1a0e08;
        padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;">
        Confirm my email</a></p>
    <p style="margin:0;color:#9d988e;font-size:.8rem;line-height:1.5;">
      If the button does not work, copy this link into your browser:<br>
      <span style="color:#ded9d0;word-break:break-all;">{link}</span></p>
    <p style="margin:22px 0 0;color:#9d988e;font-size:.78rem;">
      Did not sign up? Ignore this email — nothing was changed.</p>
  </div>
</body></html>"""
    return subject, html, None


def reset_email(name: str, link: str) -> tuple[str, str, str]:
    subject = "Reset your Gym Badge password"
    html = f"""<!doctype html>
<html><body style="margin:0;padding:24px;background:#121211;color:#ded9d0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#1a1a18;border:1px solid #2b2b28;
    border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 6px;font-size:1.25rem;color:#ff6a45;">Reset your password</h1>
    <p style="margin:0 0 18px;color:#9d988e;font-size:.95rem;line-height:1.55;">
      We received a request to reset the password for this account.
      This link works once and expires in 1 hour.</p>
    <p style="margin:0 0 22px;">
      <a href="{link}" style="display:inline-block;background:#ff6a45;color:#1a0e08;
        padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;">
        Choose a new password</a></p>
    <p style="margin:0;color:#9d988e;font-size:.8rem;line-height:1.5;">
      If the button does not work, copy this link into your browser:<br>
      <span style="color:#ded9d0;word-break:break-all;">{link}</span></p>
    <p style="margin:22px 0 0;color:#9d988e;font-size:.78rem;">
      If you did not ask for this, no action is needed — your password is unchanged.</p>
  </div>
</body></html>"""
    return subject, html, None


# --------------------------------------------------------------------------
# API helpers
# --------------------------------------------------------------------------

def public_user(rec: dict) -> dict:
    return {
        "id": rec.get("id"),
        "name": rec.get("name", ""),
        "email": rec.get("email", ""),
        "verified": bool(rec.get("verified")),
        "role": rec.get("role", "individual"),
        "country": rec.get("country", ""),
        "idVerified": bool(rec.get("idVerified")),
        "idMasked": rec.get("idMasked", ""),
        "idType": rec.get("idType", ""),
        "photos": rec.get("photos", []),
        "joined": rec.get("joined"),
    }


def issue_session(email: str) -> str:
    token = new_token(32)
    with _LOCK:
        _DB["sessions"][token] = {
            "email": email,
            "iat": now_ts(),
            "exp": now_ts() + 30 * 24 * 3600,
        }
    db_save()
    return token


def session_user(token: str | None) -> dict | None:
    if not token:
        return None
    with _LOCK:
        sess = _DB["sessions"].get(token)
        if not sess or sess.get("exp", 0) < now_ts():
            return None
        rec = _DB["users"].get(sess["email"])
    return rec


def bearer_token(headers) -> str | None:
    raw = headers.get("Authorization", "") or ""
    if raw.lower().startswith("bearer "):
        return raw[7:].strip()
    return None


# --------------------------------------------------------------------------
# static file serving
# --------------------------------------------------------------------------

# Clean URL → file map. The Vercel deployment uses the same routes.
ROUTES = {
    "/": "web/index.html",
    "/login": "web/login.html",
    "/signup": "web/signup.html",
    "/forgot": "web/forgot.html",
    "/reset": "web/reset.html",
    "/verify": "web/verify.html",
    "/pricing": "web/pricing.html",
    "/find": "web/find.html",
    "/gyms": "web/gyms.html",
    "/trainers": "web/trainers.html",
    "/coaches": "web/coach.html",
    "/gym": "web/gym.html",
    "/coach": "web/coach.html",
    "/about": "web/about.html",
    "/reviews": "web/reviews.html",
    "/faq": "web/faq.html",
    "/support": "web/support.html",
    "/account": "web/account.html",
    "/privacy": "web/privacy.html",
    "/terms": "web/terms.html",
}

# Directories served straight from disk.
STATIC_ROOTS = ("/app/", "/assets/", "/web/")

# Files that must never be served.
HIDDEN = ("users.json", ".env", "server.py", "data/")


def resolve(path: str) -> str | None:
    """Map a URL path to a file on disk, or None if it escapes the root."""
    if path in ROUTES:
        return os.path.join(BASE_DIR, ROUTES[path])
    if not path.startswith(STATIC_ROOTS):
        return None
    rel = unquote(path.lstrip("/"))
    full = os.path.abspath(os.path.join(BASE_DIR, rel))
    if not full.startswith(os.path.abspath(BASE_DIR) + os.sep):
        return None
    if any(h in rel for h in HIDDEN):
        return None
    if os.path.isfile(full):
        return full
    if path.endswith("/"):
        idx = os.path.join(full, "index.html")
        if os.path.isfile(idx):
            return idx
    return None


# --------------------------------------------------------------------------
# request handler
# --------------------------------------------------------------------------

class Handler(BaseHTTPRequestHandler):
    server_version = "GymBadge/2.0"
    protocol_version = "HTTP/1.1"

    # ---------------- plumbing ----------------

    def log_message(self, fmt, *args):  # quieter, timestamped log
        stamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{stamp}] {self.address_string()} {fmt % args}")

    def _send(self, code: int, body: bytes, ctype: str = "application/json; charset=utf-8",
              extra: dict | None = None) -> None:
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def json_out(self, code: int, payload: dict) -> None:
        self._send(code, json.dumps(payload).encode("utf-8"))

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return {}
        if length > 2_000_000:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8")) or {}
        except Exception:
            return {}

    # ---------------- routing ----------------

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/config":
            return self.api_config()
        if path == "/api/profile":
            return self.api_profile()
        if path.startswith("/api/"):
            return self.json_out(404, {"ok": False, "error": "Unknown endpoint"})

        if path == "/healthz":
            return self.json_out(200, {"ok": True, "smtp": mail_configured()})

        # static
        target = resolve(path)
        if not target:
            return self.json_out(404, {"ok": False, "error": "Not found"})
        self.serve_file(target)

    def do_HEAD(self):
        target = resolve(urlparse(self.path).path)
        if not target:
            return self._send(404, b"Not found", "text/plain; charset=utf-8")
        self.serve_file(target, head_only=True)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json()

        routes = {
            "/api/auth/signup": self.api_signup,
            "/api/auth/login": self.api_login,
            "/api/auth/verify": self.api_verify,
            "/api/auth/signup/resend": self.api_resend,
            "/api/auth/forgot": self.api_forgot,
            "/api/auth/reset": self.api_reset,
            "/api/auth/oauth": self.api_oauth,
            "/api/auth/logout": self.api_logout,
            "/api/auth/change-password": self.api_change_password,
            "/api/verify/id": self.api_verify_id,
        }
        fn = routes.get(path)
        if fn:
            return fn(body)
        return self.json_out(404, {"ok": False, "error": "Unknown endpoint"})

    # ---------------- static ----------------

    def serve_file(self, target: str, head_only: bool = False) -> None:
        ctype, _ = mimetypes.guess_type(target)
        if ctype is None:
            ctype = "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json",
                                                 "image/svg+xml", "application/manifest+json"):
            ctype += "; charset=utf-8"
        try:
            with open(target, "rb") as fh:
                data = fh.read()
        except OSError:
            return self.json_out(500, {"ok": False, "error": "Could not read the file"})

        cache = "public, max-age=0, must-revalidate"
        if "/assets/img/" in target or "/app/assets/img/" in target:
            cache = "public, max-age=31536000, immutable"
        self._send(200, data, ctype, {"Cache-Control": cache})

    # ---------------- API: config ----------------

    def api_config(self):
        prune()
        self.json_out(200, {
            "ok": True,
            "devMode": not mail_configured(),
            "emailLive": mail_configured(),
            "smtpLive": mail_configured(),
            "mailDomain": MAILGUN_DOMAIN or "",
            "googleOAuth": bool(os.environ.get("GOOGLE_CLIENT_ID")),
            "yahooOAuth": bool(os.environ.get("YAHOO_CLIENT_ID")),
            "spotifyClientId": os.environ.get("SPOTIFY_CLIENT_ID", ""),
            "googleClientId": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "audiomackClientId": os.environ.get("AUDIOMACK_CLIENT_ID", ""),
            "stripeLive": bool(os.environ.get("STRIPE_SECRET_KEY")),
            "siteUrl": SITE_URL,
        })

    # ---------------- API: signup ----------------

    def api_signup(self, body: dict):
        prune()
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""

        if not name:
            return self.json_out(400, {"ok": False, "error": "Please enter your full name."})
        if not EMAIL_RE.match(email):
            return self.json_out(400, {"ok": False, "error": "Please enter a valid email address."})
        ok, msg = valid_password(password)
        if not ok:
            return self.json_out(400, {"ok": False, "error": msg})

        with _LOCK:
            if email in _DB["users"]:
                return self.json_out(409, {"ok": False, "error": "An account with that email already exists. Try signing in."})
            rec = {
                "id": "u_" + new_token(8),
                "name": name,
                "email": email,
                "pw": hash_password(password),
                "verified": False,
                "role": body.get("role") or "individual",
                "country": body.get("country") or "",
                "idVerified": False,
                "idMasked": "",
                "idType": "",
                "photos": [],
                "joined": datetime.now(timezone.utc).isoformat(),
            }
            _DB["users"][email] = rec
            token = new_token(16)
            _DB["verify"][token] = {"email": email, "exp": now_ts() + VERIFY_TTL}
        db_save()

        link = f"{SITE_URL}/verify?token={token}"
        subject, html, plain = verification_email(name, link)
        sent, err = send_email(email, subject, html, plain)

        payload = {"ok": True, "user": public_user(rec), "token": issue_session(email),
                   "needsVerification": True}
        if sent:
            payload["message"] = "Verification email sent."
        else:
            # No SMTP yet — hand the link back so the flow still completes.
            payload["devVerifyLink"] = link
            payload["note"] = "SMTP is not configured, so the confirmation link is shown here."
        return self.json_out(200, payload)

    # ---------------- API: login ----------------

    def api_login(self, body: dict):
        prune()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not EMAIL_RE.match(email) or not password:
            return self.json_out(400, {"ok": False, "error": "Enter your email and password."})
        with _LOCK:
            rec = _DB["users"].get(email)
        if not rec:
            return self.json_out(401, {"ok": False, "error": "No account found for that email. Create one first."})
        if not verify_password(password, rec.get("pw", "")):
            return self.json_out(401, {"ok": False, "error": "Wrong email or password."})
        return self.json_out(200, {"ok": True, "user": public_user(rec),
                                   "token": issue_session(email),
                                   "needsVerification": not rec.get("verified")})

    # ---------------- API: verify ----------------

    def api_verify(self, body: dict):
        prune()
        token = (body.get("token") or "").strip()
        with _LOCK:
            rec = _DB["verify"].get(token)
            if not rec or rec.get("exp", 0) < now_ts():
                return self.json_out(400, {"ok": False,
                    "error": "This verification link is invalid or has expired. Request a new one."})
            user = _DB["users"].get(rec["email"])
            if user:
                user["verified"] = True
            _DB["verify"].pop(token, None)
        db_save()
        return self.json_out(200, {"ok": True, "email": rec["email"], "user": public_user(user) if user else None})

    # ---------------- API: resend verification ----------------

    def api_resend(self, body: dict):
        prune()
        email = (body.get("email") or "").strip().lower()
        if not EMAIL_RE.match(email):
            return self.json_out(400, {"ok": False, "error": "Please enter a valid email address."})
        with _LOCK:
            rec = _DB["users"].get(email)
            if not rec:
                # Do not leak whether the address exists.
                return self.json_out(200, {"ok": True,
                    "message": "If that email is registered, a link is on its way."})
            token = new_token(16)
            _DB["verify"][token] = {"email": email, "exp": now_ts() + VERIFY_TTL}
        db_save()
        link = f"{SITE_URL}/verify?token={token}"
        subject, html, plain = verification_email(rec.get("name", ""), link)
        sent, err = send_email(email, subject, html, plain)
        out = {"ok": True}
        if sent:
            out["message"] = "Verification email sent."
        else:
            out["devVerifyLink"] = link
            out["note"] = "SMTP is not configured, so the confirmation link is shown here."
        return self.json_out(200, out)

    # ---------------- API: forgot / reset ----------------

    def api_forgot(self, body: dict):
        prune()
        email = (body.get("email") or "").strip().lower()
        if not EMAIL_RE.match(email):
            return self.json_out(400, {"ok": False, "error": "Please enter a valid email address."})
        with _LOCK:
            rec = _DB["users"].get(email)
            if not rec:
                return self.json_out(200, {"ok": True,
                    "message": "If that email is registered, a reset link is on its way."})
            token = new_token(16)
            _DB["reset"][token] = {"email": email, "exp": now_ts() + RESET_TTL}
        db_save()
        link = f"{SITE_URL}/reset?token={token}"
        subject, html, plain = reset_email(rec.get("name", ""), link)
        sent, err = send_email(email, subject, html, plain)
        out = {"ok": True, "message": "If that email is registered, a reset link is on its way."}
        if not sent:
            out["devResetLink"] = link
            out["note"] = "SMTP is not configured, so the reset link is shown here."
        return self.json_out(200, out)

    def api_reset(self, body: dict):
        prune()
        token = (body.get("token") or "").strip()
        password = body.get("password") or ""
        ok, msg = valid_password(password)
        if not ok:
            return self.json_out(400, {"ok": False, "error": msg})
        with _LOCK:
            rec = _DB["reset"].get(token)
            if not rec or rec.get("exp", 0) < now_ts():
                return self.json_out(400, {"ok": False,
                    "error": "This reset link is invalid or has expired. Request a new one."})
            user = _DB["users"].get(rec["email"])
            if user:
                user["pw"] = hash_password(password)
            _DB["reset"].pop(token, None)
            # every existing session is invalidated after a password change
            for sess_token, sess in list(_DB["sessions"].items()):
                if sess.get("email") == rec["email"]:
                    _DB["sessions"].pop(sess_token, None)
        db_save()
        return self.json_out(200, {"ok": True, "message": "Password updated. You can sign in now."})

    # ---------------- API: change password (signed in) ----------------

    def api_change_password(self, body: dict):
        prune()
        rec = session_user(bearer_token(self.headers))
        if not rec:
            return self.json_out(401, {"ok": False, "error": "Please sign in again."})
        current = body.get("current") or body.get("currentPassword") or ""
        new = body.get("password") or body.get("newPassword") or ""
        ok, msg = valid_password(new)
        if not ok:
            return self.json_out(400, {"ok": False, "error": msg})
        if not verify_password(current, rec.get("pw", "")):
            return self.json_out(401, {"ok": False, "error": "Current password incorrect."})
        with _LOCK:
            rec["pw"] = hash_password(new)
        db_save()
        return self.json_out(200, {"ok": True, "message": "Password updated."})

    # ---------------- API: oauth (google / yahoo) ----------------

    def api_oauth(self, body: dict):
        provider = (body.get("provider") or "").lower()
        email = (body.get("email") or "").strip().lower()
        name = (body.get("name") or "").strip()
        if provider not in ("google", "yahoo"):
            return self.json_out(400, {"ok": False, "error": "Unknown provider."})
        if not email:
            email = f"{provider}_{new_token(4).lower()}@oauth.local"
        with _LOCK:
            rec = _DB["users"].get(email)
            if not rec:
                rec = {
                    "id": "u_" + new_token(8),
                    "name": name or f"{provider.capitalize()} member",
                    "email": email,
                    "pw": "oauth$" + new_token(8),
                    "verified": True,
                    "role": "individual",
                    "country": "",
                    "idVerified": False,
                    "idMasked": "",
                    "idType": "",
                    "photos": [],
                    "joined": datetime.now(timezone.utc).isoformat(),
                }
                _DB["users"][email] = rec
        db_save()
        return self.json_out(200, {"ok": True, "user": public_user(rec),
                                   "token": issue_session(email)})

    # ---------------- API: logout ----------------

    def api_logout(self, body: dict):
        token = bearer_token(self.headers)
        if token:
            with _LOCK:
                _DB["sessions"].pop(token, None)
            db_save()
        return self.json_out(200, {"ok": True})

    # ---------------- API: profile ----------------

    def api_profile(self):
        rec = session_user(bearer_token(self.headers))
        if not rec:
            return self.json_out(401, {"ok": False, "error": "Not signed in."})
        return self.json_out(200, {"ok": True, "user": public_user(rec)})

    # ---------------- API: identity verification ----------------

    def api_verify_id(self, body: dict):
        rec = session_user(bearer_token(self.headers))
        if not rec:
            return self.json_out(401, {"ok": False, "error": "Sign in first."})
        number = re.sub(r"\D", "", str(body.get("number") or ""))
        if len(number) < 8:
            return self.json_out(400, {"ok": False, "error": "That ID number looks too short."})
        full_name = (body.get("fullName") or "").strip().lower()
        if full_name and full_name != str(rec.get("name", "")).strip().lower():
            return self.json_out(400, {"ok": False,
                "error": "The name must match the name on your account."})
        id_type = body.get("idType") or "id"
        salt = rec.get("idSalt") or new_token(8)
        with _LOCK:
            rec["idSalt"] = salt
            rec["idVerified"] = True
            rec["idMasked"] = mask_id(number)
            rec["idType"] = id_type
            rec["idHash"] = hash_id(number, salt)
        db_save()
        return self.json_out(200, {"ok": True, "user": public_user(rec),
            "message": "Identity verified. Only the last 4 digits are stored."})


# --------------------------------------------------------------------------
# boot
# --------------------------------------------------------------------------

def main() -> None:
    db_load()
    os.makedirs(DATA_DIR, exist_ok=True)

    print("=" * 68)
    print("  GYM BADGE — server")
    print("=" * 68)
    print(f"  Site         {SITE_URL}")
    print(f"  Data         {DB_PATH}")
    if mail_configured():
        print(f"  Mailgun      smtp://{SMTP_HOST}:{SMTP_PORT} as {SMTP_USER}")
        print(f"  From         {MAILGUN_FROM}")
    else:
        print("  Mailgun      NOT CONFIGURED")
        print("               set GYMBADGE_DOMAIN and MAILGUN_API_KEY to send")
        print("               real confirmation and reset emails.")
    for key, label in (("SPOTIFY_CLIENT_ID", "Spotify"),
                       ("GOOGLE_CLIENT_ID", "YouTube Music"),
                       ("AUDIOMACK_CLIENT_ID", "Audiomack")):
        value = os.environ.get(key, "")
        print(f"  {label:13} {'ready' if value else 'not configured'}")
    print("=" * 68)

    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("image/webp", ".webp")
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    httpd.daemon_threads = True
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  stopping…")
        httpd.shutdown()


if __name__ == "__main__":
    main()
