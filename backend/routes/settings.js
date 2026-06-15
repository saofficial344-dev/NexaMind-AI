const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const settings = db.get("settings").value();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/", (req, res) => {
  try {
    const allowed = ["default_workspace_id", "default_expert_mode", "preferred_language", "default_tone", "theme"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    db.get("settings").assign(updates).write();
    const settings = db.get("settings").value();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
