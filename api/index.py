"""
GYM BADGE — Vercel serverless function (the JSON API)

Vercel runs this file for every request under /api/*, so the production
deployment has the same account system, the same one-time tokens and the
same Mailgun email delivery as the local server.

The logic lives in ``gymbadge_core.py`` and is shared with ``server.py``,
so the two can never drift apart.

Routes
------
    GET  /api/config              feature flags (SMTP, OAuth client ids)
    GET  /api/profile             the signed-in member
    GET  /api/healthz             liveness probe
    POST /api/auth/signup         create an account + send a Mailgun code
    POST /api/auth/login          verify a password, issue a session token
    POST /api/auth/verify         confirm an email address
    POST /api/auth/signup/resend  resend the confirmation email
    POST /api/auth/forgot         send a password reset link
    POST /api/auth/reset          set a new password from a reset token
    POST /api/auth/change-password change the password while signed in
    POST /api/auth/oauth          link a Google / Yahoo account
    POST /api/auth/logout         revoke the session
    POST /api/verify/id           optional masked identity verification

Environment variables
---------------------
    GYMBADGE_DOMAIN, MAILGUN_API_KEY, MAILGUN_FROM,
    GYMBADGE_SMTP_HOST, GYMBADGE_SMTP_PORT,
    GYMBADGE_SITE_URL, GYMBADGE_DATA_DIR,
    SPOTIFY_CLIENT_ID, GOOGLE_CLIENT_ID, AUDIOMACK_CLIENT_ID
"""

from __future__ import annotations

import json
import os
import sys
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import gymbadge_core as core  # noqa: E402

core.bootstrap()

STATUS_TEXT = {
    200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized",
    403: "Forbidden", 404: "Not Found", 409: "Conflict",
    500: "Internal Server Error", 502: "Bad Gateway",
}


def _read_body(environ) -> dict:
    """Read and parse a JSON request body.

    Serverless runtimes differ in how they expose the body, so this tries
    CONTENT_LENGTH first and falls back to reading the stream to the end.
    It never blocks forever: if the stream yields nothing, we move on.
    """
    stream = environ.get("wsgi.input")
    if stream is None:
        return {}

    raw = b""
    try:
        length = int(environ.get("CONTENT_LENGTH") or 0)
    except (TypeError, ValueError):
        length = 0

    try:
        if length > 0:
            raw = stream.read(length)
        else:
            # No Content-Length — the payload may be chunked. Read what is
            # buffered without blocking on a stream that never closes.
            try:
                raw = stream.read(int(environ.get("HTTP_CONTENT_LENGTH") or 0))
            except Exception:
                raw = b""
            if not raw:
                try:
                    raw = stream.readline()
                except Exception:
                    raw = b""
    except Exception as exc:
        print(f"[api] could not read the body: {exc!r}", file=sys.stderr)
        return {}

    if not raw:
        print(f"[api] empty body (CONTENT_LENGTH={environ.get('CONTENT_LENGTH')!r})",
              file=sys.stderr)
        return {}

    try:
        return json.loads(raw.decode("utf-8")) or {}
    except Exception as exc:
        print(f"[api] could not parse the body: {exc!r}", file=sys.stderr)
        return {}


def app(environ, start_response):
    """WSGI entry point."""
    method = environ.get("REQUEST_METHOD", "GET").upper()
    path = urlparse(environ.get("PATH_INFO", "/")).path

    if method == "OPTIONS":
        start_response("204 No Content", [("Allow", "GET, POST, OPTIONS")])
        return [b""]

    body = _read_body(environ) if method == "POST" else {}

    try:
        status, payload = core.api_dispatch(method, path, body, environ, environ)
    except Exception as exc:  # never leak a stack trace to the client
        print(f"[api] {method} {path} failed: {exc}", file=sys.stderr)
        status, payload = 500, {"ok": False, "error": "Something went wrong on our side."}

    print(f"[api] {method} {path} -> {status} (body keys: {sorted(body.keys()) if body else 'none'})",
          file=sys.stderr)

    data = json.dumps(payload).encode("utf-8")
    headers = [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Content-Length", str(len(data))),
        ("X-Content-Type-Options", "nosniff"),
        ("Cache-Control", "no-store"),
    ]
    start_response(f"{status} {STATUS_TEXT.get(status, 'OK')}", headers)
    return [data]


# Vercel's Python runtime also accepts a BaseHTTPRequestHandler-style
# `handler`; expose it for frameworks that look for that name.
try:
    from http.server import BaseHTTPRequestHandler

    class handler(BaseHTTPRequestHandler):
        def _run(self):
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                body = json.loads(raw.decode("utf-8")) or {}
            except Exception:
                body = {}
            print(f"[api-handler] {self.command} {self.path} -> body keys: "
                  f"{sorted(body.keys()) if body else 'none'}", file=sys.stderr)
            status, payload = core.api_dispatch(
                self.command, urlparse(self.path).path, body, self.headers, None)
            data = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            self._run()

        def do_POST(self):
            self._run()

        def log_message(self, *args):
            pass
except Exception:
    pass
