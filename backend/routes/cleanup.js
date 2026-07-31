// ============================================
//  routes/cleanup.js
//  Deletes events from Firestore whose
//  expiryDate (or, if not set, date) has
//  already passed. Triggered daily by a
//  GitHub Actions cron job (see
//  /.github/workflows/cleanup-cron.yml at the
//  repo root) — see guide.md for setup.
// ============================================

const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebaseAdmin");
const verifyCronSecret = require("../middleware/verifyCronSecret");

router.get("/cleanup-expired-events", verifyCronSecret, async (req, res) => {
  if (!admin.apps.length) {
    return res.status(500).json({
      success: false,
      error: "Firebase Admin SDK not initialized — check FIREBASE_SERVICE_ACCOUNT.",
    });
  }

  try {
    const db = admin.firestore();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const snapshot = await db.collection("events").get();
    const batch = db.batch();
    let deletedCount = 0;
    const deletedTitles = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const raw = data.expiryDate || data.date;
      if (!raw) return;

      const eventDate = raw.toDate ? raw.toDate() : new Date(raw);
      if (isNaN(eventDate.getTime())) return;

      if (eventDate < startOfToday) {
        batch.delete(doc.ref);
        deletedCount++;
        deletedTitles.push(data.title || doc.id);
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
    }

    console.log(`🧹 Cleanup run: deleted ${deletedCount} expired event(s).`);

    res.json({
      success: true,
      deletedCount,
      deletedTitles,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
