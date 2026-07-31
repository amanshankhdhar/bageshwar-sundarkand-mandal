// ============================================
//  carousel.js — Auto-Scrolling Image Carousel
//  Fetches images from Firestore (Cloudinary URLs)
//  Pure Vanilla JS — No external libraries
// ============================================

import { db } from "./firebase-config.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const track       = document.getElementById("carousel-track");
const wrapper     = document.getElementById("carousel-wrapper");

let animationId   = null;
let isPaused      = false;
let scrollPos     = 0;
let totalWidth    = 0;
const SPEED       = 0.6; // px per frame — smooth & gentle

// ── INIT ──────────────────────────────────────
async function initCarousel() {
  if (!track || !wrapper) return;

  try {
    const q = query(collection(db, "gallery"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      track.innerHTML = `<div class="carousel-empty">📷 गैलरी में अभी कोई चित्र नहीं है। जल्द ही आयेंगे! 🙏</div>`;
      return;
    }

    // Build image items
    const items = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.imageUrl) items.push({ url: data.imageUrl, caption: data.caption || "दिव्य क्षण" });
    });

    if (items.length === 0) {
      track.innerHTML = `<div class="carousel-empty">📷 चित्र लोड नहीं हो सके।</div>`;
      return;
    }

    // Build HTML — original set + clone for seamless looping
    const buildItems = (list) =>
      list.map(item => `
        <div class="carousel-item" onclick="openCarouselLightbox('${item.url.replace(/'/g, "\\'")}','${item.caption.replace(/'/g, "\\'")}')" title="${item.caption}">
          <img
            src="${item.url}"
            alt="${item.caption}"
            loading="lazy"
            onerror="this.parentElement.style.display='none'"
          />
          <div class="carousel-item-caption">${item.caption}</div>
        </div>`
      ).join("");

    // Original + clone (seamless infinite loop)
    track.innerHTML = buildItems(items) + buildItems(items);

    // Wait for layout
    requestAnimationFrame(() => {
      // totalWidth = width of one set (half the cloned track)
      totalWidth = track.scrollWidth / 2;
      startCarousel();
    });

  } catch (err) {
    console.error("Carousel load error:", err);
    track.innerHTML = `<div class="carousel-empty">⚠️ चित्र लोड करने में समस्या हुई।</div>`;
  }
}

// ── ANIMATION LOOP ────────────────────────────
function startCarousel() {
  if (totalWidth === 0) return;

  function step() {
    if (!isPaused) {
      scrollPos += SPEED;
      // Reset seamlessly when first clone set is done
      if (scrollPos >= totalWidth) {
        scrollPos -= totalWidth;
      }
      track.style.transform = `translateX(-${scrollPos}px)`;
    }
    animationId = requestAnimationFrame(step);
  }
  animationId = requestAnimationFrame(step);
}

// ── PAUSE ON HOVER ────────────────────────────
if (wrapper) {
  wrapper.addEventListener("mouseenter",  () => { isPaused = true; });
  wrapper.addEventListener("mouseleave",  () => { isPaused = false; });
  // Touch support — pause on touch start, resume on touch end
  wrapper.addEventListener("touchstart",  () => { isPaused = true; },  { passive: true });
  wrapper.addEventListener("touchend",    () => { setTimeout(() => { isPaused = false; }, 1200); }, { passive: true });
}

// ── LIGHTBOX for carousel ─────────────────────
window.openCarouselLightbox = function(url, caption) {
  const overlay = document.getElementById("lightbox-overlay");
  const img     = document.getElementById("lightbox-img");
  const cap     = document.getElementById("lightbox-caption");
  if (!overlay) return;
  img.src        = url;
  img.alt        = caption;
  cap.textContent = caption;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

// ── VISIBILITY API — pause when tab hidden ────
document.addEventListener("visibilitychange", () => {
  isPaused = document.hidden;
});

// ── START ─────────────────────────────────────
initCarousel();
