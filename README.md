# Gym Badge

**Train smarter. Prove it. Earn your badge.**

A gym companion that remembers every set, taps into gym equipment, scans your
food, projects the body you are working toward, and finds you a gym — plus a
full account system with real email verification.

It is a **membership and training product, not a shop**. There is no cart, no
order basket and no billing screen anywhere in the codebase.

---

## What is in here

```
app/            The installable PWA (Workout · Exercise · Library · Progress · You)
web/            The marketing site (19 pages)
assets/         Shared runtime: auth, i18n, music OAuth, password helper, theme, people
gymbadge_core.py  Accounts, tokens, Mailgun email and the JSON API (shared)
server.py       Standalone HTTP server: serves the site + the API in one process
api/index.py    The same API as a Vercel serverless function
vercel.json     Deployment config: clean URLs, function route, cache headers
```

The API lives in `gymbadge_core.py` and is used by **both** `server.py` (local
and self-hosted) and `api/index.py` (Vercel), so the two can never drift
apart.

### The six features

| Feature | What it does |
|---------|--------------|
| **First Rep** | Two-minute onboarding that builds your badge profile. |
| **One More** | Logs any set and hands you the number to beat next session. |
| **Tap In** | NFC/QR equipment status — usable, in maintenance, faulty, overused. |
| **Plate Truth** | Photo a meal, get carbs, protein, fat and fibre, and what it costs your work. |
| **Tomorrow You** | Pick a goal physique, get the plan to reach it. |
| **Your Floor** | Real gyms near you, with slot booking. |

---

## New in this release

### 📷 The food scanner is back
The Nutrition Guide opens with a scanner again.

- **The camera** opens straight away and takes the photo for you.
- **A photo from your device** works anywhere the camera cannot, and on a
  phone it opens the camera roll with the rear camera ready.
- The photo is reduced to a colour signature and compared against the
  reference photographs of every food in the guide, which produces a ranked
  shortlist. The guide is then opened for the food **the member picks**, so
  it is never a guess they did not accept.
- If the server has a vision model configured it is asked for a better first
  guess. Without one the scanner still works completely offline.
- It never pretends to know. If nothing matches, it says so and lists the
  foods instead.

### 🪟 The app has its own dialogs
Nothing in Gym Badge calls the browser's `confirm()` or `prompt()` any more.
Those are blocked in some embedded browsers and they look nothing like the
rest of the product. Confirmations and name prompts now use the same in app
sheet as everything else, and they work the same on every device.

### 🧩 One set of helpers
`app/assets/js/ui.js` holds the element builder, the escaping and the
message toast. Every screen file uses them, so a toast can never fail
because one file forgot to bring its own copy.

### 🎨 The official logo
The mark is a running figure carrying across an adidas style three stripe.
The stripes run from the Ember accent through to the honeybadger tawny and
cream, so the logo reads as part of the app instead of sitting on top of it.

- **No white plate.** The PNG carries a transparent background, the app icon
  is a rounded espresso tile, and the bare mark is shipped for any dark
  surface. It works on all three dark themes.
- Shipped at 512, 192 and 180 for the icons, plus a maskable variant that
  keeps the figure inside the safe zone.

### 🌍 Language changes (35 languages, flags first)
`assets/i18n.js` is one dictionary shared by the app and the site.

- The picker sits in the **footer, below the page**, where the currency
  selector used to be. It is searchable and lists each language by its flag
  and its own name.
- Every language shows **its flag, then its endonym, then its English name**.
- Translations are **meaning-identical** to the English source — the dictionary
  is keyed by the English phrase, so a missing entry falls back to English
  verbatim rather than silently changing the sense.
- **Right-to-left** languages (Arabic, Hebrew, Farsi, Urdu) flip the document
  direction automatically.
- The choice persists and the whole UI flips the instant you pick.
- Works completely offline — the whole dictionary ships in the bundle.

Covered: English, French, Spanish, German, Portuguese, Italian, Dutch, Polish,
Turkish, Russian, Ukrainian, Swahili, Hausa, Yoruba, Igbo, Amharic, Arabic,
Hebrew, Persian, Urdu, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati,
Punjabi, Chinese, Japanese, Korean, Indonesian, Malay, Vietnamese, Thai and
Filipino.

### 👁️ Password eye toggle
`assets/pw.js` adds a reveal/hide button to **every** password field on the
site and in the app — login, sign-up, reset and the in-app Settings screen.
Keyboard accessible, announces its state via `aria-pressed`, and never stores
or logs what you type.

### 🔑 Forgot password & email recovery
- **Forgot password?** on the login screen and inside Settings.
- **Resend verification email** on sign-up and in Settings.
- A password reset **invalidates every existing session** — a standard, safe
  behaviour.
- Both flows are backed by the real API (see below).

### 🎵 Music sync — Spotify · YouTube Music · Audiomack
`assets/music.js` implements **real OAuth 2.0 with PKCE** against each
provider's live endpoints.

- Authorization Code flow with `code_challenge_method=S256`.
- The redirect URI is a dedicated static page (`app/oauth.html`) — **no
  fragment**, as the spec requires — which hands the code back to the app via
  `postMessage`.
- The PKCE verifier lives in `localStorage` because the OAuth popup is a
  separate browsing context with its own `sessionStorage`.
- **Now playing** is stored on your public profile so other members in the
  community can see what you are listening to.
- Fully disconnectable, and the app stays usable if a provider is not
  configured — the UI says so plainly instead of failing silently.

Client IDs come from `/api/config`, or you can set them in the browser with
`GBMusic.setClientId("spotify", "…")`.

### ⚙️ A complete Settings page
`app/assets/js/settings.js` — seven sections, all functional:

- **Account** — avatar upload (compressed on-device), name, email.
- **Security** — change password, forgot password, resend verification, sign out.
- **Training** — units, morning and evening notifications, haptics, autoplay,
  plus the exercises you train most often.
- **Language** — the flags picker.
- **Music** — connect a provider, see what is playing, disconnect.
- **Privacy & data** — export everything as JSON, or delete it all.
- **Support** — FAQ, email, about.

### 📧 Mailgun SMTP for registration verification
`server.py` sends **real** registration-confirmation and password-reset emails
through Mailgun's SMTP relay (`smtp.mailgun.org:587`, STARTTLS).

- Passwords are stored as **PBKDF2-HMAC-SHA256**, 600,000 iterations, with a
  per-user random salt. Plaintext is never written to disk.
- Verification and reset tokens are single-use and expire (24 h / 1 h).
- Identity numbers (NIN / SSN / passport) are **never** stored in clear — only
  the last four digits plus a salted hash.
- With no SMTP configured, the flow still completes and the link is returned
  in the response so you can test end to end.

---

## Running it

### The API server (accounts, email, everything)

```bash
pip install -r requirements.txt   # optional, see below
python server.py 8080
```

Then open <http://localhost:8080>.

The server uses only the Python standard library — `requirements.txt` is empty
on purpose. It serves the whole site **and** the JSON API from one process.

### Configuration

| Variable | Purpose |
|----------|---------|
| `GYMBADGE_DOMAIN` | Mailgun sending domain, e.g. `mg.gymbadge.app` |
| `MAILGUN_API_KEY` | Mailgun API key (also the SMTP password) |
| `MAILGUN_FROM` | Optional envelope/From address |
| `GYMBADGE_SMTP_HOST` | default `smtp.mailgun.org` |
| `GYMBADGE_SMTP_PORT` | default `587` |
| `GYMBADGE_SITE_URL` | Public base URL used in email links |
| `GYMBADGE_SECRET` | Secret used to sign session tokens (required in production) |
| `GYMBADGE_DATA_DIR` | Where `users.json` lives (default `./data`) |
| `SPOTIFY_CLIENT_ID` | Enables the Spotify music connection |
| `GOOGLE_CLIENT_ID` | Enables the YouTube Music connection |
| `AUDIOMACK_CLIENT_ID` | Enables the Audiomack music connection |
| `UPSTASH_REDIS_REST_URL` | Optional — enables durable account storage |
| `UPSTASH_REDIS_REST_TOKEN` | Optional — enables durable account storage |

```bash
# Windows
set GYMBADGE_DOMAIN=mg.gymbadge.app
set MAILGUN_API_KEY=key-xxxxxxxx
set GYMBADGE_SECRET=<a long random string>
set SPOTIFY_CLIENT_ID=your-spotify-id
python server.py 8080

# macOS / Linux
export GYMBADGE_DOMAIN=mg.gymbadge.app
export MAILGUN_API_KEY=key-xxxxxxxx
export GYMBADGE_SECRET=$(python -c "import secrets;print(secrets.token_hex(32))")
python server.py 8080
```

### Sessions and durable storage

Session tokens are **signed and self-contained** (HMAC-SHA256), so a signed-in
member is recognised on any serverless instance without a shared database.
Signing out adds the token to a revocation list, so a signed-out session stops
working immediately.

Accounts themselves are stored in `users.json`. On a normal host that is
permanent. On a serverless platform the filesystem is temporary, so set
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to an Upstash
database and the accounts, sessions and tokens persist for real.

```bash
vercel env add GYMBADGE_SECRET production --sensitive
vercel env add GYMBADGE_DOMAIN production
vercel env add MAILGUN_API_KEY production --sensitive
vercel env add SPOTIFY_CLIENT_ID production
```

### Static only
The app also runs as a plain static site — open `app/index.html` through any
web server. In that mode the account system falls back to `localStorage` and
the whole experience still works offline.

---

## Deploying to Vercel

```bash
vercel --prod
```

`vercel.json` handles the clean URLs (`/login` → `/web/login.html`, and so on)
and sets the right cache headers — the service worker and the scripts are
always revalidated, images are cached for a year.

---

## Testing

The suite lives in the repository and runs against any deployment.

```bash
# against a local server
python server.py 8080
node tests/run.js http://localhost:8080

# against production
node tests/run.js https://gymbadge.vercel.app

# the source audit, no server or browser needed
node tests/buttons.js
```

`tests/run.js` covers every route, the removal of the cart and order pages,
signup, verification, password reset and change, session revocation, the AI
assistant answering and refusing to guess, the trainer and exercise
moderation workflows, the equipment report permissions, the translation
service, the food scanner, the language and country pickers, the official
logo (decoded and checked for a white plate and the brand palette) and a
sweep of every page for hyphens that would reach the reader.

`tests/buttons.js` reads the app source and checks that every control it
builds has a handler, that every helper it calls is actually in scope, that
it never falls back to the browser's own `prompt` or `confirm`, and that
the scanner, the shared helpers and the country picker are all wired up.
It runs in a second and catches the quiet failures, where a button looks
right on the screen and does nothing.

Every screen and every website page was also driven in a real browser, one
control at a time, watching for errors and for anything that changed
nothing.

```bash
python server.py 8080          # in one terminal
node server.py 8080            # in another, then:
```

The suite covers the full API surface: signup validation, duplicate accounts,
login, email verification (single-use tokens), resend, forgot/reset,
password change, session revocation, profile, identity masking, every static
route, path-traversal protection, and confirmation that the removed commerce
routes 404.

---

## Privacy

Your logs, photos and measurements are yours. Export them as JSON or delete
them all in one tap from Settings. We never sell your data, and identity
numbers are salted-hashed — only the last four digits are ever kept.

---

© 2026 Gym Badge. All rights reserved. Made for every body, everywhere.
