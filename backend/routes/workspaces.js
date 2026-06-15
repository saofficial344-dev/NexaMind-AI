const express = require("express");
const { randomUUID } = require("crypto");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const workspaces = db.get("workspaces").sortBy("is_default").reverse().value();
    res.json({ success: true, workspaces });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const workspace = db.get("workspaces").find({ id: req.params.id }).value();
    if (!workspace) return res.status(404).json({ success: false, error: "Workspace not found" });
    res.json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, business_name, website_url, description, industry, products_services,
      target_audience, brand_tone, preferred_language, brand_colors, social_platforms,
      business_address, phone, instructions } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Workspace name is required" });
    }

    const now = new Date().toISOString();
    const workspace = {
      id: randomUUID(),
      name: String(name).trim(),
      business_name: business_name || "",
      website_url: website_url || "",
      description: description || "",
      industry: industry || "",
      products_services: products_services || "",
      target_audience: target_audience || "",
      brand_tone: brand_tone || "professional",
      preferred_language: preferred_language || "English",
      brand_colors: brand_colors || "",
      social_platforms: social_platforms || "",
      business_address: business_address || "",
      phone: phone || "",
      instructions: instructions || "",
      is_default: false,
      created_at: now,
      updated_at: now,
    };

    db.get("workspaces").push(workspace).write();
    res.status(201).json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const workspace = db.get("workspaces").find({ id: req.params.id }).value();
    if (!workspace) return res.status(404).json({ success: false, error: "Workspace not found" });

    const { name } = req.body;
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Workspace name cannot be empty" });
    }

    const allowed = ["name", "business_name", "website_url", "description", "industry",
      "products_services", "target_audience", "brand_tone", "preferred_language",
      "brand_colors", "social_platforms", "business_address", "phone", "instructions"];

    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = key === "name" ? String(req.body[key]).trim() : req.body[key];
      }
    }

    db.get("workspaces").find({ id: req.params.id }).assign(updates).write();
    const updated = db.get("workspaces").find({ id: req.params.id }).value();
    res.json({ success: true, workspace: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const workspace = db.get("workspaces").find({ id: req.params.id }).value();
    if (!workspace) return res.status(404).json({ success: false, error: "Workspace not found" });
    if (workspace.is_default) return res.status(400).json({ success: false, error: "Cannot delete the default workspace" });

    db.get("conversations")
      .filter({ workspace_id: req.params.id })
      .each((c) => { c.workspace_id = null; })
      .value();
    db.write();

    db.get("workspaces").remove({ id: req.params.id }).write();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
