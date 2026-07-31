# ✅ End-to-End Testing Checklist

A single-sitting walkthrough covering the website, the admin app, and the
backend — so you can verify everything works at once instead of finding
issues piecemeal. Check items off as you go. If anything fails, note the
exact page/button and what happened, and send that over.

---

## 🌐 Website (balajisundarkand.netlify.app)

### Every page loads correctly
- [ ] **Home** — carousel auto-scrolls, pauses on touch/hover, images load from Cloudinary
- [ ] **Upcoming** — events list shows correctly; any event whose date has passed is *not* shown
- [ ] **Live** — if no live link is set: shows the "Live Streaming Will Start Soon" message (not an infinite spinner). If a live link *is* set: video embeds and plays
- [ ] **Sundarkand** — verses display with proper styling (numbered badge, Sanskrit + Hindi side by side on wide screens, stacked on mobile); Dark Mode button actually switches to dark colors; A+/A− buttons visibly change text size; Auto Scroll button starts/stops page scrolling
- [ ] **Gallery** — grid loads images; tapping an image opens the lightbox
- [ ] **Donation** — still shows the "Temporarily Paused" message, untouched
- [ ] **About** — Mandal info displays; member cards show (photo ring, position badge); footer credit line is plain text (not a link)
- [ ] **Privacy Policy / Terms of Service / Disclaimer** — all three load, legal content renders with proper formatting

### Cross-cutting checks
- [ ] Banner image displays *fully*, uncropped, on both a phone-width screen and a wide desktop browser window
- [ ] Hamburger menu opens/closes correctly on mobile
- [ ] Footer legal links (Privacy/Terms/Disclaimer) work from every page
- [ ] No page shows a broken image icon anywhere (logo, banner, member photos, gallery images)
- [ ] WhatsApp / YouTube floating buttons appear and link correctly

### Gallery lightbox specifically
- [ ] Tapping ‹ › arrows moves to the previous/next image
- [ ] Swiping left/right on a touchscreen also navigates
- [ ] **Pinch-to-zoom on a photo does *not* accidentally jump to the next image**
- [ ] Image counter (e.g. "3 / 12") updates correctly
- [ ] Closing (✕ or tapping the backdrop) works; clicking the photo itself does not close it

---

## 📱 Mandal Admin App (v0.0.3+)

### Login
- [ ] App opens to a themed loading screen (logo + progress bar), not a blank/frozen screen
- [ ] Correct email + password logs in successfully
- [ ] Wrong password shows a clear, specific error (not a silent failure)
- [ ] App icon and splash screen show the Mandal logo (not a default Capacitor icon)

### Each of the 6 sections — Add, Edit, Delete
For each of: **Donations, Events, Past Lives, Gallery, Members, Sundarkand verses**
- [ ] Add a new test item — appears in the list immediately after
- [ ] Tap ✏️ Edit on that item — modal opens pre-filled with current values
- [ ] Change one field, save — list updates with the new value
- [ ] Tap 🗑 Delete on the test item — it disappears from the list

### Events specifically
- [ ] Add an event with an **Expiry Date** set — confirm it still shows on the public Upcoming page until that date passes
- [ ] Add an event with *no* expiry date — confirm it uses the event's own date as the cutoff (per Phase 1 logic)

### Settings tab
- [ ] Updating the announcement text reflects on the website's scrolling announcement bar
- [ ] Updating the live YouTube link makes the Live page show the video instead of the "coming soon" message

### Logout
- [ ] Logout button returns to the login screen and actually requires logging in again (doesn't silently stay authenticated)

---

## ⚙️ Backend (Render)

- [ ] Visit `<your-render-url>/health` — returns `OK`
- [ ] Manually trigger the cleanup endpoint once more (GitHub Actions tab → "Daily Expired Events Cleanup" → Run workflow) — confirm it completes without error
- [ ] Check that the GitHub Actions cron has actually fired on its own schedule at least once (Actions tab → look for an automatic, non-manual run) — if it's only ever run manually so far, that's worth watching for a day or two

---

## 🔐 Security spot-check

- [ ] Firestore Rules still restrict writes to the admin account only (already confirmed working — this is just a "still true" check, not new testing)
- [ ] Google Cloud API key's HTTP referrer restrictions include whatever origins you actually need (`https://localhost` for the app, your Netlify domain for the site)
- [ ] `CRON_SECRET` matches between Render's environment variables and the GitHub repo secret (if you ever rotate one, rotate both)

---

## If something fails

Note exactly:
1. Which page/screen
2. What you tapped/did
3. What happened vs. what you expected
4. A screenshot if it's visual

That's the fastest path to a fix — exact repro steps beat "X is broken" every time.
