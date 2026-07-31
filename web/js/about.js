// ============================================
//  about.js — About Page Logic
// ============================================

import { db } from "./firebase-config.js";
import {
  collection, getDocs, orderBy, query, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadMembers();
});

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

async function loadMembers() {
  const container = document.getElementById("members-list");
  if (!container) return;

  try {
    const q = query(collection(db, "members"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `<div class="alert alert-info" style="grid-column:1/-1;text-align:center;">👥 सदस्यों की जानकारी जल्द ही अपडेट की जाएगी।</div>`;
      return;
    }

    let html = "";
    snapshot.forEach((docSnap) => {
      const m = docSnap.data();
      const name     = m.name     || "—";
      const position = m.position || "";
      const contact  = m.contact  || "";
      const photoUrl = m.photoUrl || "assets/default-member.svg";

      html += `
        <div class="member-card">
          <div class="member-photo-ring">
            <img
              src="${photoUrl}"
              alt="${name}"
              class="member-photo"
              loading="lazy"
              onerror="this.src='assets/default-member.svg'"
            />
          </div>
          <div class="member-name">${name}</div>
          ${position ? `<div class="member-position">${position}</div>` : ""}
          ${contact  ? `<div class="member-contact">📞 ${contact}</div>` : ""}
        </div>`;
    });

    container.innerHTML = html;

    // Stagger-animate cards in
    container.querySelectorAll('.member-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }));
    });

  } catch (err) {
    console.error("Members load error:", err);
    container.innerHTML = `<div class="alert alert-error" style="grid-column:1/-1;">⚠️ सदस्यों की जानकारी लोड नहीं हो सकी।</div>`;
  }
}
