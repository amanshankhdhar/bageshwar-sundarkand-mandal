// ============================================
//  home.js — Home Page Logic (Upgraded v2)
// ============================================

import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, getDocs, query, where, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadHomeStats();
  loadRecentSupporters();
});

// ── Announcement ──────────────────────────────
async function loadAnnouncement() {
  const el = document.getElementById("marquee-text");
  if (!el) return;
  try {
    const snap = await getDoc(doc(db, "settings", "announcement"));
    if (snap.exists() && snap.data().message) {
      el.textContent = "🚩 " + snap.data().message + " 🚩";
    } else {
      el.textContent = "🚩 जय श्री राम! बागेश्वर बालाजी सुंदरकांड मंडल, नगला डल्लू में आपका स्वागत है 🚩";
    }
  } catch {
    el.textContent = "🚩 जय श्री राम! बागेश्वर बालाजी सुंदरकांड मंडल, नगला डल्लू में आपका स्वागत है 🚩";
  }
}

// ── Stats ────────────────────────────────────
async function loadHomeStats() {
  try {
    const eventsSnap = await getCountFromServer(collection(db, "events"));
    const el = document.getElementById("stat-events");
    if (el) el.textContent = eventsSnap.data().count;
  } catch {}
  try {
    const membersSnap = await getCountFromServer(collection(db, "members"));
    const el = document.getElementById("stat-members");
    if (el) el.textContent = membersSnap.data().count;
  } catch {}
}

// ── Recent Supporters ─────────────────────────
async function loadRecentSupporters() {
  const listEl = document.getElementById("supporters-list");
  if (!listEl) return;
  try {
    const q = query(collection(db, "donations"), where("status", "==", "verified"));
    const snapshot = await getDocs(q);

    let donations = [];
    snapshot.forEach(d => donations.push(d.data()));
    donations.sort((a, b) => {
      const tA = a.date?.seconds ?? 0;
      const tB = b.date?.seconds ?? 0;
      return tB - tA;
    });
    const top3 = donations.slice(0, 3);

    if (top3.length === 0) {
      listEl.innerHTML = `<div class="supporters-empty">🙏 अभी तक कोई सहयोगी नहीं।<br><span>Be the first to support!</span></div>`;
      return;
    }

    listEl.innerHTML = top3.map(d => {
      const isAnon = d.anonymous || !d.name?.trim();
      const displayName = isAnon ? "Anonymous / गुमनाम" : d.name.trim();
      const avatarChar  = isAnon ? "🙏" : d.name.trim().charAt(0).toUpperCase();
      return `
        <div class="supporter-item">
          <div class="supporter-avatar">${avatarChar}</div>
          <div>
            <div class="supporter-name">• ${displayName}</div>
            <div class="supporter-tag">सहयोगी • Supporter</div>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    console.error("Supporters error:", err);
    listEl.innerHTML = `<div class="supporters-empty">⚠️ लोड नहीं हो सका।</div>`;
  }
}
