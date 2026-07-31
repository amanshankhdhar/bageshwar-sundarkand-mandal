// ============================================
//  config/firebaseAdmin.js
//  Initializes the Firebase Admin SDK using a
//  service account provided via an environment
//  variable (never committed to git).
// ============================================

const admin = require("firebase-admin");

function initFirebaseAdmin() {
  // Already initialized (e.g. hot reload) — reuse the existing app.
  if (admin.apps.length) return admin.app();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    console.warn(
      "⚠️  FIREBASE_SERVICE_ACCOUNT env var is not set. " +
      "Firestore-backed routes (e.g. /api/cleanup-expired-events) will fail " +
      "until it is configured. See backend/.env.example."
    );
    return null;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    console.error(
      "❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the full " +
      "service-account JSON file contents as a single line."
    );
    throw err;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK initialized.");
  return admin.app();
}

module.exports = { initFirebaseAdmin, admin };
