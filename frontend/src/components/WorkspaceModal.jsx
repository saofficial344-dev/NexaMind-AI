import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const TONES = ["professional", "friendly", "formal", "casual", "creative", "authoritative"];
const LANGUAGES = ["English", "Arabic", "Urdu", "French", "Spanish", "Hindi", "Turkish", "German"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "YouTube", "Twitter/X", "WhatsApp"];

export default function WorkspaceModal() {
  const { workspaceModal, setWorkspaceModal, createWorkspace, updateWorkspace, openConfirm, deleteWorkspace } = useApp();
  const { mode, workspace } = workspaceModal;

  const [form, setForm] = useState({
    name: "", business_name: "", website_url: "", description: "",
    industry: "", products_services: "", target_audience: "", brand_tone: "professional",
    preferred_language: "English", brand_colors: "", social_platforms: "",
    business_address: "", phone: "", instructions: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (mode === "edit" && workspace) {
      setForm({
        name: workspace.name || "",
        business_name: workspace.business_name || "",
        website_url: workspace.website_url || "",
        description: workspace.description || "",
        industry: workspace.industry || "",
        products_services: workspace.products_services || "",
        target_audience: workspace.target_audience || "",
        brand_tone: workspace.brand_tone || "professional",
        preferred_language: workspace.preferred_language || "English",
        brand_colors: workspace.brand_colors || "",
        social_platforms: workspace.social_platforms || "",
        business_address: workspace.business_address || "",
        phone: workspace.phone || "",
        instructions: workspace.instructions || "",
      });
    }
  }, [mode, workspace]);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Workspace name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (mode === "edit" && workspace) {
        await updateWorkspace(workspace.id, form);
      } else {
        await createWorkspace(form);
      }
      setWorkspaceModal({ open: false, mode: "create", workspace: null });
    } catch (err) {
      setErrors({ name: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    openConfirm(
      `Permanently delete workspace "${workspace?.name}"? All associated data will remain but the workspace will be removed.`,
      async () => {
        await deleteWorkspace(workspace.id);
        setWorkspaceModal({ open: false, mode: "create", workspace: null });
      }
    );
  };

  const close = () => setWorkspaceModal({ open: false, mode: "create", workspace: null });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal modal--workspace">
        <div className="modal-header">
          <h2 className="modal-title">{mode === "edit" ? "Edit Workspace" : "New Workspace"}</h2>
          <button className="modal-close" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="ws-modal-tabs">
          {[["basic", "Basic Info"], ["brand", "Brand"], ["contact", "Contact"], ["instructions", "Instructions"]].map(([id, label]) => (
            <button key={id} className={`ws-modal-tab${activeTab === id ? " ws-modal-tab--active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === "basic" && (
            <div className="form-grid">
              <div className="form-field form-field--full">
                <label className="form-label">Workspace Name <span className="req">*</span></label>
                <input className={`form-input${errors.name ? " field-error" : ""}`} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Warsi Computers" />
                {errors.name && <span className="field-error-msg">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Business Name</label>
                <input className="form-input" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="Official business name" />
              </div>
              <div className="form-field">
                <label className="form-label">Website URL</label>
                <input className="form-input" value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="form-field form-field--full">
                <label className="form-label">Business Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this business do?" rows={3} />
              </div>
              <div className="form-field">
                <label className="form-label">Industry</label>
                <input className="form-input" value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. E-commerce, Education, IT" />
              </div>
              <div className="form-field">
                <label className="form-label">Target Audience</label>
                <input className="form-input" value={form.target_audience} onChange={(e) => set("target_audience", e.target.value)} placeholder="Who are your customers?" />
              </div>
              <div className="form-field form-field--full">
                <label className="form-label">Products / Services</label>
                <textarea className="form-textarea" value={form.products_services} onChange={(e) => set("products_services", e.target.value)} placeholder="List your main products or services" rows={2} />
              </div>
            </div>
          )}

          {activeTab === "brand" && (
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Brand Tone</label>
                <select className="form-select" value={form.brand_tone} onChange={(e) => set("brand_tone", e.target.value)}>
                  {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Preferred Language</label>
                <select className="form-select" value={form.preferred_language} onChange={(e) => set("preferred_language", e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Brand Colors</label>
                <input className="form-input" value={form.brand_colors} onChange={(e) => set("brand_colors", e.target.value)} placeholder="e.g. Blue #1E90FF, White" />
              </div>
              <div className="form-field">
                <label className="form-label">Social Platforms</label>
                <div className="platform-checkboxes">
                  {PLATFORMS.map((p) => (
                    <label key={p} className="platform-check">
                      <input
                        type="checkbox"
                        checked={form.social_platforms.includes(p)}
                        onChange={(e) => {
                          const current = form.social_platforms ? form.social_platforms.split(", ").filter(Boolean) : [];
                          if (e.target.checked) set("social_platforms", [...current, p].join(", "));
                          else set("social_platforms", current.filter((c) => c !== p).join(", "));
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Phone / WhatsApp</label>
                <input className="form-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+92 300 1234567" />
              </div>
              <div className="form-field form-field--full">
                <label className="form-label">Business Address</label>
                <textarea className="form-textarea" value={form.business_address} onChange={(e) => set("business_address", e.target.value)} placeholder="Full business address" rows={2} />
              </div>
            </div>
          )}

          {activeTab === "instructions" && (
            <div className="form-grid">
              <div className="form-field form-field--full">
                <label className="form-label">Important Instructions for AI</label>
                <textarea className="form-textarea" value={form.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder={`Special instructions the AI should always follow for this workspace.\n\nExamples:\n- Always mention our 3-year warranty\n- Never compare prices with competitors\n- Always write in Roman Urdu for WhatsApp captions`} rows={8} />
                <p className="form-hint">These instructions will be included in every AI request for this workspace.</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {mode === "edit" && workspace && !workspace.is_default && (
            <button className="btn btn--danger" onClick={handleDelete}>Delete</button>
          )}
          <div className="modal-footer-right">
            <button className="btn btn--ghost" onClick={close}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Workspace"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
