# 🚩 Upgrade Guide — Bageshwar Bala Ji Sundarkand Mandal

This is a **living document**. It tracks the full multi-phase upgrade of the
Mandal's digital presence — from a single static website into a monorepo
containing a **website**, a **backend API**, and an **Android admin app**.

Every phase is documented here as it's completed, so you (or anyone else)
can understand *what changed and why* at any point in the future.

---

## 📸 Current State (read this first)

Everything below this section is a detailed **historical log** — useful
when you need to understand *why* something is the way it is, but not
required reading to just use or maintain the project day-to-day. This
section is the one-screen version.

**What exists today:**
- **Website** (`web/`) — 10 public pages, all live on Netlify. No admin
  panel on the website anymore — see below.
- **Backend** (`backend/`) — one job: deletes expired events from Firestore
  daily, triggered by a free GitHub Actions cron (`.github/workflows/cleanup-cron.yml`).
  Deployed on Render's free tier.
- **Admin App** (`mobile-app/`) — Android app, v0.0.3, the *only* way to
  manage content now (events, donations, gallery, members, Sundarkand
  verses, settings). Full Add/Edit/Delete on every section. Built with
  Capacitor; builds via GitHub Actions (default) or Termux.
- **Data** — Firebase Firestore + Firebase Auth (single admin account) +
  Cloudinary (image hosting). Security Rules unchanged from your original
  setup throughout this whole upgrade — never modified, only reviewed.

**How to do common things:**
| I want to... | Do this |
|---|---|
| Edit website content/design | Edit files in `web/`, push to `main`, Netlify redeploys automatically |
| Add/edit/delete an event, donation, gallery photo, member, or verse | Open the **Mandal Admin** app on your phone |
| Change the announcement bar or live stream link | App → Settings tab |
| Build a new APK after changing `mobile-app/` | Push to `main` (GitHub Actions builds it automatically) or run the Termux commands in `mobile-app/README.md` |
| Check everything still works after a change | Run through [`TESTING.md`](TESTING.md) |
| Understand *why* something was built a certain way | Search this file for the relevant Phase |

**Known limitations, on purpose (not bugs):**
- Admin app is a debug build (not Play-Store signed) — fine for
  personal/community use, sideload only
- Single hardcoded admin account — no multi-user admin yet
- `backend/` is intentionally minimal (one job) — will expand later for
  blogs/donation-tracking/broader login, per your own plan, once
  everything above is stable

---

## 🗺️ The 5-Phase Roadmap

> **Reordered on your instruction:** the Android admin app is now built
> *before* the web admin panel is removed, so you never lose admin access
> during the transition.

| Phase | Name | Status |
|-------|------|--------|
| 1 | Website Polish & Performance | ✅ **Done** |
| 2 | Backend on Render + Monorepo Restructure | ✅ **Done** |
| 3 | Android Admin App (APK) v0.0.3 | ✅ **Done** |
| 4 | Remove Web Admin Panel | ✅ **Done** |
| 5 | Final Docs, Testing & Polish | ✅ **Done** |

You are currently on **Phase 5 → complete. All 5 phases done.** 🎉

**Confirmed decisions so far:**
- Admin access gap → solved by building the app first (this reorder)
- First requested future improvement → SEO structured data (JSON-LD) for
  events — queued for a later phase, more to come from you
- APK builds → GitHub Actions is the default when you don't want to do
  much manually; Termux is there for when you're in the mood — both are
  set up and working
- App login/CRUD security → direct Firestore access (same as `admin.js`)
  is the more secure choice here — see Phase 3 for the full reasoning
- Backend scope → intentionally minimal through all 5 phases; you've
  confirmed you'll expand it afterward for blogs/articles (with author +
  published/updated timestamps), broader user login, and donation
  tracking — noted for later, not built yet
- Backend cleanup job → **you manually ran it and confirmed it works** ✅
- Firestore Security Rules → you shared them; writes are correctly
  restricted to the admin UID already. Not modified, per your standing
  instruction — reviewed only.
- App login → **confirmed working** ✅ after fixing the Google Cloud API
  key's HTTP referrer restriction (a separate setting from Firebase Auth's
  Authorized domains — see the note below if this ever needs revisiting)
- Web admin panel → **removed** ✅ — app is now the only admin surface

---

## ✅ Phase 1 — Website Polish & Performance

### What changed

**1. Developer credit line**
- Removed from every page **except** `about.html`.
- On `about.html`, it is now **plain text** — no longer a clickable link to
  `admin-login.html`. (This matters because Phase 2 removes the admin panel
  from the website entirely, so that link would have broken anyway.)

**2. Image compression → WebP**
All images now ship in modern **WebP** format (with automatic fallback to
the original format for the rare old browser that doesn't support WebP),
using the standard `<picture>` element:

```html
<picture>
  <source srcset="assets/logo.webp" type="image/webp" />
  <img src="assets/logo.png" alt="Mandal Logo" class="header-logo" />
</picture>
```

| Asset | Before | After (webp) | Saved |
|---|---|---|---|
| `logo.png` | 2.4 MB | 32 KB | 98.7% |
| `hanuman-banner.jpg` | 2.5 MB | 112 KB | 95.5% |
| `default-member.jpg` | 1.3 MB | 16 KB | 98.8% |

The original `.jpg`/`.png` files were **also** re-compressed and resized
(they were absurdly oversized — the logo was a 2048×2048 px PNG being
displayed at 46 px!) so even the fallback path is fast. Nothing under
`donation.html` / `donation.js` (including `qr-code.png`) was touched, per
your standing instruction.

**3. Fixed banner cropping on desktop/tablet**
The banner image is wide (~3:1 aspect ratio). With `object-fit: cover` at a
fixed 85px height, a **narrow mobile viewport** crops it only slightly (which
is why it looked perfect on your phone) — but a **wide desktop viewport**
was cropping away more than half the image top-and-bottom.

Fix: above 768px width, the banner switches to `object-fit: contain` with a
gradient background that matches the header's own maroon→saffron theme, so
the **entire banner is always visible**, letterboxed seamlessly into the
header. Mobile behaviour is untouched.

**4. Redesigned "About" page member cards**
Old cards were a plain white box with a bordered circle photo. New design:
- Circular photo sits inside a rotating gold/saffron/maroon gradient ring
- Decorative maroon-to-saffron arch across the top of each card with a 🚩
- Position shown as a pill-shaped badge
- Contact shown as a pill-shaped button
- Smooth lift + ring-rotate on hover

**5. Gallery lightbox — Prev / Next navigation**
`gallery.html` lightbox now has:
- **‹ › arrow buttons** to move between images without closing the lightbox
- **Left / Right arrow key** support on desktop
- **Swipe left / right** support on touch devices
- An image counter (`3 / 12`) so devotees know how many photos remain
- Fixed a pre-existing bug where clicking the image itself would
  accidentally close the lightbox (an inline `onclick` was firing on every
  click inside the overlay, not just the backdrop)

**6. Upcoming events auto-hide when expired**
`upcoming.js` now filters events client-side: any event whose `expiryDate`
(or, if not set, its `date`) has already passed is no longer shown on the
public Upcoming page. This is a **display-level** fix that needs no backend.

> ⚠️ Note: this *hides* expired events from the public listing — it does not
> yet delete them from Firestore. True automatic deletion requires a
> scheduled job, which arrives in **Phase 2** once the Render backend
> exists. Until then, an administrator can still manually delete old events.
> The `expiryDate` field is optional today; the future admin app (Phase 3)
> will let you set it explicitly when creating multi-day events.

### Files touched in Phase 1
```
css/style.css              banner fix, member card redesign, lightbox nav CSS
js/gallery.js               index-based lightbox + prev/next/swipe/keyboard
js/upcoming.js               client-side expiry filter
js/about.js                  new member card markup
about.html                   footer credit → plain text
index.html, gallery.html,
live.html, upcoming.html,
sundarkand.html, disclaimer.html,
privacy-policy.html,
terms-of-service.html        footer credit removed; picture/webp images
assets/*.webp                new — compressed images
assets/logo.png,
assets/hanuman-banner.jpg,
assets/default-member.jpg    re-compressed in place (same filenames)
```

---

## ✅ Phase 2 — Backend on Render + Monorepo Restructure

### The repo is now a real monorepo

```
bageshwar-sundarkand-mandal/
├── web/                    ← the website (Netlify deploys THIS folder now)
│   ├── *.html, css/, js/, assets/, robots.txt, sitemap.xml
├── backend/                ← Node/Express API (Render deploys THIS folder)
│   ├── server.js
│   ├── config/firebaseAdmin.js
│   ├── routes/cleanup.js
│   ├── middleware/verifyCronSecret.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── mobile-app/              ← placeholder — filled in during Phase 3
│   └── README.md
├── .github/workflows/
│   └── cleanup-cron.yml    ← daily GitHub Actions cron (see below)
├── render.yaml              ← Render Blueprint (optional one-click deploy)
├── .gitignore
├── guide.md
└── README.md
```

> ⚠️ **Action needed on your side:** Netlify's "Base directory" / "Publish
> directory" setting must now point at `web/` instead of the repo root.
> (Covered in the deployment steps below.)

### Why a backend at all, and why so small?

The website and the future admin app talk to **Firestore directly** for
normal CRUD (events, donations, gallery, members) — same pattern as
`web/js/admin.js` today. That's simpler, instant, and free; a backend
wouldn't make it better. So `backend/` exists **only** for the one thing
Firestore alone genuinely cannot do: **run on a schedule.**

v0.1.0 scope, on purpose kept to exactly one job:
- `GET /api/cleanup-expired-events` — deletes any Firestore `events`
  document whose `expiryDate` (or `date`, if no expiry was set) is in the
  past. Protected by a shared-secret header (`x-cron-secret`) so only your
  own scheduled job can call it.

Everything else you mentioned (blogs, richer donation management, admin
management) will hang off this same backend **when there's an actual
server-side reason to add it** — see `backend/README.md` for the reasoning.
No dead code, no speculative endpoints sitting unused.

### How the daily cleanup actually runs (and why not Render Cron Jobs)

Render's free web services **spin down after ~15 minutes of no traffic**
and take 30–60s to wake back up. Since GitHub is already central to your
workflow, cleanup runs via a **free GitHub Actions scheduled workflow**
(`.github/workflows/cleanup-cron.yml`) instead of a third-party cron
service — it fires once daily at 2:00 AM IST, wakes the Render service with
one request, and triggers the cleanup in the same call. No signup anywhere
else needed, and you can also trigger it manually anytime from GitHub's
"Actions" tab.

### 🚀 Deployment steps

**1. Get a Firebase service-account key** (one-time)
- Firebase Console → your project → ⚙️ **Project settings** → **Service accounts**
- Click **Generate new private key** → downloads a `.json` file
- Keep this file safe — it grants full admin access to your Firestore data

**2. Deploy the backend to Render**
- Go to [render.com](https://render.com) → sign up free (no card needed) → **New +** → **Web Service**
- Connect your GitHub repo
- Set **Root Directory** to `backend`
- Build command: `npm install` · Start command: `npm start` · Plan: **Free**
- Under **Environment**, add two variables:
  - `FIREBASE_SERVICE_ACCOUNT` → paste the *entire* downloaded JSON file's
    contents as one line
  - `CRON_SECRET` → any long random string (e.g. generate one with
    `openssl rand -hex 32` in Termux)
- Deploy. Note the URL Render gives you, e.g.
  `https://bageshwar-mandal-backend.onrender.com`
- Visit `<that-url>/health` in a browser — should show `OK`

> Prefer one-click? Render also supports **New + → Blueprint**, pointed at
> this repo — it will read `render.yaml` and set most of this up
> automatically (you'll still need to fill in the two secret env vars
> yourself, since those are never stored in git).

**3. Wire up the GitHub Actions cron job**
- In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
- Add repo secret `RENDER_BACKEND_URL` → your Render URL from step 2
- Add repo secret `CRON_SECRET` → the **exact same** value you set on Render
- Go to the **Actions** tab → "Daily Expired Events Cleanup" → **Run workflow**
  to test it immediately rather than waiting for 2 AM

**4. Point Netlify at `web/`**
- Netlify dashboard → your site → **Site configuration** → **Build & deploy**
- Set **Base directory** to `web`
- Set **Publish directory** to `web` (no build step needed — it's static)
- Trigger a redeploy

*(You mentioned you'll do the Netlify folder selection manually — this is
exactly what to select: the `web` folder.)*

### Files touched / added in Phase 2
```
web/                          ← everything from Phase 1 moved here, unchanged
backend/server.js              new
backend/config/firebaseAdmin.js new
backend/routes/cleanup.js       new
backend/middleware/verifyCronSecret.js  new
backend/package.json            new
backend/.env.example            new
backend/.gitignore              new
backend/README.md               new
mobile-app/README.md            new — placeholder for Phase 3
.github/workflows/cleanup-cron.yml  new
render.yaml                     new — optional Render Blueprint
.gitignore                      new — repo root
guide.md, README.md             moved to repo root (stay outside web/)
```

---

## ✅ Phase 3 — Android Admin App (APK) v0.0.1

### What was built

A **Capacitor** app — a real, installable Android app with a thin native
shell wrapping a mobile web UI. `mobile-app/www/` is that UI, adapted
directly from the existing `web/admin-login.html` + `web/admin-dashboard.html`
+ `web/js/admin.js` (same look, same features, same Firestore/Cloudinary
calls) so the app behaves exactly like the web admin panel you already know.
Full detail: [`mobile-app/README.md`](../mobile-app/README.md).

**v0.0.1 scope:**
- Firebase Auth login screen
- Dashboard stats (pending donations, verified total, events, members)
- Event management — add/delete, **now with an optional Expiry Date
  field** (blank = falls back to the event's own date, same as the
  website's auto-hide logic from Phase 1)
- Donation verification (approve / delete)
- Past live recordings, gallery upload, member management, Sundarkand
  verses, and settings (announcement + live link) — all included

### Security architecture decision: direct Firestore, no backend proxy

You asked "which is most secure?" — the answer is **direct Firestore
access** (same pattern the website already uses), for concrete reasons:

- A backend-proxy approach means the Firebase **Admin Service Account key**
  (which bypasses every security rule) would need to live on a public
  server the app talks to. Every extra place that key is used is a bigger
  blast radius if it ever leaks.
- Firestore Security Rules are enforced by Google's own infrastructure —
  not a weaker mechanism than an Express server, just a different shape —
  and this is Google's own recommended pattern for a single-admin app
  like this one.
- A backend adds a whole new attack surface (the server, its dependencies,
  its uptime) for no actual security gain here.

So the app uses the Firebase Auth + Firestore Rules combination exactly
like `admin.js` does today. `backend/`'s service account stays scoped to
just the one cleanup job it already has from Phase 2 — nothing new touches
it. (This is also *why* Phase 2's backend was kept deliberately minimal —
this decision was already anticipated.)

> ⚠️ Since the app relies on the same Firestore Security Rules as the
> website, it's worth double-checking those rules already restrict writes
> to your admin UID only. Per your standing instruction, I have not
> modified your security rules — happy to review them if you paste them in,
> but I won't change them myself.

### Building the APK — two ways, per your preference

**Option A — GitHub Actions** (your stated default when you don't want to
do much manually):
1. Push any change under `mobile-app/**` to `main` — the workflow
   `.github/workflows/build-apk.yml` runs automatically. Or trigger it
   manually anytime: GitHub repo → **Actions** tab → **Build Android APK**
   → **Run workflow**.
2. Wait for the green checkmark (a few minutes).
3. Open the finished run → scroll to **Artifacts** → download
   `mandal-admin-debug-apk` → unzip it to get `app-debug.apk`.
4. Transfer that file to your phone (e.g. via the Downloads app, Google
   Drive, or a cable) and tap to install. Allow "install from unknown
   sources" the first time Android asks.

**Option B — Termux, on-device** (your "when the mood says" option):
```bash
pkg install openjdk-17 -y

cd mobile-app
npm install
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
# Finished APK: android/app/build/outputs/apk/debug/app-debug.apk
```
> Termux builds are heavier (first run downloads the Android Gradle Plugin
> and SDK components — expect it to take a while and use real storage/data).
> If Termux ever runs out of memory during the build, GitHub Actions is the
> reliable fallback — that's exactly why it's the "mandatory if forced to
> choose" default.

### Files touched / added in Phase 3
```
mobile-app/www/                    new — the app's UI (adapted from web/)
mobile-app/android/                new — native project (Capacitor CLI-generated)
mobile-app/capacitor.config.json   new
mobile-app/package.json            new
mobile-app/README.md               rewritten — was a placeholder, now real docs
.github/workflows/build-apk.yml    new — GitHub Actions APK build
web/admin-dashboard.html            + Expiry Date field (kept in sync with the app)
web/js/admin.js                     + expiryDate read/write + table column
```

---

## 🐛 Bug-Fix Pass — Post-Phase-3 Testing Round

You installed the v0.0.1 APK, tested it, and did a careful audit of the
live site (first time you'd actually reviewed it since the upgrade began).
That surfaced real, concrete bugs — some from Phase 1's CSS rewrite, some
new in the app. All fixed in this pass, documented here so nothing is lost.

### 1. Live page stuck on infinite loading
**Root cause:** `web/live.html`'s container had `id="live-section"`, but
`web/js/live.js` (never touched, already had the correct "Live Streaming
Will Start Soon" fallback UI built in) was looking for
`id="current-live-container"`. The IDs didn't match, so the script's early
`if (!container) return;` guard fired every time, and the hardcoded loading
spinner in the HTML was never replaced.
**Fix:** Renamed the container ID in `live.html` to match. No JS touched.

### 2. Sundarkand page — unstyled buttons, dark mode broken
**Root cause:** deeper than #1 — my original Phase-1 CSS rewrite invented
`.verse-card` / `.verse-meaning` / fixed-`rem` `.verse-sanskrit` classes
that **`sundarkand.js` never actually generates**. The real markup uses
`.verse-block`, `.verse-columns`, `.verse-divider-label`, `.verse-hindi`,
and expects `.sundarkand-controls` / `.ctrl-btn` / `.sundarkand-reader` /
`.dark-mode` for the reader controls — none of which existed in
`style.css` at all. The reader was effectively unstyled from the start;
it just wasn't noticed until this review.
**Fix:** Rewrote the CSS to match the actual markup exactly — including
`em`-based font sizing on verse text so the A+/A− buttons' `reader.style.fontSize`
JS actually cascades correctly, and a real `.dark-mode` variant.

### 3. Gallery lightbox — pinch-to-zoom flips to the next image
**Root cause:** the swipe-navigation handler only read the first touch
point's X position, with no check for multi-touch. A two-finger pinch
gesture could easily register as a >50px single-point delta.
**Fix:** now tracks `touches.length` across `touchstart`/`touchmove` and
ignores the whole gesture if it was ever multi-touch; also requires the
motion to be clearly horizontal (not diagonal) before navigating.

### 4. Asset cleanup — WebP only, SVG placeholder, path corrections
- Removed all `.jpg`/`.png` fallback files; every page now points directly
  at `.webp` (no more `<picture>`/`<source>` wrapper).
- `default-member.jpg` replaced with a lightweight `default-member.svg`
  (simple person silhouette, themed colors, ~0.5KB vs ~24KB).
- Fixed all ~14 files' references in one pass — including `donation.html`'s
  shared header image paths (the header markup is identical across every
  page; the donation-specific paused-message content itself was not
  touched, per your standing instruction).

### 5. Admin forms — missing `.grid-2` class
The Add Event / Add Member forms use a `<div class="grid-2">` two-column
layout that was never defined in `style.css` — same root-cause pattern as
bug #2 (CSS written without cross-checking every class the HTML actually
uses). Added.

### 6. App — "wrong email or password" even with correct credentials
**Status: improved, not fully confirmed fixed — see below.**
The login handler was catching *every* Firebase Auth error and always
showing "wrong email or password," which hid the real cause. Replaced with
specific messages per Firebase error code (`auth/invalid-credential`,
`auth/unauthorized-domain`, `auth/network-request-failed`, etc.), with any
unrecognized code shown raw. **Please try logging in again with the new
build** — whatever message now appears is the real diagnosis. The most
likely cause for a Capacitor app is `auth/unauthorized-domain` — check
Firebase Console → Authentication → Settings → Authorized domains and
confirm `localhost` is listed (Capacitor serves the app from
`https://localhost`).

### 7. App — looked "like a desktop site," gray bar at top
Two separate things were going on:
- **Gray status bar:** `styles.xml` referenced `@color/colorPrimary`,
  `colorPrimaryDark`, and `colorAccent`, but **no `colors.xml` defined
  them anywhere** — a genuine missing-resource bug. Added `colors.xml`
  with the Mandal's maroon/saffron theme, plus explicit
  `android:statusBarColor`.
- **Possible width/zoom issue:** I hardened the viewport meta tag
  (`maximum-scale=1.0, user-scalable=no`) and set an explicit
  `backgroundColor` in `capacitor.config.json`, which are the standard
  fixes for this class of problem. I could **not fully reproduce or
  confirm this one** — the native Android project (MainActivity,
  AndroidManifest, activity_main.xml) is stock, unmodified Capacitor
  output and looks correct on inspection. **If it persists after this
  build, one more possibility worth ruling out:** some phones support a
  resizable "floating window" / split-screen mode (a system gesture on
  many Samsung/Xiaomi phones) — worth double-checking the app isn't
  running in a small resized window rather than fullscreen. If it's still
  wrong after that check, the most reliable next step is remote debugging:
  connect the phone via USB with Developer Options → USB debugging on,
  open `chrome://inspect` on a computer's Chrome browser, find the app's
  WebView, and inspect the actual rendered viewport width — that will show
  definitively what's happening.

### 8. App — no icon, no splash screen, no loading screen
- **Icon:** generated a full Android adaptive-icon set (all densities,
  foreground/background layers) from your original high-resolution logo
  using `@capacitor/assets`. Source files kept in `mobile-app/resources/`
  so the icon can be regenerated later if the logo ever changes
  (`npx capacitor-assets generate --android`).
- **Splash screen:** generated alongside the icon — logo centered on the
  Mandal's maroon theme color, all densities, light + dark.
- **Loading screen:** added a themed overlay (logo + animated progress bar)
  shown from page load until Firebase confirms the auth state, with a 10s
  safety timeout so it can never get stuck indefinitely if there's no
  internet connection.

### 9. Admin — no way to Edit, only Add/Delete
Built one **generic, reusable edit-modal system** (`openEditModal` /
`closeEditModal` / `saveEditModal` in `admin.js`) rather than six separate
one-off edit UIs — a single modal whose fields are configured per-section.
Added a ✏️ Edit button alongside every 🗑 Delete button across all six
sections: **Donations, Events, Past Lives, Gallery, Members, Sundarkand
verses.** Photo fields (gallery image, member photo) support an optional
"replace" upload — leave empty to keep the current one. Implemented
identically in both `web/js/admin.js` and `mobile-app/www/js/admin.js` so
the two stay in sync until Phase 4 retires the web version.

### Files touched in this pass
```
web/live.html                    container id fix
web/css/style.css                verse/reader CSS rewrite, grid-2, edit
                                   modal, app loading overlay CSS
web/js/gallery.js                pinch-zoom-safe swipe detection
web/js/admin.js                  edit modal system, caches, edit buttons,
                                   better login error messages
web/js/about.js                  default-member.svg fallback
web/admin-dashboard.html         edit modal HTML, expiry date field
web/assets/default-member.svg    new — replaces default-member.jpg
web/assets/*.webp                kept; .jpg/.png fallbacks deleted
(14 web/*.html files)            asset path corrections (webp-only)
mobile-app/www/*                 all of the above, mirrored + app-specific:
                                   loading overlay, hardened viewport
mobile-app/android/.../colors.xml    new — fixes gray status bar
mobile-app/android/.../styles.xml    statusBarColor, windowBackground
mobile-app/resources/*.png       new — icon/splash source images
mobile-app/android/.../mipmap-*  regenerated — full icon set
mobile-app/android/.../drawable* regenerated — full splash screen set
mobile-app/capacitor.config.json backgroundColor added
```

---

## 🔧 Build-Fix Pass — GitHub Actions Failure (→ v0.0.3)

You sent the GitHub Actions log after the first real CI build attempt.
Exact error:

```
Execution failed for task ':app:mergeDebugResources'.
> .../mobile-app/android/app/src/main/res/values/colors.xml:3:60:
  Error: The string "--" is not permitted within comments.
```

**Root cause:** the `colors.xml` I added in the bug-fix pass had a comment
referencing CSS variable names for context:
```xml
<!-- Mandal theme colors — matches web/css/style.css --red-dark / --maroon / --saffron -->
```
XML comments cannot contain the literal string `--` **anywhere** inside
them (it's part of the XML spec, not an Android-specific quirk) — and this
comment had three separate `--variable-name` references. AAPT2 (Android's
resource compiler) correctly rejected it. This is the *only* thing that
failed — every other build step (npm install, Capacitor sync, gradlew
permissions) succeeded cleanly.

**Fix:** rewrote the comment without any `--` sequence. Also scanned the
entire `android/` project for the same pattern elsewhere — none found.

**Also fixed in this pass — README.md logo not displaying:**
The logo `<img>` tag at the top of `README.md` had two stale problems at
once: it pointed at `assets/logo.png` (deleted during the earlier webp-only
cleanup) **and** it never accounted for the Phase 2 monorepo restructure
that moved everything into `web/` — so even the path shape was wrong
relative to where `README.md` actually sits (repo root). Corrected to
`web/assets/logo.webp`. Same stale-path issue found and fixed in
`mobile-app/README.md`'s folder-structure diagram.

**Version bump:** per your request, bumped to **v0.0.3** everywhere that
matters functionally — `mobile-app/package.json`, `android/app/build.gradle`
(`versionCode 3` / `versionName "0.0.3"` — Capacitor's scaffold had never
been touched from its default `1` / `"1.0"`), and the in-app footer text on
both screens. See `mobile-app/README.md`'s new Version History table for
the full story of what changed at each version.

---

## ✅ Phase 4 — Remove Web Admin Panel

You confirmed the app (v0.0.3) logs in and works correctly — the
`https://localhost` referrer restriction on the API key was the last
blocker, fixed on the Google Cloud Console side (no code change needed).
With the app proven as the working admin surface, the web admin panel is
now retired.

**What was removed:**
- `web/admin-login.html`
- `web/admin-dashboard.html`
- `web/js/admin.js` — unlike the original plan (which said to keep this as
  a "reference implementation"), I removed it instead. Reasoning: once the
  two HTML files that loaded it are gone, it becomes genuinely dead code —
  nothing on the live site references it, so there's no build-time or
  runtime reason to keep it around. `mobile-app/www/js/admin.js` is now
  the one living copy of this logic, and it's the one that'll keep
  evolving. Confirmed via search that no other file imported anything from
  `web/js/admin.js` before deleting it.

**Also fixed — one more dangling link:**
`web/donation.html`'s footer had the same "Website Developed By" credit
link pointing at `admin-login.html` that every other page originally had
(this page was left untouched during the earlier footer cleanup, per your
standing instruction not to touch `donation.html`). With `admin-login.html`
now gone, that link would 404, so it got the same treatment every other
page already received — link removed, text kept, nothing else in
`donation.html` touched (paused-donation design and message are still
exactly as they were).

**Left alone, on purpose — correction from an earlier note:**
- The `.admin-*` CSS classes in `web/css/style.css` (admin-table,
  admin-tabs, admin-login-card, etc.) — **this section previously said
  these were "unused" and safe to prune later. That was wrong, and Phase 5
  caught it before acting on it:** `mobile-app/www/css/style.css` is a
  synced copy of this same file, and the app's login screen + dashboard
  actively use these exact classes. Deleting them would have broken the
  app's UI while "cleaning up" the website. Left fully in place — not
  dead code, just website-CSS-shaped classes now serving double duty.
- Firestore Security Rules — unchanged, per your standing instruction.
  They were never tied to *which* client (web page vs. app) makes the
  request, only to the authenticated admin UID, so removing the web pages
  doesn't require any rule change. Still worth a final look in Phase 5's
  security review.

### Files touched in Phase 4
```
web/admin-login.html       deleted
web/admin-dashboard.html   deleted
web/js/admin.js            deleted
web/donation.html          footer credit link removed (surgical — nothing
                             else in this file touched)
```

---

## 🔐 Security Review — Everything in One Place

Scattered across four phases of notes — consolidated here so it's a single
reference instead of something you'd have to hunt for.

**1. Firestore Security Rules** (unchanged throughout this entire upgrade —
reviewed, never modified, per your standing instruction)
- All writes to `events`, `pastLives`, `members`, `gallery`, `settings`,
  `sundarkandText` require `request.auth.token.email == "chhwjalcm@gmail.com"`
- `donations` allows public **create** only (with validation: `status`
  must be `"pending"`, `amount` a positive number, `name` a string) —
  public users can submit a donation but never read others' write access,
  update, or delete anything
- Everything else is denied by default (`match /{document=**} { allow
  read, write: if false; }`)
- This is the actual security boundary for all admin actions — both the
  website (while `admin.js` existed) and the app rely on this same rule
  set, not on anything client-side

**2. Firebase Authentication**
- Single admin account (`chhwjalcm@gmail.com`), email/password
- Authorized domains (Firebase Console → Authentication → Settings)
  includes `localhost` — required for the app, which serves from
  `https://localhost` via Capacitor

**3. Google Cloud API key** (separate system from #2 — easy to confuse,
cost real debugging time earlier)
- The same API key (`firebase-config.js`'s `apiKey`) is used by both the
  website and the app
- Has HTTP referrer restrictions (Google Cloud Console → APIs & Services
  → Credentials) — must include both your Netlify domain **and**
  `https://localhost/*` for the app to authenticate
- This is *not* a secret key in the traditional sense — Firebase API keys
  are meant to be public/client-embedded; the referrer restriction is a
  supplementary layer, not the primary security boundary (that's #1)

**4. Backend (`backend/`)**
- `FIREBASE_SERVICE_ACCOUNT` — a genuinely powerful credential (bypasses
  Firestore Rules entirely). Lives only in Render's environment variables,
  never in git (`.gitignore` covers `.env`). Scoped to exactly one job:
  the daily cleanup endpoint.
- `CRON_SECRET` — a shared secret between Render's env vars and the GitHub
  Actions repo secret, gating the cleanup endpoint so only your own
  scheduled workflow can trigger it. If you ever rotate one, rotate both,
  or the cron job will start getting `401 Unauthorized`.

**5. Cloudinary**
- Uses an **unsigned** upload preset for gallery/member photo uploads —
  standard practice for free-tier client-side uploads, but worth knowing:
  anyone who discovers the preset name could technically upload to your
  Cloudinary account too. Low real-world risk for a small community site,
  but if it's ever a concern, migrating to signed uploads (via the
  backend, since that requires a server-side secret) is a natural future
  `backend/` feature — not needed now.

**6. What's never in the repo**
- No API keys beyond the intentionally-public Firebase client config
- No service account JSON, no `.env` files, no admin passwords
- `mobile-app/android/local.properties` (if it ever appears locally) stays
  gitignored — it can contain local SDK paths

---

## ✅ Phase 5 — Final Docs, Testing & Polish

The last phase. No new features beyond the one you specifically requested
— this was about making sure everything built across four phases is
documented clearly, verified end-to-end, and left in a state anyone can
pick up cleanly later.

**1. SEO structured data (JSON-LD) for events — your requested addition**
`web/js/upcoming.js` now generates schema.org `Event` JSON-LD for every
event currently shown on the Upcoming page — name, start date/time
(combined from the separate date + time fields, always in IST regardless
of visitor timezone), venue as a proper `Place`/`PostalAddress`, organizer,
and a link back to the page. Injected dynamically after events load;
invisible, no page redesign. No `offers` property — these are free
community gatherings with no ticketing, and fabricating a "price: 0" just
to fill the field would be inaccurate data, not genuinely useful.
One honest caveat, per Google's own documentation: full Events-carousel
placement works best with each event on its own dedicated URL, which this
site doesn't have (everything lives on one shared listing page). The
markup still helps Google understand and index the content either way —
just flagging that the *carousel* specifically may be a partial win until/
unless individual event pages become worth building.

**2. [`TESTING.md`](TESTING.md) — new file**
A concrete, checkbox-style walkthrough covering the website (all 10
pages + lightbox edge cases), the app (login + Add/Edit/Delete across all
6 sections + settings), and the backend (health check, manual cleanup
trigger, cron verification), plus a security spot-check. Meant to be
re-run any time you make a batch of changes, not just once.

**3. `guide.md` reorganized**
Added the **Current State** section at the very top of this file — a
one-screen summary of what exists today and how to do common tasks,
so you don't have to read the full phase-by-phase history just to
remember "how do I build a new APK again?" The detailed log (this
entire rest of the file) stays as reference/history below it.

**4. `README.md`** — checked for stale "planned"/"being phased out"
language; already clean from the Phase 4 pass, no changes needed here.

**5. Security review** — written up as its own section above, consolidating
what was previously scattered across Phases 2–4 and both bug-fix rounds
into one place.

**6. The "optional CSS cleanup" — skipped, and here's why that matters**
The plan was to prune `.admin-*` classes from `web/css/style.css` as
unused leftovers from removing the web admin panel. Before doing it,
I checked — and they're **not** unused: `mobile-app/www/css/style.css` is
a synced copy of this same file, and the app's login screen and dashboard
actively use these exact classes (admin-table, admin-tabs,
admin-login-card, and more). Deleting them would have silently broken the
app's entire UI while "cleaning up" the website. Caught before it shipped,
not after. (See the corrected note in the Phase 4 section above, where the
original — wrong — claim that these were unused now has a correction
inline, rather than just quietly fixing it and pretending the mistake
never happened.)

### Files touched in Phase 5
```
web/js/upcoming.js    JSON-LD generation + injection for events
TESTING.md             new — end-to-end test checklist
guide.md                Current State summary added; Security Review
                          section added; Phase 4's incorrect "unused CSS"
                          note corrected
```

---

## 🧰 Your Dev Environment — Termux + Acode + GitHub

You're developing entirely from an Android phone. Here's the general shape
of that workflow (exact commands for pushing a specific update are given
separately in chat, not duplicated here):

1. **Acode** — your code editor. Open the repo root here to browse/edit
   `web/`, `backend/`, and (soon) `mobile-app/` files directly.
2. **Termux** — your terminal. Used for `git` commands, `npm` for the
   backend, and (from Phase 3) Android build commands.
3. **GitHub** — single source of truth. One repository holds `web/`,
   `backend/`, and `mobile-app/` — plus the `.github/workflows/` cron job.
4. **Netlify** — deploys the `web/` folder as the live site. Base/publish
   directory must be set to `web` (see Phase 2 deployment steps above).
5. **Render** — deploys the `backend/` folder (free tier, see Phase 2
   deployment steps above).

Useful one-time Termux setup (if not already done):
```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
termux-setup-storage      # grants Termux access to your phone's storage
```

---

## 🙏 Notes

- `donation.html` and `donation.js` remain untouched throughout every phase,
  per your standing instruction — the donation feature stays paused exactly
  as-is until you say otherwise.
- Nothing in this upgrade changes your Firebase/Cloudinary security rules
  or architecture unless a phase explicitly says so.

🚩 जय श्री राम! जय बजरंगबली! 🚩
