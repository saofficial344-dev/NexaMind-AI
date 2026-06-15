const express = require("express");
const { randomUUID } = require("crypto");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const { workspaceId, search, tag } = req.query;
    let items = db.get("saved_responses").orderBy("created_at", "desc").value();

    if (workspaceId) items = items.filter((i) => i.workspace_id === workspaceId);
    if (tag) items = items.filter((i) => i.tags && i.tags.split(",").map((t) => t.trim()).includes(tag));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, saved_responses: items.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { title, content, workspaceId, expertMode, tags, conversationId, messageId } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: "Content is required" });
    }

    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      title: title ? String(title).trim() : content.slice(0, 60).trim() + (content.length > 60 ? "…" : ""),
      content: String(content).trim(),
      workspace_id: workspaceId || null,
      expert_mode: expertMode || "general",
      tags: tags || "",
      conversation_id: conversationId || null,
      message_id: messageId || null,
      created_at: now,
      updated_at: now,
    };

    db.get("saved_responses").push(item).write();
    res.status(201).json({ success: true, saved_response: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const item = db.get("saved_responses").find({ id: req.params.id }).value();
    if (!item) return res.status(404).json({ success: false, error: "Not found" });

    const updates = { updated_at: new Date().toISOString() };
    if (req.body.title !== undefined) updates.title = String(req.body.title).trim();
    if (req.body.content !== undefined) updates.content = String(req.body.content).trim();
    if (req.body.tags !== undefined) updates.tags = req.body.tags;

    db.get("saved_responses").find({ id: req.params.id }).assign(updates).write();
    const updated = db.get("saved_responses").find({ id: req.params.id }).value();
    res.json({ success: true, saved_response: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const item = db.get("saved_responses").find({ id: req.params.id }).value();
    if (!item) return res.status(404).json({ success: false, error: "Not found" });

    db.get("saved_responses").remove({ id: req.params.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
