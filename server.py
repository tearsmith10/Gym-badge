#!/usr/bin/env python3
"""
GYM BADGE — standalone server
=============================

Serves the whole site (the PWA under /app/, the marketing site under /web/,
shared assets under /assets/) **and** the JSON API from one process.

The API logic lives in ``gymbadge_core.py`` and is shared with the Vercel
serverless function in ``api/index.py``, so the two can never drift.

Run
---
    python server.py 8080

Configuration
-------------
    GYMBADGE_DOMAIN      Mailgun sending domain      (e.g. mg.gymbadge.app)
    MAILGUN_API_KEY      Mailgun API key (also the SMTP password)
    MAILGUN_FROM         Envelope/From address        (optional)
    GYMBADGE_SMTP_HOST   default smtp.mailgun.org
    GYMBADGE_SMTP_PORT   default 587
    GYMBADGE_SITE_URL    public base URL used in email links
    GYMBADGE_DATA_DIR    where users.json lives       (default ./data)
    SPOTIFY_CLIENT_ID    enables the Spotify music connection
    GOOGLE_CLIENT_ID     enables the YouTube Music connection
    AUDIOMACK_CLIENT_ID  enables the Audiomack music connection
    GYMBADGE_PORT        listen port                 (default 8080)
"""

from __future__ import annotations

import json
import mimetypes
import os
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import gymbadge_core as core  # noqa: E402

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("GYMBADGE_PORT", "8080"))

# --------------------------------------------------------------------------
# static file serving
# --------------------------------------------------------------------------

# Clean URL -> file map (the same routes Vercel uses).
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
HIDDEN = ("users.json", ".env", "server.py", "gymbadge_core.py", "data/")


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

    def log_message(self, fmt, *args):
        stamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{stamp}] {self.address_string()} {fmt % args}")

    def handle_one_request(self):
        # Browsers drop keep-alive sockets all the time. That is normal
        # and must not print a wall of tracebacks.
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            self.close_connection = True

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
        self._send(code, json_bytes(payload))

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 2_000_000:
            return {}
        try:
            raw = self.rfile.read(length)
            return json.loads(raw.decode("utf-8")) or {}
        except Exception as exc:
            # Never fail silently — a swallowed parse error looks like a
            # mysterious "empty body" to the client.
            print(f"[api] could not parse the request body: {exc!r}", flush=True)
            return {}

    def do_GET(self):
        path = urlparse(self.path).path

        if path.startswith("/api/") or path == "/healthz":
            status, payload = core.api_dispatch("GET", path, {}, self.headers)
            return self.json_out(status, payload)

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
        path = urlparse(self.path).path
        body = self.read_json()
        status, payload = core.api_dispatch("POST", path, body, self.headers)
        self.json_out(status, payload)

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


def json_bytes(payload: dict) -> bytes:
    return json.dumps(payload).encode("utf-8")


# --------------------------------------------------------------------------
# boot
# --------------------------------------------------------------------------

def main() -> None:
    core.bootstrap()

    print("=" * 68)
    print("  GYM BADGE — server")
    print("=" * 68)
    print(f"  Site         {core.SITE_URL}")
    print(f"  Data         {core.DB_PATH}")
    if core.mail_configured():
        print(f"  Mailgun      smtp://{core.SMTP_HOST}:{core.SMTP_PORT} as {core.SMTP_USER}")
        print(f"  From         {core.MAILGUN_FROM}")
    else:
        print("  Mailgun      NOT CONFIGURED")
        print("               set GYMBADGE_DOMAIN and MAILGUN_API_KEY to send")
        print("               real confirmation and reset emails.")
    for key, label in (("SPOTIFY_CLIENT_ID", "Spotify"),
                       ("GOOGLE_CLIENT_ID", "YouTube Music"),
                       ("AUDIOMACK_CLIENT_ID", "Audiomack")):
        print(f"  {label:13} {'ready' if os.environ.get(key) else 'not configured'}")
    print("=" *68)

    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("image/webp", ".webp")
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    httpd.daemon_threads = True
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  stopping...")
        httpd.shutdown()


if __name__ == "__main__":
    main()
