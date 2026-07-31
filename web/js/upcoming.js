// ============================================
//  upcoming.js — Upcoming Events Page
// ============================================

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadEvents();
});

// ── SEO: JSON-LD structured data for events ────
// Lets Google (and AI answer engines) understand event name/date/location
// as structured facts rather than plain text — the prerequisite for
// Google's Events rich-results carousel. Purely invisible metadata; no
// visual effect on the page. See guide.md, Phase 5, for the full writeup.
const SITE_URL = "https://balajisundarkand.netlify.app";

function combineDateAndTimeToISO(dateVal, timeStr) {
  let baseDate;
  if (dateVal && dateVal.toDate) baseDate = dateVal.toDate();
  else if (typeof dateVal === "string") baseDate = new Date(dateVal);
  else return null;
  if (isNaN(baseDate.getTime())) return null;

  // Default to 6:00 PM if no time was set — better than omitting startDate
  // entirely, since startDate is a required property for Event rich results.
  let hours = 18, minutes = 0;
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    hours = h; minutes = m;
  }

  // Built manually with a fixed +05:30 offset rather than toISOString()
  // (which converts to UTC based on the *visitor's* browser timezone —
  // wrong here, since the event itself always happens in India time
  // regardless of who's viewing the page).
  const y = baseDate.getFullYear();
  const mo = String(baseDate.getMonth() + 1).padStart(2, "0");
  const d = String(baseDate.getDate()).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${y}-${mo}-${d}T${hh}:${mm}:00+05:30`;
}

function buildEventJsonLd(ev) {
  const startDate = combineDateAndTimeToISO(ev.date, ev.time);
  if (!startDate) return null; // startDate is required — skip if unparseable

  const templeName = ev.templeName || "Bageshwar Bala Ji Sundarkand Mandal";
  const locationText = ev.locationText || "Nagla Dallu";
  const organizerName = ev.organizer || "Bageshwar Bala Ji Sundarkand Mandal";
  const title = ev.title || "Sundarkand Path";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": title,
    "startDate": startDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": templeName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": locationText,
        "addressLocality": "Nagla Dallu",
        "addressRegion": "Uttar Pradesh",
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": organizerName,
      "url": SITE_URL
    },
    "description": `${title} at ${templeName}, ${locationText}. Organized by ${organizerName}. All devotees are welcome.`,
    "image": `${SITE_URL}/assets/logo.webp`,
    "url": `${SITE_URL}/upcoming.html`
  };
  // Note: no "offers" property — these are free community gatherings with
  // no ticketing, so it's omitted rather than filled in with fabricated
  // "price: 0" data (offers is only required by Google if it's present).
}

function injectEventsJsonLd(upcomingDocs) {
  const existing = document.getElementById("events-jsonld");
  if (existing) existing.remove();

  const events = upcomingDocs.map(buildEventJsonLd).filter(Boolean);
  if (events.length === 0) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "events-jsonld";
  script.textContent = JSON.stringify(events.length === 1 ? events[0] : events);
  document.head.appendChild(script);
}

// ── Announcement ─────────────────────────────
async function loadAnnouncement() {
  const el = document.getElementById("marquee-text");
  if (!el) return;
  try {
    const snap = await getDoc(doc(db, "settings", "announcement"));
    el.textContent = snap.exists() && snap.data().message
      ? "🚩 " + snap.data().message + " 🚩"
      : "🚩 जय श्री राम! Bageshwar Bala Ji Sundarkand Mandal Nagla Dallu 🚩";
  } catch {
    el.textContent = "🚩 जय श्री राम! Bageshwar Bala Ji Sundarkand Mandal Nagla Dallu 🚩";
  }
}

// ── Load Events ───────────────────────────────
async function loadEvents() {
  const container = document.getElementById("events-list");
  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading events...</p>
    </div>`;

  try {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    // ── Auto-hide expired events ──────────────────────────────
    // An event "expires" at the end of its expiryDate (if set), otherwise
    // at the end of its own event date. Expired events are filtered out
    // of the public listing here. (True deletion from the database is
    // handled by the scheduled backend cleanup job — see Phase 3.)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const toJsDate = (val) => {
      if (!val) return null;
      if (val.toDate) return val.toDate();           // Firestore Timestamp
      const d = new Date(val);                        // string / ISO date
      return isNaN(d.getTime()) ? null : d;
    };

    const upcomingDocs = [];
    snapshot.forEach((docSnap) => {
      const ev = docSnap.data();
      const expiryRef = toJsDate(ev.expiryDate) || toJsDate(ev.date);
      if (expiryRef && expiryRef < startOfToday) return; // expired — skip
      upcomingDocs.push(ev);
    });

    if (upcomingDocs.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info">
          📅 No upcoming events at the moment. Stay tuned!
          (फिलहाल कोई आगामी कार्यक्रम नहीं है। भविष्य में आने वाली जानकारी के लिए हमारे साथ जुड़े रहें!)
        </div>`;
      return;
    }

    let html = "";
    upcomingDocs.forEach((ev) => {

      // Convert Firestore Timestamp to readable date
      let dateStr = "TBA";
      if (ev.date && ev.date.toDate) {
        dateStr = ev.date.toDate().toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else if (typeof ev.date === "string") {
        dateStr = ev.date;
      }

      html += `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.8rem;">
            <h3 class="card-title">📅 ${ev.title || "Unnamed Event"}</h3>
          </div>
          <p class="card-meta">🗓️ <strong>दिनांक (Date):</strong> ${dateStr}</p>
          <p class="card-meta">🕐 <strong>समय (Time):</strong> ${ev.time || "N/A"}</p>
          <p class="card-meta">🛕 <strong>स्थान (Venue):</strong> ${ev.templeName || ""}, ${ev.locationText || ""}</p>
          <p class="card-meta">👤 <strong>आयोजक (Organizer):</strong> ${ev.organizer || "N/A"}</p>
          ${
            ev.googleMapLink
              ? `<a href="${ev.googleMapLink}" target="_blank" rel="noopener"
                   style="display:inline-block; margin-top:0.8rem; color:var(--saffron-dark); font-weight:600;">
                   📍 Google Maps पर देखें (View on Google Maps) ↗️
                 </a>`
              : ""
          }
        </div>`;
    });

    container.innerHTML = html;
    injectEventsJsonLd(upcomingDocs);
  } catch (error) {
    console.error("Error loading events:", error);
    container.innerHTML = `
      <div class="alert alert-error">
        ⚠️ Failed to load events. Please try again later.
      </div>`;
  }
}
