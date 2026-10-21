# Gym Badge — Final Build Plan

## Context
The project source was lost from disk. I recovered the **complete production
codebase** from the live Vercel deployment (gymbadge.vercel.app) — all HTML,
JS, CSS and images. Current tree is clean and complete.

## Recovered tree
```
app/          PWA  (index.html, sw.js, manifest, assets/{js,css,img})
web/          Website (23 pages + assets/{js,css})
assets/       Shared (theme.js, auth.js, people.js, img/)
index.html    Root entry (copy of web/index.html)
```

## Tasks

### 1. Remove e-commerce
- [ ] Delete `web/cart.html`, `web/checkout.html`, `web/orders.html`
- [ ] Strip cart/order APIs from `web/assets/js/store.js`
- [ ] Strip cart/checkout CSS from `web/assets/css/site.css`
- [ ] Remove cart/orders links from `web/assets/js/chrome.js` (nav + footer)
- [ ] Remove "Premium & billing" FAQ group from `web/assets/js/data.js`
- [ ] Remove cart/order entries from `web/account.html`, `web/find.html`,
      `web/coach.html`, `web/gym.html`, `web/pricing.html`
- [ ] Remove checkout route from `app/assets/js/app.js` + `app/assets/js/payments.js`
- [ ] Remove "Manage subscription" e-comm tone from app profile route
- [ ] Add `vercel.json` with clean URL rewrites (no /cart, /checkout, /orders)

### 2. Language / i18n
- [ ] New `assets/i18n.js` — shared dictionary engine (app + web)
- [ ] Language list with flags, exact-meaning translations
- [ ] Language picker in app Settings + web nav
- [ ] Translate app UI strings, auth pages, site chrome
- [ ] Persist choice; `dir=rtl` for Arabic/Hebrew/Urdu/Farsi

### 3. Password UX
- [ ] Eye toggle on every password input (login, signup, reset, app settings)
- [ ] "Forgot password?" CTA on login + in-app
- [ ] Email recovery CTA (resend verification, reset link)

### 4. Music sync (real OAuth)
- [ ] New `assets/music.js` — Spotify / YouTube Music / Audiomack OAuth2
- [ ] PKCE flow, popup-based, token stored in GBStore
- [ ] Now-playing display visible to community
- [ ] Disconnect + reconnect, offline fallback

### 5. Settings page
- [ ] Full app Settings route: account, security, notifications, language,
      appearance, music, data/privacy, support

### 6. Mailgun SMTP
- [ ] `server.py` — real API: PBKDF2 passwords, verification + reset tokens
- [ ] Mailgun SMTP send for registration confirmation + password reset
- [ ] `/api/config` exposes flags; auth.js already dual-mode

### 7. Test + deploy
- [ ] Serve locally, run automated route/DOM audit (no JS errors, no dead buttons)
- [ ] Browser test of every route
- [ ] git init + push to `tearsmith10/Gym-badge`
- [ ] Vercel production deploy, live sanity check
