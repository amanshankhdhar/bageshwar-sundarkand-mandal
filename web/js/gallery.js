// ============================================
//  gallery.js — Gallery Page (Upgraded v2)
// ============================================

import { db } from "./firebase-config.js";
import {
  collection, getDocs, orderBy, query, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadGallery();
  setupLightbox();
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

// Holds the currently loaded gallery images (in display order) so the
// lightbox can navigate between them with Prev/Next arrows.
let galleryItems = [];
let currentLightboxIndex = 0;

async function loadGallery() {
  const container = document.getElementById("gallery-container");
  container.innerHTML = `<div class="loading-container" style="grid-column:1/-1;"><div class="spinner"></div><p>चित्र लोड हो रहे हैं...</p></div>`;

  try {
    const q = query(collection(db, "gallery"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `<div class="alert alert-info" style="grid-column:1/-1;text-align:center;">📷 अभी कोई चित्र नहीं है। जल्द आयेंगे!</div>`;
      return;
    }

    galleryItems = [];
    let html = "";
    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const caption = item.caption || "Divine Moment";
      const imgUrl  = item.imageUrl || "";
      if (imgUrl) {
        const idx = galleryItems.length;
        galleryItems.push({ url: imgUrl, caption });
        html += `
          <div class="gallery-item" onclick="openLightbox(${idx})">
            <img src="${imgUrl}" alt="${caption}" class="gallery-item-img" loading="lazy"
                 onerror="this.parentElement.querySelector('.gallery-item-placeholder').style.display='flex';this.style.display='none'">
            <div class="gallery-item-placeholder" style="display:none;">🛕</div>
            <div class="gallery-item-caption">${caption}</div>
          </div>`;
      } else {
        html += `
          <div class="gallery-item">
            <div class="gallery-item-placeholder">🛕</div>
            <div class="gallery-item-caption">${caption}</div>
          </div>`;
      }
    });

    container.innerHTML = html;

    // Animate items in
    container.querySelectorAll('.gallery-item').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      });
    });

  } catch (error) {
    console.error("Gallery load error:", error);
    container.innerHTML = `<div class="alert alert-error" style="grid-column:1/-1;">⚠️ गैलरी लोड नहीं हो सकी। कृपया पुनः प्रयास करें।</div>`;
  }
}

function setupLightbox() {
  const overlay = document.getElementById("lightbox-overlay");
  if (!overlay) return;
  // Close only when the backdrop itself is clicked (not the image/arrows).
  overlay.addEventListener("click", e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape")     closeLightbox();
    if (e.key === "ArrowRight") navigateLightbox(1);
    if (e.key === "ArrowLeft")  navigateLightbox(-1);
  });

  // Basic swipe support for touch devices (left/right = next/prev)
  let touchStartX = 0;
  let touchStartY = 0;
  let isMultiTouchGesture = false;
  // Basic swipe support for touch devices — ignores pinch-zoom (multi-touch)
  // gestures entirely, and only triggers on a clearly horizontal drag, so
  // zooming into a photo doesn't accidentally flip to the next one.
  overlay.addEventListener("touchstart", e => {
    isMultiTouchGesture = e.touches.length > 1;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  overlay.addEventListener("touchmove", e => {
    if (e.touches.length > 1) isMultiTouchGesture = true;
  }, { passive: true });
  overlay.addEventListener("touchend", e => {
    if (isMultiTouchGesture) { isMultiTouchGesture = false; return; }
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    // Require the motion to be mostly horizontal, not a diagonal/vertical drag
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigateLightbox(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

function renderLightbox() {
  const item = galleryItems[currentLightboxIndex];
  if (!item) return;
  const img  = document.getElementById("lightbox-img");
  const cap  = document.getElementById("lightbox-caption");
  const cnt  = document.getElementById("lightbox-counter");
  img.src = item.url;
  img.alt = item.caption;
  cap.textContent = item.caption;
  if (cnt) cnt.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;

  // Hide arrows entirely if there's only one image
  const showArrows = galleryItems.length > 1;
  document.getElementById("lightbox-prev")?.classList.toggle("hidden", !showArrows);
  document.getElementById("lightbox-next")?.classList.toggle("hidden", !showArrows);
}

window.openLightbox = function(index) {
  const overlay = document.getElementById("lightbox-overlay");
  if (!overlay || !galleryItems[index]) return;
  currentLightboxIndex = index;
  renderLightbox();
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.navigateLightbox = function(direction) {
  if (galleryItems.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
  renderLightbox();
};

window.closeLightbox = function() {
  const overlay = document.getElementById("lightbox-overlay");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
};
