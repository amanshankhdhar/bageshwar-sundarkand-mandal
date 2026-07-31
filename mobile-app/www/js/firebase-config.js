// ============================================
//  firebase-config.js
//  Bageshwar Bala Ji Sundarkand Mandal
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ─────────────────────────────────────────────
// YOUR FIREBASE CONFIG
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCEkcXfisIO7a_b0OHre8iFA7sEQMU0Q-A",
  authDomain: "bageshwar-mandal.firebaseapp.com",
  projectId: "bageshwar-mandal",
  storageBucket: "bageshwar-mandal.firebasestorage.app",
  messagingSenderId: "257893299378",
  appId: "1:257893299378:web:3eaba9d84f9b6a8c78c5ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export only db and auth — NO storage needed anymore!
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─────────────────────────────────────────────
// ADMIN EMAIL — must match Firebase Auth user
// ─────────────────────────────────────────────
export const ADMIN_EMAIL = "chhwjalcm@gmail.com";

// ─────────────────────────────────────────────
// CLOUDINARY CONFIG — for image uploads
// Replace YOUR_CLOUD_NAME with your Cloudinary cloud name
// ─────────────────────────────────────────────
export const CLOUDINARY_CLOUD_NAME = "dxeyhj6cr";
export const CLOUDINARY_UPLOAD_PRESET = "mandal_uploads";
