# The Confidence Academy — social post templates

Five brand templates (Facebook, Instagram, LinkedIn, TikTok, YouTube) with
in-browser editing, media upload, JPG/video export and cross-platform
replication, served behind an admin sign-in.

---

## Why this is a server now

The previous version was a single HTML file. Any credential check inside a
static file runs in the browser, which means the check itself — and anything it
compares against — has to be shipped to the visitor. Hashing the credentials
raised the effort needed to read them, but it could never stop someone opening
DevTools and calling the unlock function directly, or simply deleting the gate
element. There is no arrangement of client-side code that fixes this.

So the architecture changed. A small Flask server now holds the credentials and
performs the check, and the templates page is only ever sent to a request that
already carries a valid session.

---

## Setup

```bash
cd tca-social
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python3 tca_server.py init     # prompts for username and password
python3 tca_server.py run      # http://127.0.0.1:8000
```

`init` writes `.env` with a random secret key, the username, and a **scrypt hash
of the password**. The password itself is never written to disk. `.env` is
created owner-read-only and is listed in `.gitignore`.

To change the password later:

```bash
python3 tca_server.py hash     # prints a new TCA_ADMIN_PASSWORD_HASH line
```

Paste it over the existing line in `.env` and restart.

---

## Layout

```
tca-social/
├── tca_server.py        all authentication logic — never served
├── .env                 credentials and secret key — never served, never committed
├── .env.example         template for the above
├── views/
│   ├── login.html       public sign-in page. Contains no credentials of any kind
│   └── app.html         the templates page. Only sent to authenticated sessions
├── static/              favicons — deliberately public
├── protected/           the five layered PSDs, served only via /assets/ behind auth
└── tca_assets.py        favicon generator (see below)
```

`views/` and `protected/` are not static directories. Flask serves `static/`
only; everything else is read by the application and returned by a route that
checks the session first.

### Routes

| Route | Auth | Purpose |
|---|---|---|
| `GET /` | public | Sign-in page. Redirects to `/app` if already signed in |
| `POST /api/login` | public | Returns `{"ok": true}` or `{"ok": false}` and nothing else |
| `GET /app` | required | The templates page |
| `GET /assets/<file>` | required | PSD downloads |
| `POST /api/logout` | required | Clears the session (CSRF-token protected) |
| `GET /static/<file>` | public | Favicons |

---

## What protects what

- **Credentials never reach the browser.** The login page sends what was typed
  and is told yes or no. No username, password or hash appears in any HTML, JS,
  or network response. Verified by the test suite below.
- **Passwords are stored as scrypt hashes**, so even someone who reads `.env`
  gets a hash rather than a usable password.
- **`/app` returns a redirect and an empty body without a session**, so entering
  the URL directly, refreshing, or using back/forward gives nothing to inspect.
- **Responses are `no-store`**, so the browser will not restore an authenticated
  page from cache after logout.
- **The session is a signed, HttpOnly cookie.** JavaScript cannot read it, and
  it cannot be forged without `TCA_SECRET_KEY`. It expires after
  `TCA_SESSION_HOURS`. Changing the secret key logs everyone out.
- **Failed sign-ins are rate-limited per address**, and the error message is
  identical for a wrong username and a wrong password, so it can't be used to
  work out which half was right.
- **PSD downloads sit behind the same check**, so the assets can't be pulled
  from a guessed URL.

### Honest limits

- **Serve this over HTTPS.** Everything above is undone by a plain HTTP
  connection, which lets anyone on the network read the password in transit.
  Behind a TLS-terminating proxy, leave `TCA_COOKIE_SECURE=1`; it is only set to
  `0` for local testing.
- **The bundled server is Flask's development server.** For anything beyond one
  person on a laptop, run it under a real WSGI server:
  `pip install gunicorn` then
  `gunicorn -w 2 'tca_server:build_app()' -b 127.0.0.1:8000`.
- **Rate limiting is in-process.** It resets on restart and is not shared across
  workers. For multiple workers, put the limiting in the reverse proxy instead.
- **It is a single shared admin account.** There are no roles, no audit trail
  beyond log lines, and no password reset flow. If more than a couple of people
  need access, this should become real user accounts.
- **Anyone with filesystem or shell access to the server can read `.env`.** That
  is normal, and it is why the box matters as much as the app.

---

## Tests

`test_server.py` exercises the gate through Flask's request stack: unauthenticated
access to every route, credential-leak checks on both pages, wrong username and
wrong password, forged and unsigned session cookies, CSRF on logout, cache
headers, and the lockout.

```bash
pip install flask
python3 test_server.py
```

All 59 checks should pass.

---

## Favicons

`tca_assets.py` regenerates the icon set from a source `.ico`:

```bash
python3 tca_assets.py icons favicon.ico --outdir static
```

It produces a multi-size `.ico`, PNGs at 16/32/48/192/512, and a 180px Apple
touch icon flattened onto brand navy, since iOS renders transparency as black.

---

## Using the templates

Once signed in, everything works as before: click any headline, supporting line,
badge, stat or button to edit it; upload or drag in a photo, or a video on the
TikTok and YouTube templates; adjust **Crop focus**; **Download** as JPG or
video; and **Replicate to all** to push one piece of content across all five
formats while each keeps its own layout, type sizes and crop. Full notes are at
the bottom of the templates page itself.
