const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
  process.exit(1);
}

app.use(cors({ origin: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Routes
app.use("/api/workspaces", require("./routes/workspaces"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/generate", require("./routes/generate"));
app.use("/api/saved", require("./routes/saved"));
app.use("/api/settings", require("./routes/settings"));

app.get("/", (req, res) => res.json({ status: "ok", version: "2.0.0" }));
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", model: "llama-3.3-70b-versatile", apiKey: Boolean(GROQ_API_KEY) })
);

app.use((req, res) =>
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` })
);

app.listen(PORT, () => {
  console.log(`\n✅ AI Business Assistant Backend v2.0`);
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Model: llama-3.3-70b-versatile\n`);
});
