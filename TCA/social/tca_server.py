#!/usr/bin/env python3
"""
The Confidence Academy — social post templates, served behind an admin sign-in.

Everything that decides whether a login succeeds lives in this file and in .env.
Neither is inside a served directory, so nothing the browser can request contains
a username, a password, or a password hash. The login page posts what was typed
to /api/login and receives only {"ok": true} or {"ok": false}.

    python3 tca_server.py init          # create .env (secret key + credentials)
    python3 tca_server.py hash          # print a password hash for an existing .env
    python3 tca_server.py run           # start the server

See README.md for deployment notes. Serve this over HTTPS in real use.
"""

import functools
import hmac
import os
import secrets
import sys
import time
from pathlib import Path

from flask import (Flask, Response, abort, jsonify, redirect, request,
                   send_from_directory, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

BASE = Path(__file__).resolve().parent
VIEWS = BASE / "views"          # never served directly
PROTECTED = BASE / "protected"  # only reachable through /assets/, behind auth
ENV_FILE = BASE / ".env"


# --------------------------------------------------------------------------- env
def load_env(path=ENV_FILE):
    """Minimal .env reader. Real environment variables always win, so the same
    file works locally and under a process manager that injects config."""
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        os.environ.setdefault(key, value)


def env(key, default=None, required=False):
    value = os.environ.get(key, default)
    if required and not value:
        sys.exit(
            f"Missing {key}.\n"
            f"Run:  python3 {Path(__file__).name} init\n"
            f"or set {key} in the environment."
        )
    return value


# ------------------------------------------------------------------------- setup
def build_app():
    load_env()

    app = Flask(__name__, static_folder=str(BASE / "static"), static_url_path="/static")

    app.secret_key = env("TCA_SECRET_KEY", required=True)
    app.config.update(
        ADMIN_USERNAME=env("TCA_ADMIN_USERNAME", required=True),
        ADMIN_PASSWORD_HASH=env("TCA_ADMIN_PASSWORD_HASH", required=True),
        SESSION_HOURS=float(env("TCA_SESSION_HOURS", "8")),
        MAX_ATTEMPTS=int(env("TCA_MAX_ATTEMPTS", "5")),
        LOCKOUT_MINUTES=float(env("TCA_LOCKOUT_MINUTES", "10")),
        SESSION_COOKIE_HTTPONLY=True,          # JS can never read the session
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_NAME="tca_session",
        # Cookie is only sent over HTTPS unless explicitly relaxed for local dev.
        SESSION_COOKIE_SECURE=env("TCA_COOKIE_SECURE", "1") not in ("0", "false", "False"),
        PERMANENT_SESSION_LIFETIME=int(float(env("TCA_SESSION_HOURS", "8")) * 3600),
        MAX_CONTENT_LENGTH=64 * 1024,          # login payloads are tiny
    )

    if len(app.secret_key) < 32:
        sys.exit("TCA_SECRET_KEY is too short — regenerate it with 'init'.")

    # in-memory failed-attempt tracking, keyed by client address
    attempts = {}

    def client_ip():
        # honour one proxy hop if the deployment sets it; otherwise remote_addr
        fwd = request.headers.get("X-Forwarded-For", "")
        return (fwd.split(",")[0].strip() if fwd else request.remote_addr) or "unknown"

    def locked_for(ip):
        record = attempts.get(ip)
        if not record:
            return 0
        remaining = record["until"] - time.time()
        return int(remaining) if remaining > 0 else 0

    def note_failure(ip):
        record = attempts.setdefault(ip, {"count": 0, "until": 0})
        record["count"] += 1
        if record["count"] >= app.config["MAX_ATTEMPTS"]:
            record["until"] = time.time() + app.config["LOCKOUT_MINUTES"] * 60
            record["count"] = 0

    def clear_failures(ip):
        attempts.pop(ip, None)

    def read_view(name, **subs):
        text = (VIEWS / name).read_text(encoding="utf-8")
        for key, value in subs.items():
            text = text.replace(key, value)
        return text

    def authed():
        return bool(session.get("auth")) and session.get("u") == app.config["ADMIN_USERNAME"]

    def login_required(view):
        @functools.wraps(view)
        def wrapper(*args, **kwargs):
            if not authed():
                if request.path.startswith("/api/"):
                    return jsonify(ok=False, error="Not signed in."), 401
                return redirect(url_for("login_page"))
            return view(*args, **kwargs)
        return wrapper

    # --------------------------------------------------------------- responses
    @app.after_request
    def harden(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "same-origin")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=()")
        # Never let an authenticated page sit in the back/forward cache.
        if request.path.startswith(("/app", "/assets", "/api")):
            response.headers["Cache-Control"] = "no-store, max-age=0"
            response.headers["Pragma"] = "no-cache"
        return response

    # ------------------------------------------------------------------ routes
    @app.get("/")
    def login_page():
        if authed():
            return redirect(url_for("app_page"))
        return Response(read_view("login.html"), mimetype="text/html")

    @app.post("/api/login")
    def api_login():
        ip = client_ip()
        wait = locked_for(ip)
        if wait:
            minutes = max(1, round(wait / 60))
            return jsonify(
                ok=False,
                error=f"Too many failed attempts. Try again in about {minutes} minute"
                      f"{'' if minutes == 1 else 's'}."
            ), 429

        data = request.get_json(silent=True) or {}
        username = str(data.get("username", ""))[:200].strip()
        password = str(data.get("password", ""))[:1000]

        # Compare both halves every time and with a constant-time check, so the
        # response can't be used to work out which half was right.
        user_ok = hmac.compare_digest(username, app.config["ADMIN_USERNAME"])
        pass_ok = check_password_hash(app.config["ADMIN_PASSWORD_HASH"], password)

        if user_ok and pass_ok:
            clear_failures(ip)
            session.clear()
            session.permanent = True
            session["auth"] = True
            session["u"] = app.config["ADMIN_USERNAME"]
            session["csrf"] = secrets.token_urlsafe(32)
            app.logger.info("admin sign-in from %s", ip)
            return jsonify(ok=True, next=url_for("app_page"))

        note_failure(ip)
        app.logger.warning("failed sign-in from %s", ip)
        left = locked_for(ip)
        if left:
            minutes = max(1, round(left / 60))
            return jsonify(
                ok=False,
                error=f"Too many failed attempts. Try again in about {minutes} minute"
                      f"{'' if minutes == 1 else 's'}."
            ), 429
        return jsonify(ok=False, error="Those credentials weren't recognised."), 401

    @app.post("/api/logout")
    @login_required
    def api_logout():
        token = request.headers.get("X-CSRF-Token", "")
        if not hmac.compare_digest(token, session.get("csrf", "")):
            return jsonify(ok=False, error="Bad CSRF token."), 403
        session.clear()
        return jsonify(ok=True)

    @app.get("/app")
    @login_required
    def app_page():
        html = read_view(
            "app.html",
            __CSRF_TOKEN__=session.get("csrf", ""),
            __USERNAME__=session.get("u", ""),
        )
        return Response(html, mimetype="text/html")

    @app.get("/assets/<path:name>")
    @login_required
    def protected_asset(name):
        # send_from_directory refuses to escape the directory it is given
        if not (PROTECTED / name).is_file():
            abort(404)
        return send_from_directory(PROTECTED, name, as_attachment=True)

    @app.errorhandler(404)
    def not_found(_):
        if authed():
            return redirect(url_for("app_page"))
        return redirect(url_for("login_page"))

    return app


# ----------------------------------------------------------------------- cli
def cmd_init(argv):
    if ENV_FILE.exists() and "--force" not in argv:
        sys.exit(f"{ENV_FILE} already exists. Pass --force to overwrite it.")

    import getpass
    print("Creating .env — this file holds the credentials and must never be")
    print("committed to source control or placed in a served directory.\n")

    username = input("Admin username [TCAsocial]: ").strip() or "TCAsocial"
    while True:
        password = getpass.getpass("Admin password: ")
        if len(password) < 8:
            print("  Use at least 8 characters.")
            continue
        if password != getpass.getpass("Confirm password: "):
            print("  Those didn't match.")
            continue
        break

    ENV_FILE.write_text(
        "# The Confidence Academy — social templates server.\n"
        "# Secrets live here. Never commit this file or serve this directory.\n\n"
        f"TCA_SECRET_KEY={secrets.token_urlsafe(48)}\n"
        f"TCA_ADMIN_USERNAME={username}\n"
        f"TCA_ADMIN_PASSWORD_HASH={generate_password_hash(password)}\n\n"
        "TCA_SESSION_HOURS=8\n"
        "TCA_MAX_ATTEMPTS=5\n"
        "TCA_LOCKOUT_MINUTES=10\n\n"
        "# Set to 0 only for local http://127.0.0.1 testing. Leave at 1 in production\n"
        "# so the session cookie is never sent over an unencrypted connection.\n"
        "TCA_COOKIE_SECURE=0\n",
        encoding="utf-8",
    )
    try:
        os.chmod(ENV_FILE, 0o600)
    except OSError:
        pass

    print(f"\nWrote {ENV_FILE} (owner-read only).")
    print("The password is stored as a scrypt hash — the plain text is not saved anywhere.")
    print(f"\nStart the server with:  python3 {Path(__file__).name} run")


def cmd_hash(argv):
    import getpass
    password = argv[0] if argv else getpass.getpass("Password to hash: ")
    print("\nTCA_ADMIN_PASSWORD_HASH=" + generate_password_hash(password))
    print("\nPaste that line into .env, replacing the existing one.")


def cmd_run(argv):
    host = os.environ.get("TCA_HOST", "127.0.0.1")
    port = int(os.environ.get("TCA_PORT", "8000"))
    application = build_app()
    scheme = "https" if application.config["SESSION_COOKIE_SECURE"] else "http"
    print(f"\n  The Confidence Academy — social templates")
    print(f"  Sign in at {scheme}://{host}:{port}/\n")
    if not application.config["SESSION_COOKIE_SECURE"]:
        print("  TCA_COOKIE_SECURE=0 — fine for local testing, not for deployment.\n")
    application.run(host=host, port=port, debug=False)


def main():
    args = sys.argv[1:]
    command = args[0] if args else "run"
    if command in ("-h", "--help", "help"):
        print(__doc__)
    elif command == "init":
        cmd_init(args[1:])
    elif command == "hash":
        cmd_hash(args[1:])
    elif command == "run":
        cmd_run(args[1:])
    else:
        sys.exit(f"Unknown command {command!r} — try init, hash or run.")


if __name__ == "__main__":
    main()
