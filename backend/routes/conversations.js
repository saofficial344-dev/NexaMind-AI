const express = require("express");
const { randomUUID } = require("crypto");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const { workspaceId, search } = req.query;
    let convs = db.get("conversations").orderBy("updated_at", "desc").value();

    if (workspaceId) convs = convs.filter((c) => c.workspace_id === workspaceId);
    if (search) {
      const q = search.toLowerCase();
      convs = convs.filter((c) => c.title.toLowerCase().includes(q));
    }

    res.json({ success: true, conversations: convs.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { workspaceId, expertMode, title } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const now = new Date().toISOString();
    const conversation = {
      id: randomUUID(),
      workspace_id: workspaceId || null,
      expert_mode: expertMode || "general",
      title: String(title).trim().slice(0, 80),
      last_message: "",
      created_at: now,
      updated_at: now,
    };

    db.get("conversations").push(conversation).write();
    res.status(201).json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const conv = db.get("conversations").find({ id: req.params.id }).value();
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });

    const updates = { updated_at: new Date().toISOString() };
    if (req.body.title !== undefined) updates.title = String(req.body.title).trim().slice(0, 80);
    if (req.body.last_message !== undefined) updates.last_message = req.body.last_message;
    if (req.body.expert_mode !== undefined) updates.expert_mode = req.body.expert_mode;

    db.get("conversations").find({ id: req.params.id }).assign(updates).write();
    const updated = db.get("conversations").find({ id: req.params.id }).value();
    res.json({ success: true, conversation: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const conv = db.get("conversations").find({ id: req.params.id }).value();
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });

    db.get("messages").remove({ conversation_id: req.params.id }).write();
    db.get("conversations").remove({ id: req.params.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id/messages", (req, res) => {
  try {
    const conv = db.get("conversations").find({ id: req.params.id }).value();
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });

    const messages = db
      .get("messages")
      .filter({ conversation_id: req.params.id })
      .orderBy("created_at", "asc")
      .value();

    res.json({ success: true, messages, conversation: conv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
