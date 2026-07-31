// ============================================
//  middleware/verifyCronSecret.js
//  Protects endpoints that should only be
//  triggered by our own scheduled GitHub Action
//  (or manually by an admin), not the public.
// ============================================

module.exports = function verifyCronSecret(req, res, next) {
  const provided = req.headers["x-cron-secret"];
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return res.status(500).json({
      success: false,
      error: "Server misconfigured: CRON_SECRET is not set.",
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }

  next();
};
