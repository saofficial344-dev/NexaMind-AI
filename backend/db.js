const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, "db.json"));
const db = low(adapter);

const now = new Date().toISOString();
const defaultWsId = randomUUID();

db.defaults({
  workspaces: [
    {
      id: defaultWsId,
      name: "Personal",
      business_name: "",
      website_url: "",
      description: "",
      industry: "",
      products_services: "",
      target_audience: "",
      brand_tone: "professional",
      preferred_language: "English",
      brand_colors: "",
      social_platforms: "",
      business_address: "",
      phone: "",
      instructions: "",
      is_default: true,
      created_at: now,
      updated_at: now,
    },
  ],
  conversations: [],
  messages: [],
  saved_responses: [],
  settings: {
    default_workspace_id: null,
    default_expert_mode: "general",
    preferred_language: "English",
    default_tone: "professional",
    theme: "light",
  },
}).write();

module.exports = db;
