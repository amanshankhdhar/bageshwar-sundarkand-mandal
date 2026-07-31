// ============================================
//  sundarkand.js — Sundarkand Text Reader Page
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

// ── State ─────────────────────────────────────
let currentFontSize = 17;
let darkMode = false;
let autoScrollInterval = null;
let autoScrollSpeed = 1; // px per tick

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadSundarkandText();
  setupControls();
});

// ── Announcement ─────────────────────────────
async function loadAnnouncement() {
  const el = document.getElementById("marquee-text");
  if (!el) return;
  try {
    const snap = await getDoc(doc(db, "settings", "announcement"));
    el.textContent = snap.exists() && snap.data().message
      ? "🚩 " + snap.data().message + " 🚩"
      : "🚩 जय श्री राम! Sundarkand Mandal 🚩";
  } catch {
    el.textContent = "🚩 जय श्री राम! Sundarkand Mandal 🚩";
  }
}

// ── Load Sundarkand Text from Firestore ───────
async function loadSundarkandText() {
  const container = document.getElementById("sundarkand-content");
  container.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading Sundarkand Path...</p>
    </div>`;

  try {
    const q = query(
      collection(db, "sundarkandText"),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="alert alert-info" style="text-align:center; padding:2rem;">
          <p>🙏 Sundarkand text is being added. Please visit soon.</p>
        </div>`;
      return;
    }

    let html = "";
    let i = 1;
    snapshot.forEach((docSnap) => {
      const v = docSnap.data();
      html += `
        <div class="verse-block">
          <div class="verse-number">${i}</div>
          <div class="verse-columns">
            <div>
              <div class="verse-divider-label">संस्कृत / Sanskrit</div>
              <div class="verse-sanskrit">${v.sanskrit || ""}</div>
            </div>
            <div>
              <div class="verse-divider-label">हिंदी अर्थ / Hindi Meaning</div>
              <div class="verse-hindi">${v.hindiMeaning || ""}</div>
            </div>
          </div>
        </div>`;
      i++;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Sundarkand load error:", error);
    container.innerHTML = `
      <div class="alert alert-error">
        ⚠️ Failed to load Sundarkand text. Please refresh and try again.
      </div>`;
  }
}

// ── Setup Reader Controls ─────────────────────
function setupControls() {
  const reader = document.getElementById("sundarkand-reader");

  // Dark Mode
  document.getElementById("btn-dark").addEventListener("click", function () {
    darkMode = !darkMode;
    reader.classList.toggle("dark-mode", darkMode);
    this.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    this.classList.toggle("active", darkMode);
  });

  // Font Increase
  document.getElementById("btn-inc").addEventListener("click", () => {
    currentFontSize = Math.min(32, currentFontSize + 2);
    reader.style.fontSize = currentFontSize + "px";
  });

  // Font Decrease
  document.getElementById("btn-dec").addEventListener("click", () => {
    currentFontSize = Math.max(12, currentFontSize - 2);
    reader.style.fontSize = currentFontSize + "px";
  });

  // Auto Scroll
  document.getElementById("btn-scroll").addEventListener("click", function () {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
      this.textContent = "⬇️ Auto Scroll";
      this.classList.remove("active");
    } else {
      autoScrollInterval = setInterval(() => {
        window.scrollBy({ top: autoScrollSpeed, behavior: "auto" });
        // Stop at bottom
        if (
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight - 50
        ) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
          document.getElementById("btn-scroll").textContent = "⬇️ Auto Scroll";
          document.getElementById("btn-scroll").classList.remove("active");
        }
      }, 30);
      this.textContent = "⏸️ Pause Scroll";
      this.classList.add("active");
    }
  });

  // Speed control
  const speedEl = document.getElementById("scroll-speed");
  if (speedEl) {
    speedEl.addEventListener("input", (e) => {
      autoScrollSpeed = parseInt(e.target.value) || 1;
    });
  }
}