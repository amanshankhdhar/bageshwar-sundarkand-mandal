// ============================================
//  live.js
//  Live Streaming + Past Recordings Page
//  Videos play DIRECTLY on website
//  No redirect to YouTube!
//  Bageshwar Bala Ji Sundarkand Mandal
// ============================================

import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ─────────────────────────────────────────────
// On Page Load
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadCurrentLive();
  loadPastLives();
});

// ─────────────────────────────────────────────
// Load Announcement
// ─────────────────────────────────────────────
async function loadAnnouncement() {
  const el = document.getElementById("marquee-text");
  if (!el) return;
  try {
    const snap = await getDoc(doc(db, "settings", "announcement"));
    if (snap.exists() && snap.data().message) {
      el.textContent = "🚩 " + snap.data().message + " 🚩";
    } else {
      el.textContent = "🚩 जय श्री राम! बागेश्वर बाला जी सुंदरकांड मंडल 🚩";
    }
  } catch {
    el.textContent = "🚩 जय श्री राम! बागेश्वर बाला जी सुंदरकांड मंडल 🚩";
  }
}

// ─────────────────────────────────────────────
// KEY FUNCTION: Extract YouTube Video ID
// Works with ALL types of YouTube links:
//   youtube.com/watch?v=XXXXX
//   youtu.be/XXXXX
//   youtube.com/embed/XXXXX
//   youtube.com/live/XXXXX
//   youtube.com/shorts/XXXXX
// ─────────────────────────────────────────────
function extractYouTubeID(url) {
  if (!url || url.trim() === "") return null;

  // This single regex handles all YouTube URL formats
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

// ─────────────────────────────────────────────
// Create Embedded Player HTML
// This plays the video INSIDE your website
// ─────────────────────────────────────────────
function createEmbedPlayer(videoId, autoplay = false) {
  const autoplayParam = autoplay ? "&autoplay=1&mute=1" : "";
  return `
    <div style="
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 12px;
      background: #000;
    ">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?rel=0${autoplayParam}&modestbranding=1"
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        "
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
        title="YouTube Video Player">
      </iframe>
    </div>`;
}

// ─────────────────────────────────────────────
// Load Current Live Stream
// ─────────────────────────────────────────────
async function loadCurrentLive() {
  const container = document.getElementById("current-live-container");
  if (!container) return;

  try {
    const snap = await getDoc(doc(db, "settings", "live"));
    const link = snap.exists() ? (snap.data().currentLiveLink || "").trim() : "";

    const videoId = extractYouTubeID(link);

    if (videoId) {
      // Show LIVE badge and embedded player
      container.innerHTML = `
        <div style="text-align:center; margin-bottom:1rem;">
          <span style="
            background: #e74c3c;
            color: white;
            padding: 6px 18px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.95rem;
            animation: pulse 1.5s infinite;
          ">🔴 LIVE NOW</span>
        </div>
        <div style="
          border: 3px solid var(--saffron);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          margin-bottom: 1.5rem;
        ">
          ${createEmbedPlayer(videoId, true)}
        </div>
        <div style="
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
          color: #856404;
          text-align: center;
        ">
          🔔 If video doesn't play, make sure you're on a good internet connection.
        </div>`;
    } else {
      // No live stream set — show "coming soon" box
      container.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border: 3px solid var(--saffron);
          border-radius: 14px;
          padding: 4rem 2rem;
          text-align: center;
          margin-bottom: 2rem;
        ">
          <div style="font-size: 5rem; margin-bottom: 1rem;">📡</div>
          <h3 style="color: var(--gold); font-size: 1.6rem; margin-bottom: 0.5rem;">
            Live Streaming Will Start Soon (लाइव स्ट्रीमिंग जल्द ही शुरू होगी।)
          </h3>
          <p style="color: #bdc3c7; font-size: 1rem; margin-bottom: 1.5rem;">
            Subscribe to our YouTube channel and press the 🔔 bell icon to get notified! 
            (हमारे यूट्यूब चैनल को सब्सक्राइब करें और सूचित रहने के लिए बेल आइकन दबाएं!)
          </p>
          <a
            href="https://www.youtube.com/@BalaJiSundarkand?sub_confirmation=1"
            target="_blank"
            rel="noopener"
            style="
              display: inline-block;
              background: #ff0000;
              color: white;
              padding: 0.75rem 2rem;
              border-radius: 30px;
              font-weight: bold;
              text-decoration: none;
              font-size: 1rem;
            ">
            ▶ Subscribe on YouTube
          </a>
        </div>`;
    }
  } catch (err) {
    console.error("Live stream error:", err);
    container.innerHTML = `
      <div style="
        background: #f8d7da;
        border-left: 4px solid #e74c3c;
        padding: 1rem;
        border-radius: 8px;
      ">
        <strong>⚠️ Error loading live stream.</strong> Please refresh the page.
      </div>`;
  }
}

// ─────────────────────────────────────────────
// Load Past Live Recordings
// Each video plays directly on the page!
// ─────────────────────────────────────────────
async function loadPastLives() {
  const container = document.getElementById("past-lives-list");
  if (!container) return;

  // Show spinner
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align:center; padding:2rem;">
      <div class="spinner" style="margin: 0 auto 1rem;"></div>
      <p style="color:#999;">Loading recordings...</p>
    </div>`;

  try {
    const q = query(collection(db, "pastLives"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:#999;">
          <div style="font-size:3rem; margin-bottom:1rem;">🎬</div>
          <p>No past recordings available yet.</p>
        </div>`;
      return;
    }

    let html = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      let dateStr = "";
      if (data.date && data.date.toDate) {
        dateStr = data.date.toDate().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      const videoId = extractYouTubeID(data.youtubeLink || "");

      if (videoId) {
        // Build a card with embedded video player INSIDE the website
        html += `
          <div style="
            background: white;
            border: 2px solid var(--saffron-light);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            transition: transform 0.2s;
          "
          onmouseenter="this.style.transform='translateY(-3px)'"
          onmouseleave="this.style.transform='translateY(0)'"
          >
            ${createEmbedPlayer(videoId, false)}
            <div style="padding: 1rem;">
              <h4 style="
                color: var(--red-dark);
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 0.4rem;
                line-height: 1.4;
              ">${data.title || "Sundarkand Path Recording"}</h4>
              <p style="
                color: #777;
                font-size: 0.85rem;
                margin: 0;
              ">📅 ${dateStr}</p>
            </div>
          </div>`;
      } else {
        // Fallback if video ID could not be extracted
        html += `
          <div style="
            background: white;
            border: 2px solid var(--saffron-light);
            border-radius: 12px;
            overflow: hidden;
          ">
            <div style="
              background: linear-gradient(135deg, #1a1a2e, #2c3e50);
              height: 150px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              gap: 0.5rem;
            ">
              <span style="font-size:3rem;">🎬</span>
              <a
                href="${data.youtubeLink || '#'}"
                target="_blank"
                rel="noopener"
                style="color:var(--gold); font-size:0.85rem; font-weight:600;">
                Watch on YouTube ↗
              </a>
            </div>
            <div style="padding:1rem;">
              <h4 style="color:var(--red-dark); font-size:1rem;">${data.title || "Recording"}</h4>
              <p style="color:#777; font-size:0.85rem;">📅 ${dateStr}</p>
            </div>
          </div>`;
      }
    });

    container.innerHTML = html;

  } catch (err) {
    console.error("Past lives error:", err);
    container.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        background: #fadbd8;
        border-left: 4px solid #e74c3c;
        padding: 1rem;
        border-radius: 8px;
      ">
        <strong>⚠️ Error loading recordings.</strong> Please refresh the page.
      </div>`;
  }
}
