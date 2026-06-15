import { useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../utils/api";

const MODES = ["general", "seo", "social", "ads", "blog", "product", "email", "coding", "business"];
const TONES = ["professional", "friendly", "formal", "casual", "persuasive"];
const LANGUAGES = ["English", "Arabic", "Urdu", "French", "Spanish", "Hindi", "Turkish", "German"];

export default function Settings() {
  const { settings, updateSettings, workspaces, setCurrentView, openConfirm, conversations } = useApp();
  const [form, setForm] = useState({
    default_expert_mode: settings.default_expert_mode || "general",
    preferred_language: settings.preferred_language || "English",
    default_tone: settings.default_tone || "professional",
    default_workspace_id: settings.default_workspace_id || "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = () => {
    openConfirm(
      `Delete all ${conversations.length} conversation(s)? This cannot be undone.`,
      async () => {
        try {
          for (const c of conversations) {
            await api.deleteConversation(c.id);
          }
          window.location.reload();
        } catch (e) { console.error(e); }
      }
    );
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2 className="panel-title">Settings</h2>
        <p className="panel-subtitle">Configure your AI assistant preferences</p>
      </div>

      <div className="settings-body">
        <section className="settings-section">
          <h3 className="settings-section-title">AI Defaults</h3>
          <div className="settings-fields">
            <div className="settings-field">
              <label className="form-label">Default Expert Mode</label>
              <select className="form-select" value={form.default_expert_mode} onChange={(e) => set("default_expert_mode", e.target.value)}>
                {MODES.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
            <div className="settings-field">
              <label className="form-label">Default Tone</label>
              <select className="form-select" value={form.default_tone} onChange={(e) => set("default_tone", e.target.value)}>
                {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="settings-field">
              <label className="form-label">Preferred Language</label>
              <select className="form-select" value={form.preferred_language} onChange={(e) => set("preferred_language", e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="settings-field">
              <label className="form-label">Default Workspace</label>
              <select className="form-select" value={form.default_workspace_id} onChange={(e) => set("default_workspace_id", e.target.value)}>
                <option value="">Auto (first available)</option>
                {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}{w.business_name ? ` — ${w.business_name}` : ""}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">Data & History</h3>
          <div className="settings-fields">
            <div className="settings-info-row">
              <div>
                <p className="settings-info-label">Conversations</p>
                <p className="settings-info-value">{conversations.length} total</p>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={handleClearHistory} disabled={conversations.length === 0}>
                Clear All History
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">About</h3>
          <div className="settings-info-grid">
            <div className="settings-info-item"><span>AI Model</span><span>Llama 3.3 70B (Groq)</span></div>
            <div className="settings-info-item"><span>Version</span><span>2.0.0</span></div>
            <div className="settings-info-item"><span>Storage</span><span>Local JSON database</span></div>
          </div>
        </section>

        <div className="settings-actions">
          <button className="btn btn--ghost" onClick={() => setCurrentView("chat")}>← Back to Chat</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
