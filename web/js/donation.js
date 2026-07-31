// ============================================
//  donation.js
//  Public Donation Page
//  Bageshwar Bala Ji Sundarkand Mandal
// ============================================

import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc // Added updateDoc for saving Transaction ID
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global variable to store the ID of the donation currently being processed
window.currentPendingDocId = null;

// ─────────────────────────────────────────────
// On Page Load
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncement();
  loadVerifiedDonations();
  setupDonationForm();
});

// ─────────────────────────────────────────────
// Load Announcement Banner
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
  } catch (err) {
    el.textContent = "🚩 जय श्री राम! बागेश्वर बाला जी सुंदरकांड मंडल 🚩";
  }
}

// ─────────────────────────────────────────────
// Load Verified Donations & Devotee Count
// ─────────────────────────────────────────────
async function loadVerifiedDonations() {
  const listEl = document.getElementById("public-donations-list");
  
  if (!listEl) return;

  listEl.innerHTML = `
    <div style="text-align:center; padding:2rem;">
      <div class="spinner" style="margin:0 auto 1rem;"></div>
      <p style="color:#999;">Loading details...</p>
    </div>`;

  try {
    const q = query(
      collection(db, "donations"),
      where("status", "==", "verified")
    );

    const snapshot = await getDocs(q);

    let donations = [];
    snapshot.forEach((docSnap) => {
      donations.push(docSnap.data());
    });

    // Sort by date NEWEST FIRST
    donations.sort((a, b) => {
      const timeA = a.date && a.date.seconds ? a.date.seconds : 0;
      const timeB = b.date && b.date.seconds ? b.date.seconds : 0;
      return timeB - timeA;
    });

    // ---> NEW LOGIC: Count Devotees for Summary Card <---
    const totalDevotees = donations.length;
    animateCountUp("supporter-count-display", totalDevotees);
    const hindiEl = document.getElementById("supporter-hindi-display");
    if(hindiEl) hindiEl.textContent = `${totalDevotees} भक्तों का सहयोग`;

    if (donations.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:3rem; color:#999;">
          <div style="font-size:3rem; margin-bottom:1rem;">🙏</div>
          <p>No donations recorded yet. Be the first to donate!</p>
        </div>`;
      return;
    }

    // Build donation cards HTML
    let html = "";
    donations.forEach((d) => {
      const displayName = d.anonymous ? "🙏 Anonymous Devotee" : "🙏 " + d.name;
      let dateStr = "";
      if (d.date && d.date.toDate) {
        dateStr = d.date.toDate().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      }

      const modeBg = d.mode === "Online" ? "#2980b9" : "#7f8c8d";

      html += `
        <div class="card" style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:0.3rem;">
                ${displayName}
              </h4>
              <p style="font-size:0.85rem; color:#777; margin-bottom:0.3rem;">
                ${dateStr ? "📅 " + dateStr + " &nbsp;|&nbsp;" : ""}
                <span style="background:${modeBg}; color:white; padding:2px 8px; border-radius:10px; font-size:0.75rem;">
                  ${d.mode || "Offline"}
                </span>
              </p>
              ${d.note ? `<p style="font-size:0.9rem; font-style:italic; color:#888;">"${d.note}"</p>` : ""}
            </div>
            <div style="font-size:1.4rem; font-weight:900; color:var(--red-dark);">
              ₹ ${(d.amount || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>`;
    });

    listEl.innerHTML = html;

  } catch (err) {
    console.error("Donations load error:", err);
    listEl.innerHTML = `
      <div style="background:#fadbd8; border-left:4px solid #e74c3c; padding:1rem; border-radius:8px;">
        <strong>⚠️ Error loading details.</strong>
        <p style="margin-top:0.3rem; font-size:0.9rem;">Please refresh the page and try again.</p>
      </div>`;
  }
}

// Simple animation to count up the number of devotees
function animateCountUp(elementId, targetNumber) {
  const el = document.getElementById(elementId);
  if (!el || targetNumber === 0) {
    if(el) el.textContent = "0";
    return;
  }
  let current = 0;
  const increment = Math.max(1, Math.floor(targetNumber / 20));
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetNumber) {
      current = targetNumber;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 40); // speed of animation
}

// ─────────────────────────────────────────────
// Donation Form Setup
// ─────────────────────────────────────────────
function setupDonationForm() {
  const form = document.getElementById("donation-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("submit-donation-btn");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    const name = document.getElementById("donor-name").value.trim();
    const amount = parseFloat(document.getElementById("donor-amount").value);
    const note = document.getElementById("donor-note").value.trim();
    const mode = document.getElementById("donor-mode").value;
    const anonymous = document.getElementById("donor-anonymous").checked;

    if (!name || !amount || amount <= 0) {
      showMessage("Please enter valid details.", "error");
      btn.disabled = false;
      btn.textContent = "Submit Donation 🙏";
      return;
    }

    try {
      // Save basic details to Firebase first
      const docRef = await addDoc(collection(db, "donations"), {
        name,
        amount,
        note,
        mode,
        anonymous,
        status: "pending",
        transactionId: "", // Will be updated if entered in modal
        date: serverTimestamp()
      });

      form.reset();
      btn.disabled = false;
      btn.textContent = "Submit Donation 🙏";

      if (mode === "Online") {
        // Open QR Modal AND pass the new document ID
        openMyModal(amount, docRef.id);
      } else {
        showMessage("🙏 Thank you! Your donation has been recorded. It will appear after admin verification.", "success");
      }

    } catch (err) {
      console.error("Donation submit error:", err);
      showMessage("⚠️ Failed to submit donation. Please try again.", "error");
      btn.disabled = false;
      btn.textContent = "Submit Donation 🙏";
    }
  });
}

// ─────────────────────────────────────────────
// QR Modal Logic (WITH TRANSACTION ID UPDATE)
// ─────────────────────────────────────────────
window.openMyModal = function(amount, docId) {
  const modal = document.getElementById("qr-modal-container");
  const amountEl = document.getElementById("qr-amount-display");
  
  if (modal) {
    window.currentPendingDocId = docId; // Save ID globally for when user clicks 'Done'
    if (amountEl) amountEl.textContent = "₹ " + amount.toLocaleString("en-IN");
    
    // Reset transaction input
    const txInput = document.getElementById("tx-id");
    if(txInput) txInput.value = "";
    
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.closeMyModal = async function() {
  const modal = document.getElementById("qr-modal-container");
  
  // ---> NEW LOGIC: Update Transaction ID to Firebase <---
  const txInput = document.getElementById("tx-id");
  const txValue = txInput ? txInput.value.trim() : "";

  if (window.currentPendingDocId && txValue !== "") {
    try {
      const docRef = doc(db, "donations", window.currentPendingDocId);
      await updateDoc(docRef, {
        transactionId: txValue
      });
      console.log("Transaction ID Saved!");
    } catch (error) {
      console.error("Failed to save Transaction ID:", error);
    }
  }
  
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    
    // Smooth scroll back to top to see message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showMessage("🙏 धन्यवाद! आपका दान दर्ज कर लिया गया है। समिति द्वारा सत्यापित (Verify) होने के बाद यह सूची में दिखाई देगा।", "success");
  }
};

// ─────────────────────────────────────────────
// Show Inline Message
// ─────────────────────────────────────────────
function showMessage(text, type) {
  let msgEl = document.getElementById("donation-msg");
  if (!msgEl) {
    msgEl = document.createElement("div");
    msgEl.id = "donation-msg";
    const form = document.getElementById("donation-form");
    if (form) form.insertAdjacentElement("beforebegin", msgEl);
  }

  msgEl.style.cssText = `
    padding: 1rem 1.2rem; border-radius: 8px; margin: 1rem 0; font-weight: 600; text-align: center;
    border-left: 4px solid ${type === "error" ? "#e74c3c" : "#27ae60"};
    background: ${type === "error" ? "#fadbd8" : "#d5f5e3"};
    color: ${type === "error" ? "#922b21" : "#1e8449"};
  `;
  msgEl.textContent = text;

  setTimeout(() => {
    if (msgEl) { msgEl.textContent = ""; msgEl.style.display = "none"; }
  }, 8000);
}
