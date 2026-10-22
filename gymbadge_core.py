#!/usr/bin/env python3
"""
GYM BADGE — application core
=============================

The shared heart of Gym Badge: account storage, password hashing, one-time
tokens, Mailgun email delivery and the JSON API.

Two front ends use this module, so behaviour can never drift between them:

  • ``server.py``  — a standalone standard-library HTTP server that serves
    the whole site and the API from one process (great for local work and
    for any host that runs a Python process).

  • ``api/index.py`` — a Vercel serverless function that exposes exactly
    the same API on production.

Security notes
--------------
  * Passwords are stored as PBKDF2-HMAC-SHA256 with a per-user random salt
    and 600,000 iterations. Plaintext passwords are never written to disk
    and never leave the process.
  * Session tokens are 32-byte secrets from ``secrets``, compared with
    ``hmac.compare_digest``, and stored server-side so they can be revoked.
  * Verification and reset tokens are single-use and expire (24 h and 1 h).
  * A password reset revokes every existing session for that account.
  * Identity numbers (NIN / SSN / passport) are NEVER stored in clear. They
    are masked to the last four digits and stored alongside a salted hash.
  * The API is same-origin only: CORS is not enabled, and every mutating
    route requires either a session token or a one-time emailed token.

Configuration (environment variables)
-------------------------------------
  GYMBADGE_DOMAIN        Mailgun sending domain        (e.g. mg.gymbadge.app)
  MAILGUN_API_KEY        Mailgun API key (also the SMTP password)
  MAILGUN_FROM           Envelope/From address          (optional)
  GYMBADGE_SMTP_HOST     default smtp.mailgun.org
  GYMBADGE_SMTP_PORT     default 587
  GYMBADGE_SITE_URL      public base URL for links
  GYMBADGE_DATA_DIR      where users.json lives         (default ./data)
  SPOTIFY_CLIENT_ID      enables the Spotify music connection
  GOOGLE_CLIENT_ID       enables the YouTube Music connection
  AUDIOMACK_CLIENT_ID    enables the Audiomack music connection
"""

from __future__ import annotations

import binascii
import hashlib
import hmac
import json
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

# --------------------------------------------------------------------------
# configuration
# --------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("GYMBADGE_DATA_DIR") or os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "users.json")


def _writable_dir(preferred: str) -> str:
    """Return a directory we can actually write to.

    On a normal host the project's ``data/`` folder is used. Serverless
    platforms ship a read-only filesystem, so we fall back to the platform's
    writable temp directory and say so loudly — mount a real volume (or point
    GYMBADGE_DATA_DIR at one) to keep accounts across restarts.
    """
    import tempfile
    for candidate in (preferred, os.path.join(tempfile.gettempdir(), "gymbadge")):
        try:
            os.makedirs(candidate, exist_ok=True)
            probe = os.path.join(candidate, ".write-test")
            with open(probe, "w", encoding="utf-8") as fh:
                fh.write("ok")
            os.remove(probe)
            if candidate != preferred:
                print(f"[db] {preferred} is not writable — using {candidate} instead.",
                      file=sys.stderr)
                print("[db] accounts live in temporary storage and reset when the "
                      "instance recycles. Mount a volume or set GYMBADGE_DATA_DIR "
                      "for production.", file=sys.stderr)
            return candidate
        except Exception:
            continue
    return preferred

SITE_URL = (os.environ.get("GYMBADGE_SITE_URL") or "http://localhost:8080").rstrip("/")

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

import gymbadge_content as content  # noqa: E402  (needs _DB and db_save)

_LOCK = threading.RLock()
_DB: dict = {"users": {}, "sessions": {}, "verify": {}, "reset": {}, "revoked": {}}

# The account tables are dictionaries; the review queues and the trainer
# directory are lists. Both have to survive a restart.
_DICT_KEYS = ("users", "sessions", "verify", "reset", "revoked")
_LIST_KEYS = ("trainers", "trainerApplications", "exerciseSubmissions")


def _token_digest(token: str) -> str:
    """A short, non-reversible fingerprint of a token, safe to store."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()[:40]


def revoke_token(token: str) -> None:
    """Block a session token from being used again.

    Stateless tokens are signed, so signing alone cannot "un-sign" one.
    We keep a short-lived revocation list instead, and the token's own
    expiry does the rest of the work.
    """
    if not token:
        return
    with _LOCK:
        _DB.setdefault("revoked", {})[_token_digest(token)] = now_ts() + 60 * 24 * 3600
    db_save()


def is_revoked(token: str) -> bool:
    if not token:
        return False
    with _LOCK:
        revoked = _DB.get("revoked") or {}
        digest = _token_digest(token)
        if digest in revoked:
            if revoked[digest] < now_ts():
                revoked.pop(digest, None)
                db_save()
                return False
            return True
    return False


def db_load() -> None:
    with _LOCK:
        if _store_is_remote():
            try:
                raw = _remote_get()
                if raw:
                    data = json.loads(raw)
                    if isinstance(data, dict):
                        for key in _DICT_KEYS:
                            if isinstance(data.get(key), dict):
                                _DB[key] = data[key]
                        for key in _LIST_KEYS:
                            if isinstance(data.get(key), list):
                                _DB[key] = data[key]
                for key in _DICT_KEYS:
                    _DB.setdefault(key, {})
                for key in _LIST_KEYS:
                    _DB.setdefault(key, [])
                return
            except Exception as exc:
                print(f"[db] could not read the remote store: {exc!r}", file=sys.stderr)
        try:
            with open(DB_PATH, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, dict):
                for key in _DICT_KEYS:
                    if isinstance(data.get(key), dict):
                        _DB[key] = data[key]
                for key in _LIST_KEYS:
                    if isinstance(data.get(key), list):
                        _DB[key] = data[key]
        except FileNotFoundError:
            pass
        except Exception as exc:
            print(f"[db] could not read {DB_PATH}: {exc}", file=sys.stderr)
        for key in _DICT_KEYS:
            _DB.setdefault(key, {})
        for key in _LIST_KEYS:
            _DB.setdefault(key, [])


# --------------------------------------------------------------------------
# optional remote store (Upstash Redis over plain REST)
#
# Serverless platforms recycle their filesystem, so accounts saved to disk
# disappear. Point these two variables at an Upstash database and the
# accounts, sessions and tokens persist for real. With no configuration we
# fall back to the JSON file, which is perfect for local work and for a
# single long-running host.
# --------------------------------------------------------------------------

UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL", "").rstrip("/")
UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN", "")
STORE_KEY = os.environ.get("GYMBADGE_STORE_KEY", "gymbadge:db")


def _store_is_remote() -> bool:
    return bool(UPSTASH_URL and UPSTASH_TOKEN)


def _remote_get() -> str | None:
    import urllib.request
    req = urllib.request.Request(f"{UPSTASH_URL}/get/{STORE_KEY}")
    req.add_header("Authorization", f"Bearer {UPSTASH_TOKEN}")
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data.get("result")


def _remote_set(value: str) -> None:
    import urllib.parse
    import urllib.request
    url = f"{UPSTASH_URL}/set/{urllib.parse.quote(STORE_KEY)}"
    req = urllib.request.Request(url, data=value.encode("utf-8"), method="POST")
    req.add_header("Authorization", f"Bearer {UPSTASH_TOKEN}")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp.read()


def db_save() -> None:
    """Persist the store. A storage failure must never break a request."""
    with _LOCK:
        if _store_is_remote():
            try:
                _remote_set(json.dumps(_DB))
                return
            except Exception as exc:
                print(f"[db] could not save to the remote store: {exc!r}", file=sys.stderr)
                return
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            tmp = DB_PATH + ".tmp"
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(_DB, fh, indent=2, sort_keys=True)
            os.replace(tmp, DB_PATH)
        except Exception as exc:
            # The account still works for this request; we just could not
            # write it down. Say so instead of failing the whole call.
            print(f"[db] could not save: {exc!r}", file=sys.stderr)


def now_ts() -> int:
    return int(time.time())


def prune() -> None:
    """Drop expired tokens and stale sessions."""
    t = now_ts()
    with _LOCK:
        for bucket in ("verify", "reset"):
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


def verification_email(name: str, link: str) -> tuple[str, str]:
    subject = "Confirm your Gym Badge account"
    greeting = f", {name}" if name else ""
    html = f"""<!doctype html>
<html><body style="margin:0;padding:24px;background:#121211;color:#ded9d0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#1a1a18;border:1px solid #2b2b28;
    border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 6px;font-size:1.25rem;color:#ff6a45;">Welcome to Gym Badge{greeting}</h1>
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
      Did not sign up? Ignore this email &mdash; nothing was changed.</p>
  </div>
</body></html>"""
    return subject, html


def reset_email(name: str, link: str) -> tuple[str, str]:
    subject = "Reset your Gym Badge password"
    greeting = f", {name}" if name else ""
    html = f"""<!doctype html>
<html><body style="margin:0;padding:24px;background:#121211;color:#ded9d0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#1a1a18;border:1px solid #2b2b28;
    border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 6px;font-size:1.25rem;color:#ff6a45;">Reset your password</h1>
    <p style="margin:0 0 18px;color:#9d988e;font-size:.95rem;line-height:1.55;">
      We received a request to reset the password for this account{greeting}.
      This link works once and expires in 1 hour.</p>
    <p style="margin:0 0 22px;">
      <a href="{link}" style="display:inline-block;background:#ff6a45;color:#1a0e08;
        padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:700;">
        Choose a new password</a></p>
    <p style="margin:0;color:#9d988e;font-size:.8rem;line-height:1.5;">
      If the button does not work, copy this link into your browser:<br>
      <span style="color:#ded9d0;word-break:break-all;">{link}</span></p>
    <p style="margin:22px 0 0;color:#9d988e;font-size:.78rem;">
      If you did not ask for this, no action is needed &mdash; your password is unchanged.</p>
  </div>
</body></html>"""
    return subject, html


# --------------------------------------------------------------------------
# session helpers
# --------------------------------------------------------------------------

def public_user(rec: dict) -> dict:
    return {
        "id": rec.get("id"),
        "name": rec.get("name", ""),
        "email": rec.get("email", ""),
        "verified": bool(rec.get("verified")),
        "role": rec.get("role", "individual"),
        "country": rec.get("country", ""),
        "countryCode": rec.get("countryCode", ""),
        "phone": rec.get("phone", ""),
        "idVerified": bool(rec.get("idVerified")),
        "idMasked": rec.get("idMasked", ""),
        "idType": rec.get("idType", ""),
        "photos": rec.get("photos", []),
        "joined": rec.get("joined"),
    }


def _secret() -> str:
    """The key used to sign session tokens.

    A stable secret is essential: serverless platforms run many instances,
    and a token signed with a per-instance secret would be rejected the
    moment the next request lands somewhere else.
    """
    for key in ("GYMBADGE_SECRET", "MAILGUN_API_KEY", "UPSTASH_REDIS_REST_TOKEN"):
        value = os.environ.get(key, "")
        if value:
            return value
    # Single-host fallback: keep the generated secret next to the data so it
    # survives a restart.
    global _LOCAL_SECRET
    if _LOCAL_SECRET:
        return _LOCAL_SECRET
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        path = os.path.join(DATA_DIR, "secret.key")
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as fh:
                _LOCAL_SECRET = fh.read().strip()
                if _LOCAL_SECRET:
                    return _LOCAL_SECRET
        _LOCAL_SECRET = new_token(32)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(_LOCAL_SECRET)
        return _LOCAL_SECRET
    except Exception:
        _LOCAL_SECRET = new_token(32)
        return _LOCAL_SECRET


_LOCAL_SECRET = ""


def _sign(payload: str) -> str:
    mac = hmac.new(_secret().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).digest()
    return binascii.hexlify(mac).decode("ascii")


def issue_session(email: str) -> str:
    """Issue a signed, self-contained session token.

    The token carries the member's public profile, so a request landing on
    a different serverless instance can still identify them without a
    round trip to shared storage. The token is HMAC-signed and expires.
    """
    with _LOCK:
        rec = _DB["users"].get(email)
    profile = public_user(rec) if rec else {"email": email}
    payload = binascii.hexlify(json.dumps({
        "email": email,
        "exp": now_ts() + 30 * 24 * 3600,
        "p": profile,
    }, separators=(",", ":")).encode("utf-8")).decode("ascii")
    return "v2." + payload + "." + _sign(payload)


def _read_session(token: str) -> dict | None:
    """Validate a signed session token and return its payload."""
    if not token or not token.startswith("v2."):
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    payload, sig = parts[1], parts[2]
    if not hmac.compare_digest(sig, _sign(payload)):
        return None
    try:
        data = json.loads(binascii.unhexlify(payload).decode("utf-8"))
    except Exception:
        return None
    if data.get("exp", 0) < now_ts():
        return None
    return data


def session_user(token: str | None) -> dict | None:
    """Return the member behind a session token, or None."""
    if not token:
        return None
    if is_revoked(token):
        return None

    # Signed (stateless) sessions work on any instance.
    data = _read_session(token)
    if data:
        email = data.get("email")
        with _LOCK:
            rec = _DB["users"].get(email)
        if rec:
            return rec
        # The account may live in shared storage that this instance has not
        # loaded yet — fall back to the snapshot inside the token.
        return {"id": (data.get("p") or {}).get("id"), "name": (data.get("p") or {}).get("name", ""),
                "email": email, "verified": bool((data.get("p") or {}).get("verified")),
                "role": (data.get("p") or {}).get("role", "individual"),
                "country": (data.get("p") or {}).get("country", ""),
                "idVerified": bool((data.get("p") or {}).get("idVerified")),
                "idMasked": (data.get("p") or {}).get("idMasked", ""),
                "idType": (data.get("p") or {}).get("idType", ""),
                "photos": (data.get("p") or {}).get("photos", []),
                "joined": (data.get("p") or {}).get("joined")}

    # Legacy server-side sessions.
    with _LOCK:
        sess = _DB["sessions"].get(token)
        if not sess or sess.get("exp", 0) < now_ts():
            return None
        rec = _DB["users"].get(sess["email"])
    return rec


def bearer_token(headers) -> str | None:
    """Pull the bearer token out of the request headers.

    A plain dict (the stdlib server) uses "Authorization"; a WSGI environ
    uses "HTTP_AUTHORIZATION". Both are checked so the same core works
    behind either front end.
    """
    if not headers:
        return None
    raw = ""
    try:
        raw = headers.get("Authorization") or headers.get("HTTP_AUTHORIZATION") or ""
    except Exception:
        return None
    if raw.lower().startswith("bearer "):
        return raw[7:].strip()
    return None


# --------------------------------------------------------------------------
# the API — every route returns (http_status, json_payload)
# --------------------------------------------------------------------------

def api_config() -> tuple[int, dict]:
    return (200, {
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


def api_profile(headers) -> tuple[int, dict]:
    rec = session_user(bearer_token(headers))
    if not rec:
        return (401, {"ok": False, "error": "Not signed in."})
    return (200, {"ok": True, "user": public_user(rec)})


def api_signup(body: dict, headers) -> tuple[int, dict]:
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not name:
        return (400, {"ok": False, "error": "Please enter your full name."})
    if not EMAIL_RE.match(email):
        return (400, {"ok": False, "error": "Please enter a valid email address."})
    ok, msg = valid_password(password)
    if not ok:
        return (400, {"ok": False, "error": msg})

    with _LOCK:
        if email in _DB["users"]:
            return (409, {"ok": False,
                          "error": "An account with that email already exists. Try signing in."})
        rec = {
            "id": "u_" + new_token(8),
            "name": name,
            "email": email,
            "pw": hash_password(password),
            "verified": False,
            "role": body.get("role") or "individual",
            "country": body.get("country") or "",
            "countryCode": body.get("countryCode") or "",
            "phone": body.get("phone") or "",
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
    subject, html = verification_email(name, link)
    sent, _err = send_email(email, subject, html)

    payload = {"ok": True, "user": public_user(rec), "token": issue_session(email),
               "needsVerification": True}
    if sent:
        payload["message"] = "Verification email sent."
    else:
        payload["devVerifyLink"] = link
        payload["note"] = "SMTP is not configured, so the confirmation link is shown here."
    return (200, payload)


def api_login(body: dict, headers) -> tuple[int, dict]:
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not EMAIL_RE.match(email) or not password:
        return (400, {"ok": False, "error": "Enter your email and password."})
    with _LOCK:
        rec = _DB["users"].get(email)
    if not rec:
        return (401, {"ok": False, "error": "No account found for that email. Create one first."})
    if not verify_password(password, rec.get("pw", "")):
        return (401, {"ok": False, "error": "Wrong email or password."})
    return (200, {"ok": True, "user": public_user(rec),
                  "token": issue_session(email),
                  "needsVerification": not rec.get("verified")})


def api_verify(body: dict, headers) -> tuple[int, dict]:
    token = (body.get("token") or "").strip()
    with _LOCK:
        rec = _DB["verify"].get(token)
        if not rec or rec.get("exp", 0) < now_ts():
            return (400, {"ok": False,
                          "error": "This verification link is invalid or has expired. Request a new one."})
        user = _DB["users"].get(rec["email"])
        if user:
            user["verified"] = True
        _DB["verify"].pop(token, None)
    db_save()
    return (200, {"ok": True, "email": rec["email"],
                  "user": public_user(user) if user else None})


def api_resend(body: dict, headers) -> tuple[int, dict]:
    email = (body.get("email") or "").strip().lower()
    if not EMAIL_RE.match(email):
        return (400, {"ok": False, "error": "Please enter a valid email address."})
    with _LOCK:
        rec = _DB["users"].get(email)
        if not rec:
            # Do not leak whether the address exists.
            return (200, {"ok": True,
                          "message": "If that email is registered, a link is on its way."})
        token = new_token(16)
        _DB["verify"][token] = {"email": email, "exp": now_ts() + VERIFY_TTL}
    db_save()
    link = f"{SITE_URL}/verify?token={token}"
    subject, html = verification_email(rec.get("name", ""), link)
    sent, _err = send_email(email, subject, html)
    out = {"ok": True}
    if sent:
        out["message"] = "Verification email sent."
    else:
        out["devVerifyLink"] = link
        out["note"] = "SMTP is not configured, so the confirmation link is shown here."
    return (200, out)


def api_forgot(body: dict, headers) -> tuple[int, dict]:
    email = (body.get("email") or "").strip().lower()
    if not EMAIL_RE.match(email):
        return (400, {"ok": False, "error": "Please enter a valid email address."})
    with _LOCK:
        rec = _DB["users"].get(email)
        if not rec:
            return (200, {"ok": True,
                          "message": "If that email is registered, a reset link is on its way."})
        token = new_token(16)
        _DB["reset"][token] = {"email": email, "exp": now_ts() + RESET_TTL}
    db_save()
    link = f"{SITE_URL}/reset?token={token}"
    subject, html = reset_email(rec.get("name", ""), link)
    sent, _err = send_email(email, subject, html)
    out = {"ok": True, "message": "If that email is registered, a reset link is on its way."}
    if not sent:
        out["devResetLink"] = link
        out["note"] = "SMTP is not configured, so the reset link is shown here."
    return (200, out)


def api_reset(body: dict, headers) -> tuple[int, dict]:
    token = (body.get("token") or "").strip()
    password = body.get("password") or ""
    ok, msg = valid_password(password)
    if not ok:
        return (400, {"ok": False, "error": msg})
    with _LOCK:
        rec = _DB["reset"].get(token)
        if not rec or rec.get("exp", 0) < now_ts():
            return (400, {"ok": False,
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
    return (200, {"ok": True, "message": "Password updated. You can sign in now."})


def api_change_password(body: dict, headers) -> tuple[int, dict]:
    rec = session_user(bearer_token(headers))
    if not rec:
        return (401, {"ok": False, "error": "Please sign in again."})
    current = body.get("current") or body.get("currentPassword") or ""
    new = body.get("password") or body.get("newPassword") or ""
    ok, msg = valid_password(new)
    if not ok:
        return (400, {"ok": False, "error": msg})
    if not verify_password(current, rec.get("pw", "")):
        return (401, {"ok": False, "error": "Current password incorrect."})
    with _LOCK:
        rec["pw"] = hash_password(new)
    db_save()
    return (200, {"ok": True, "message": "Password updated."})


def api_oauth(body: dict, headers) -> tuple[int, dict]:
    provider = (body.get("provider") or "").lower()
    email = (body.get("email") or "").strip().lower()
    name = (body.get("name") or "").strip()
    if provider not in ("google", "yahoo"):
        return (400, {"ok": False, "error": "Unknown provider."})
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
    return (200, {"ok": True, "user": public_user(rec), "token": issue_session(email)})


def api_logout(body: dict, headers) -> tuple[int, dict]:
    token = bearer_token(headers)
    if token:
        revoke_token(token)
        with _LOCK:
            _DB["sessions"].pop(token, None)
        db_save()
    return (200, {"ok": True})


def api_verify_id(body: dict, headers) -> tuple[int, dict]:
    rec = session_user(bearer_token(headers))
    if not rec:
        return (401, {"ok": False, "error": "Sign in first."})
    number = re.sub(r"\D", "", str(body.get("number") or ""))
    if len(number) < 8:
        return (400, {"ok": False, "error": "That ID number looks too short."})
    full_name = (body.get("fullName") or "").strip().lower()
    if full_name and full_name != str(rec.get("name", "")).strip().lower():
        return (400, {"ok": False,
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
    return (200, {"ok": True, "user": public_user(rec),
                  "message": "Identity verified. Only the last 4 digits are stored."})


ROUTE_TABLE = {
    "POST /api/auth/signup": api_signup,
    "POST /api/auth/login": api_login,
    "POST /api/auth/verify": api_verify,
    "POST /api/auth/signup/resend": api_resend,
    "POST /api/auth/forgot": api_forgot,
    "POST /api/auth/reset": api_reset,
    "POST /api/auth/oauth": api_oauth,
    "POST /api/auth/logout": api_logout,
    "POST /api/auth/change-password": api_change_password,
    "POST /api/verify/id": api_verify_id,
}


def api_dispatch(method: str, path: str, body: dict, headers, environ=None) -> tuple[int, dict]:
    """Route one API call. Returns (http_status, json_payload)."""
    prune()

    if path == "/api/config" and method == "GET":
        return api_config()
    if path == "/api/profile" and method == "GET":
        return api_profile(headers)
    if path in ("/api/healthz", "/healthz") and method == "GET":
        return (200, {"ok": True, "smtp": mail_configured()})

    # Content, community and assistant endpoints.
    if method == "GET" and path == "/api/trainers":
        return content.api_trainers(body, headers, environ)
    if method == "POST" and path == "/api/chat":
        return content.api_chat(body, headers, environ)
    if method == "POST" and path == "/api/translate":
        return content.api_translate(body, headers, environ)
    if method == "POST" and path == "/api/trainers/apply":
        return content.api_trainer_apply(body, headers, environ)
    if method == "POST" and path == "/api/trainers/review":
        return content.api_trainer_review(body, headers, environ)
    if method == "POST" and path == "/api/exercises/submit":
        return content.api_exercise_submit(body, headers, environ)
    if method == "POST" and path == "/api/exercises/review":
        return content.api_exercise_review(body, headers, environ)
    if method == "POST" and path == "/api/equipment":
        return content.api_equipment_update(body, headers, environ)

    fn = ROUTE_TABLE.get(f"{method} {path}")
    if fn:
        return fn(body or {}, headers)
    return (404, {"ok": False, "error": "Unknown endpoint"})


def bootstrap() -> None:
    """Load the store once per process and make sure we can write to it."""
    global DATA_DIR, DB_PATH
    if not _store_is_remote():
        DATA_DIR = _writable_dir(DATA_DIR)
        DB_PATH = os.path.join(DATA_DIR, "users.json")
        os.makedirs(DATA_DIR, exist_ok=True)
    db_load()
