// ============================================
//  server.js
//  Bageshwar Bala Ji Sundarkand Mandal — Backend
//  v0.1.0 — intentionally minimal.
//
//  WHY A BACKEND AT ALL?
//  The website and admin app talk to Firestore
//  directly (fast, serverless, free) for normal
//  CRUD — exactly like the current admin.js does.
//  This backend exists only for the things
//  Firestore alone can't do on its own:
//    • scheduled cleanup of expired events
//    • a foundation for future features that
//      genuinely need a server (blog RSS/sitemap
//      generation, aggregated stats, richer
//      donation workflows, etc.)
//  Kept deliberately small — grows with real need.
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { initFirebaseAdmin } = require("./config/firebaseAdmin");
const cleanupRouter = require("./routes/cleanup");

const app = express();
app.use(cors());
app.use(express.json());

initFirebaseAdmin();

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Bageshwar Bala Ji Sundarkand Mandal — Backend API",
    version: "0.1.0",
  });
});

// Used both as a manual health check and as the target for the
// GitHub Actions keep-warm ping if you choose to add one later.
app.get("/health", (req, res) => res.status(200).send("OK"));

app.use("/api", cleanupRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚩 Mandal backend running on port ${PORT}`);
});
