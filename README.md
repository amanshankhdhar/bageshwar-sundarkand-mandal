<div align="center">

<img src="web/assets/logo.webp" alt="Bageshwar Bala Ji Mandal Logo" width="120" height="120" style="border-radius:50%;" />

<br/>

# 🚩 बागेश्वर बाला जी सुंदरकांड मंडल
## Bageshwar Bala Ji Sundarkand Mandal, Nagla Dallu

**नगला डल्लू की आधिकारिक धार्मिक वेब पोर्टल**
*Official Religious Web Portal of Nagla Dallu*

<br/>

[![Live Website](https://img.shields.io/badge/🌐_Live_Website-Visit_Now-FF6B00?style=for-the-badge)](https://balajisundarkand.netlify.app)
[![Netlify Status](https://img.shields.io/badge/Hosted_On-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> 🕉️ *जय श्री राम! जय बजरंगबली!* 🚩
> *हर घर में सुंदरकांड की दिव्य ऊर्जा का प्रसार हो।*

---

</div>

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Pages](#-pages)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Testing Checklist](TESTING.md)
- [Firebase Setup](#-firebase-setup)
- [Cloudinary Setup](#-cloudinary-setup)
- [Performance](#-performance)
- [Legal Pages](#-legal-pages)
- [Security](#-security)
- [Contact](#-contact)

---

## 🛕 About the Project

**बागेश्वर बाला जी सुंदरकांड मंडल** is a community religious organization based
in the pious village of **Nagla Dallu**. This website is the official digital
presence of the Mandal, built to serve devotees with live streaming, event
information, Sundarkand text, donation acknowledgement, and more.

यह वेबसाइट मंडल के भक्तों को एक डिजिटल मंच प्रदान करती है जहाँ वे —
- सुंदरकांड पाठ ऑनलाइन पढ़ सकते हैं
- लाइव प्रसारण देख सकते हैं
- आगामी कार्यक्रमों की जानकारी ले सकते हैं
- मंडल की सेवा में दान कर सकते हैं (currently paused — see Donation page)
- गैलरी व सदस्यों की जानकारी देख सकते हैं

---

## 🌐 Live Demo

| Platform | Link |
|----------|------|
| 🌍 Live Website | [balajisundarkand.netlify.app](https://balajisundarkand.netlify.app) |
| 📺 YouTube Channel | [@BalaJiSundarkand](https://www.youtube.com/@BalaJiSundarkand) |
| 💬 WhatsApp Group | [Join Here](https://chat.whatsapp.com/KI2jvB22PejKQcpKCHP8Ee) |

---

## ✨ Features

### 🙏 Public Features
| Feature | Description |
|---------|-------------|
| 🏠 **Home Page** | Auto-scrolling Cloudinary image carousel, welcome hero, live stats, recent supporters |
| 📖 **Sundarkand Path** | Complete Sundarkand text with Hindi meaning in a beautiful, readable layout |
| 🔴 **Live Streaming** | Embedded YouTube live stream — plays directly on the website |
| 🎬 **Past Recordings** | All past Sundarkand sessions embedded on the Live page |
| 📅 **Upcoming Events** | Event details with date, time, venue, Google Maps link — **auto-hides once an event has expired** |
| 🖼️ **Gallery** | Photo gallery with a full lightbox viewer — **Prev/Next arrows, swipe, keyboard navigation, image counter** |
| 🙏 **Donation** | Currently paused per Bageshwar Dham Sarkar's religious guidelines — page and logic untouched |
| 👥 **About & Members** | Mandal information, core members (premium ring-photo cards), contact details |
| 📢 **Announcements** | Live scrolling announcement bar managed by the admin |
| ⚖️ **Legal Pages** | Full Privacy Policy, Terms of Service, and Disclaimer — themed to match the site |

### 📱 UI/UX Features
- ✅ Fully **mobile responsive** with a hamburger navigation menu
- ✅ **Sticky header** with a banner that displays fully on *every* screen
  size (desktop no longer crops the banner)
- ✅ **Saffron, maroon & gold** devotional theme with glassmorphism and soft
  shadows — modern web-app feel without losing the traditional look
- ✅ **Devanagari-first typography** (Noto Serif Devanagari + Poppins)
- ✅ **Scroll-reveal animations** throughout
- ✅ **WebP images with automatic fallback** — assets shrunk by 95%+ with no
  visible quality loss (see [Performance](#-performance))
- ✅ Floating WhatsApp / YouTube subscribe buttons

---

## 📄 Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Carousel, hero, stats, supporters, service cards |
| Upcoming | `upcoming.html` | Event listing (auto-hides expired events) |
| Live | `live.html` | Live stream + past recordings |
| Sundarkand | `sundarkand.html` | Full Sundarkand path text |
| Gallery | `gallery.html` | Photo gallery with lightbox |
| Donation | `donation.html` | Currently paused (untouched by design) |
| About | `about.html` | Mandal info, members, contact — **only page showing developer credit** |
| Privacy Policy | `privacy-policy.html` | Full data-handling disclosure |
| Terms of Service | `terms-of-service.html` | Usage terms, donation T&C |
| Disclaimer | `disclaimer.html` | Religious/legal disclaimers |

> The admin panel has been **removed from the website entirely** — all
> admin functionality now lives in the dedicated Android app
> (`mobile-app/`). See [`mobile-app/README.md`](mobile-app/README.md).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES Modules) — **no frameworks** |
| Database | Google Firebase Firestore |
| Auth | Firebase Authentication |
| Image Hosting | Cloudinary (unsigned upload preset) |
| Hosting | Netlify (free tier) |
| Fonts | Google Fonts — Noto Serif Devanagari, Poppins |
| Backend | Node.js / Express — deployed on **Render** (free tier) — see `backend/` |
| Mobile App | Capacitor (Android) — see `mobile-app/` — talks to Firestore directly, same as the web admin |

Everything is chosen to fit comfortably inside **free tiers** — no paid
APIs, no heavy libraries, minimal bandwidth.

---

## 📁 Project Structure

This is a **monorepo** — website, backend, and (soon) the Android admin app
all live in one GitHub repository:

```
bageshwar-sundarkand-mandal/
├── web/                     ← the website — THIS is what Netlify deploys
│   ├── index.html, about.html, gallery.html, ...
│   ├── privacy-policy.html, terms-of-service.html, disclaimer.html
│   ├── (no admin panel here — see mobile-app/ below)
│   ├── css/style.css
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── home.js, gallery.js, about.js, upcoming.js, live.js, sundarkand.js
│   │   ├── carousel.js
│   │   └── donation.js       (untouched)
│   ├── assets/                (logo, banner, member photo — WebP + SVG, no fallback formats)
│   ├── robots.txt, sitemap.xml
├── backend/                 ← Node/Express API — THIS is what Render deploys
│   ├── server.js, config/, routes/, middleware/
│   ├── package.json, .env.example, README.md
├── mobile-app/               ← Android admin app (Capacitor) — see mobile-app/README.md
│   ├── www/                  (app UI — login, dashboard, all 6 admin sections)
│   ├── android/               (native project — builds via GitHub Actions or Termux)
│   └── README.md
├── .github/workflows/
│   └── cleanup-cron.yml     ← daily scheduled event cleanup
├── render.yaml               ← Render Blueprint (optional one-click deploy)
├── guide.md                  ← full multi-phase upgrade log — read this!
└── README.md
```

---

## 🗺️ Roadmap

This project is being upgraded in five tracked phases — full detail for each
lives in **[`guide.md`](guide.md)**:

1. ✅ **Website Polish & Performance** — WebP images, banner fix, lightbox
   navigation, member card redesign, event auto-expiry, credit line cleanup
2. ✅ **Backend on Render + Monorepo Restructure** — `web/` + `backend/` +
   `mobile-app/`, daily scheduled cleanup of expired events
3. ✅ **Android Admin App v0.0.3** — installable, login-protected admin app
   (`mobile-app/`), built *before* the web admin panel is removed, so admin
   access is never interrupted — see [`mobile-app/README.md`](mobile-app/README.md).
   Includes real app icon, splash screen, and loading screen (generated
   from the Mandal logo), plus full Edit capability (not just Add/Delete)
   across every admin section. A round of hands-on testing surfaced and
   fixed several real bugs — see `guide.md`'s "Bug-Fix Pass" section.
4. ✅ **Remove Web Admin Panel** — `web/admin-login.html`,
   `web/admin-dashboard.html`, and `web/js/admin.js` removed entirely. The
   app is now the sole admin surface.
5. ✅ **Final Docs, Testing & Polish** — SEO structured data (JSON-LD) for
   events, [`TESTING.md`](TESTING.md) end-to-end checklist, and a
   consolidated security review — all in [`guide.md`](guide.md)

**All 5 phases complete.** 🎉

Confirmed for later (once everything above is stable in real-world use):
blog/article publishing with author + published/updated timestamps,
broader user login, and richer donation tracking — expanding on the
`backend/` foundation, per your own plan. Not built yet — see
`guide.md`'s Current State section for the full picture of what exists
today versus what's still ahead.

---

## 🔥 Firebase Setup

This project uses **Firestore** (not Realtime Database) and **Firebase
Authentication** (email/password, single admin account). See
`js/firebase-config.js` for the client config. Firestore Security Rules
restrict all writes to the authenticated admin — public users may only
create new `donations` documents (their own submission) and read public
collections (`events`, `gallery`, `members`, `settings`).

## ☁️ Cloudinary Setup

Gallery and member images are uploaded via an **unsigned upload preset** to
Cloudinary, avoiding the need for Firebase Storage (which requires a
paid plan for meaningful usage). The homepage carousel (`js/carousel.js`)
reads image URLs back out of Firestore's `gallery` collection.

## ⚡ Performance

As of Phase 1, all core visual assets are served as WebP with fallback:

| Asset | Original | Optimized | Reduction |
|---|---|---|---|
| Logo | 2.4 MB | 32 KB | 98.7% |
| Header Banner | 2.5 MB | 112 KB | 95.5% |
| Default Member Photo | 1.3 MB | 16 KB | 98.8% |

Combined with lazy-loading on gallery/carousel images and scroll-reveal
animations that don't block rendering, the site loads fast even on a
patchy rural mobile connection.

## ⚖️ Legal Pages

Full, India-specific **Privacy Policy**, **Terms of Service**, and
**Disclaimer** pages are included, covering donation terms, third-party
services (Firebase, Cloudinary, Netlify, YouTube, WhatsApp), data retention,
and user rights — themed to match the site rather than looking like a
generic legal boilerplate page.

## 🔒 Security

- Firestore Security Rules gate all writes behind Firebase Auth
- No payment credentials are ever collected or stored — donations are UPI,
  verified by transaction ID only
- HTTPS enforced site-wide via Netlify
- Admin credentials are never hardcoded in client code

---

## 📞 Contact

- 📧 [balajisundarkandnagladallu@gmail.com](mailto:balajisundarkandnagladallu@gmail.com)
- 📞 [+91 79832 74853](tel:+917983274853)
- 📍 Nagla Dallu, Uttar Pradesh, India

---

<div align="center">

🚩 **जय श्री राम! जय बजरंगबली!** 🚩

</div>
