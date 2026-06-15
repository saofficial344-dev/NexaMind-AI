const express = require("express");
const { randomUUID } = require("crypto");
const router = express.Router();
const Groq = require("groq-sdk");
const db = require("../db");
const { buildSystemPrompt, buildMessages, buildTransformPrompt } = require("../lib/promptBuilder");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// POST /api/generate — main chat generation
router.post("/", async (req, res) => {
  try {
    const {
      conversationId,
      workspaceId,
      expertMode = "general",
      prompt,
      type = "custom",
      tone = "professional",
    } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const userPrompt = String(prompt).trim();

    // Load workspace context
    const workspace = workspaceId
      ? db.get("workspaces").find({ id: workspaceId }).value()
      : null;

    // Build system prompt
    const systemPrompt = buildSystemPrompt(expertMode, workspace);

    // Load conversation history
    let history = [];
    if (conversationId) {
      history = db
        .get("messages")
        .filter({ conversation_id: conversationId })
        .orderBy("created_at", "asc")
        .value();
    }

    // Build messages array
    const messages = buildMessages(history, userPrompt, tone);

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ success: false, error: "AI returned an empty response." });
    }

    const now = new Date().toISOString();

    // Save messages to DB if conversation exists
    let userMessageId = randomUUID();
    let aiMessageId = randomUUID();

    if (conversationId) {
      const conv = db.get("conversations").find({ id: conversationId }).value();
      if (conv) {
        db.get("messages")
          .push({ id: userMessageId, conversation_id: conversationId, role: "user", content: userPrompt, created_at: now })
          .write();
        db.get("messages")
          .push({ id: aiMessageId, conversation_id: conversationId, role: "assistant", content: reply, created_at: new Date(Date.now() + 1).toISOString() })
          .write();

        db.get("conversations")
          .find({ id: conversationId })
          .assign({ last_message: reply.slice(0, 120), updated_at: now })
          .write();
      }
    }

    res.json({
      success: true,
      reply,
      userMessageId,
      aiMessageId,
      conversationId: conversationId || null,
      stopReason: completion.choices[0]?.finish_reason || "stop",
    });
  } catch (err) {
    console.error("[generate]", err.message);
    let status = err.status || 500;
    let message = err.message || "Failed to generate content.";
    if (status === 401) message = "Groq API key is invalid.";
    if (status === 429) message = "Groq rate limit reached. Please wait and try again.";
    res.status(status >= 400 && status < 600 ? status : 500).json({ success: false, error: message });
  }
});

// POST /api/generate/transform — one-click transformations
router.post("/transform", async (req, res) => {
  try {
    const {
      content,
      action,
      conversationId,
      workspaceId,
      expertMode = "general",
      language,
      tone,
    } = req.body;

    if (!content || !action) {
      return res.status(400).json({ success: false, error: "Content and action are required" });
    }

    const workspace = workspaceId
      ? db.get("workspaces").find({ id: workspaceId }).value()
      : null;

    const systemPrompt = buildSystemPrompt(expertMode, workspace);
    const userPrompt = buildTransformPrompt(action, content, { language, tone });

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result) {
      return res.status(502).json({ success: false, error: "AI returned empty response." });
    }

    // Save as new message in conversation if provided
    let aiMessageId = randomUUID();
    if (conversationId) {
      const conv = db.get("conversations").find({ id: conversationId }).value();
      if (conv) {
        const now = new Date().toISOString();
        db.get("messages")
          .push({ id: aiMessageId, conversation_id: conversationId, role: "assistant", content: result, created_at: now })
          .write();
        db.get("conversations").find({ id: conversationId }).assign({ last_message: result.slice(0, 120), updated_at: now }).write();
      }
    }

    res.json({ success: true, result, aiMessageId });
  } catch (err) {
    console.error("[transform]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
