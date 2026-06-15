import { useState } from "react";
import { useApp } from "../context/AppContext";

const FIELDS_BY_MODE = {
  social: [
    { id: "platform", label: "Platform", type: "select", options: ["Instagram", "Facebook", "TikTok", "LinkedIn", "Twitter/X", "YouTube"], required: true },
    { id: "contentType", label: "Content Type", type: "select", options: ["Post", "Reel Script", "Story", "Caption", "Thread"], required: true },
    { id: "topic", label: "Topic / Subject", type: "text", placeholder: "What is this content about?", required: true },
    { id: "product", label: "Product or Service", type: "text", placeholder: "What are you promoting?" },
    { id: "audience", label: "Target Audience", type: "text", placeholder: "Who is this for?" },
    { id: "offer", label: "Offer or Hook", type: "text", placeholder: "Special offer, discount, or angle" },
    { id: "cta", label: "Call to Action", type: "text", placeholder: "What should readers do?" },
    { id: "length", label: "Length", type: "select", options: ["Short (under 100 words)", "Medium (100-250 words)", "Long (250+ words)"] },
  ],
  seo: [
    { id: "pageType", label: "Page Type", type: "select", options: ["Blog Post", "Landing Page", "Product Page", "Category Page", "About Page", "Service Page"], required: true },
    { id: "keyword", label: "Primary Keyword", type: "text", placeholder: "Main keyword to rank for", required: true },
    { id: "secondaryKeywords", label: "Secondary Keywords", type: "text", placeholder: "Comma-separated" },
    { id: "searchIntent", label: "Search Intent", type: "select", options: ["Informational", "Commercial", "Transactional", "Navigational"] },
    { id: "targetCountry", label: "Target Country", type: "text", placeholder: "e.g. Pakistan, UAE, UK" },
    { id: "wordCount", label: "Desired Word Count", type: "select", options: ["500-800 words", "800-1200 words", "1200-2000 words", "2000+ words"] },
    { id: "competitors", label: "Competitor URLs", type: "text", placeholder: "Optional — for analysis" },
  ],
  ads: [
    { id: "product", label: "Product / Service", type: "text", placeholder: "What are you advertising?", required: true },
    { id: "audience", label: "Target Audience", type: "text", placeholder: "Demographics, interests", required: true },
    { id: "goal", label: "Campaign Goal", type: "select", options: ["Awareness", "Leads", "Sales", "App Installs", "Traffic"], required: true },
    { id: "offer", label: "Offer / USP", type: "text", placeholder: "Discount, free trial, unique benefit" },
    { id: "budget", label: "Budget Range", type: "text", placeholder: "Optional — e.g. $500/day" },
    { id: "cta", label: "Desired CTA", type: "select", options: ["Shop Now", "Learn More", "Sign Up", "Get Quote", "Download", "Contact Us"] },
  ],
  product: [
    { id: "productName", label: "Product Name", type: "text", placeholder: "Full product name", required: true },
    { id: "brand", label: "Brand", type: "text", placeholder: "Brand name" },
    { id: "specs", label: "Key Specifications", type: "textarea", placeholder: "Dimensions, materials, features…" },
    { id: "price", label: "Price", type: "text", placeholder: "e.g. Rs 2,999" },
    { id: "buyer", label: "Target Buyer", type: "text", placeholder: "Who buys this?" },
    { id: "marketplace", label: "Marketplace / Platform", type: "select", options: ["Website", "Daraz", "Amazon", "Shopify", "WooCommerce", "Other"] },
    { id: "usp", label: "Unique Selling Point", type: "text", placeholder: "What makes it special?" },
  ],
  email: [
    { id: "emailType", label: "Email Type", type: "select", options: ["Business / Professional", "Marketing / Promotional", "Follow-up", "Cold Outreach", "Newsletter", "Complaint Response"], required: true },
    { id: "subject", label: "Email Subject / Goal", type: "text", placeholder: "What is this email about?", required: true },
    { id: "recipient", label: "Recipient", type: "text", placeholder: "Who is receiving this?" },
    { id: "context", label: "Background / Context", type: "textarea", placeholder: "Any relevant details…" },
    { id: "cta", label: "Desired Action", type: "text", placeholder: "What should the reader do?" },
  ],
  blog: [
    { id: "topic", label: "Blog Topic", type: "text", placeholder: "What is the blog about?", required: true },
    { id: "keyword", label: "Target Keyword", type: "text", placeholder: "Main SEO keyword" },
    { id: "audience", label: "Target Audience", type: "text", placeholder: "Who is reading this?" },
    { id: "angle", label: "Content Angle", type: "text", placeholder: "e.g. beginner guide, case study, opinion" },
    { id: "wordCount", label: "Word Count", type: "select", options: ["600-900", "900-1500", "1500-2500", "2500+"] },
    { id: "cta", label: "Call to Action", type: "text", placeholder: "What should readers do after?" },
  ],
};

const DEFAULT_FIELDS = [
  { id: "task", label: "Task / Request", type: "textarea", placeholder: "What do you want the AI to help with?", required: true },
  { id: "context", label: "Context", type: "textarea", placeholder: "Any background information?" },
  { id: "output", label: "Desired Output", type: "text", placeholder: "What format should the output be?" },
];

function buildPrompt(mode, fields, values) {
  if (!fields) return values.task || "";

  const parts = [];

  if (mode === "social") {
    parts.push(`Create a ${values.contentType || "post"} for ${values.platform || "social media"}`);
    if (values.topic) parts.push(`about: ${values.topic}`);
    if (values.product) parts.push(`Promoting: ${values.product}`);
    if (values.audience) parts.push(`Target audience: ${values.audience}`);
    if (values.offer) parts.push(`Offer/Hook: ${values.offer}`);
    if (values.cta) parts.push(`CTA: ${values.cta}`);
    if (values.length) parts.push(`Length: ${values.length}`);
  } else if (mode === "seo") {
    parts.push(`Create ${values.pageType || "SEO content"}`);
    if (values.keyword) parts.push(`Primary keyword: "${values.keyword}"`);
    if (values.secondaryKeywords) parts.push(`Secondary keywords: ${values.secondaryKeywords}`);
    if (values.searchIntent) parts.push(`Search intent: ${values.searchIntent}`);
    if (values.targetCountry) parts.push(`Target country: ${values.targetCountry}`);
    if (values.wordCount) parts.push(`Word count: ${values.wordCount}`);
    if (values.competitors) parts.push(`Competitor reference: ${values.competitors}`);
  } else if (mode === "ads") {
    parts.push(`Create Meta ad copy for: ${values.product || "my product"}`);
    if (values.audience) parts.push(`Target audience: ${values.audience}`);
    if (values.goal) parts.push(`Campaign goal: ${values.goal}`);
    if (values.offer) parts.push(`Offer/USP: ${values.offer}`);
    if (values.budget) parts.push(`Budget: ${values.budget}`);
    if (values.cta) parts.push(`CTA button: ${values.cta}`);
  } else if (mode === "product") {
    parts.push(`Write a product description for: ${values.productName || "my product"}`);
    if (values.brand) parts.push(`Brand: ${values.brand}`);
    if (values.specs) parts.push(`Specifications: ${values.specs}`);
    if (values.price) parts.push(`Price: ${values.price}`);
    if (values.buyer) parts.push(`Target buyer: ${values.buyer}`);
    if (values.marketplace) parts.push(`Platform: ${values.marketplace}`);
    if (values.usp) parts.push(`USP: ${values.usp}`);
  } else if (mode === "email") {
    parts.push(`Write a ${values.emailType || "professional"} email`);
    if (values.subject) parts.push(`Subject/Goal: ${values.subject}`);
    if (values.recipient) parts.push(`Recipient: ${values.recipient}`);
    if (values.context) parts.push(`Context: ${values.context}`);
    if (values.cta) parts.push(`Desired action: ${values.cta}`);
  } else if (mode === "blog") {
    parts.push(`Write a blog post about: ${values.topic || "the given topic"}`);
    if (values.keyword) parts.push(`Target keyword: "${values.keyword}"`);
    if (values.audience) parts.push(`Audience: ${values.audience}`);
    if (values.angle) parts.push(`Angle: ${values.angle}`);
    if (values.wordCount) parts.push(`Approximate word count: ${values.wordCount}`);
    if (values.cta) parts.push(`CTA: ${values.cta}`);
  } else {
    if (values.task) parts.push(values.task);
    if (values.context) parts.push(`Context: ${values.context}`);
    if (values.output) parts.push(`Output format: ${values.output}`);
  }

  return parts.join("\n");
}

export default function PromptBuilder({ onSend, onClose }) {
  const { expertMode } = useApp();
  const fields = FIELDS_BY_MODE[expertMode] || DEFAULT_FIELDS;
  const [values, setValues] = useState({});
  const [preview, setPreview] = useState("");
  const [step, setStep] = useState("form"); // 'form' | 'preview'
  const [errors, setErrors] = useState({});

  const set = (id, val) => setValues((prev) => ({ ...prev, [id]: val }));

  const validate = () => {
    const errs = {};
    for (const f of fields) {
      if (f.required && !values[f.id]?.trim()) errs[f.id] = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBuild = () => {
    if (!validate()) return;
    const prompt = buildPrompt(expertMode, fields, values);
    setPreview(prompt);
    setStep("preview");
  };

  const handleSend = () => {
    onSend(preview, "custom", "professional");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--builder">
        <div className="modal-header">
          <h2 className="modal-title">✦ Smart Prompt Builder</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === "form" ? (
          <>
            <div className="modal-body">
              <p className="builder-subtitle">Fill in the details and I'll build a high-quality prompt for you.</p>
              <div className="builder-fields">
                {fields.map((f) => (
                  <div key={f.id} className="builder-field">
                    <label className="builder-label">{f.label}{f.required && <span className="req">*</span>}</label>
                    {f.type === "select" ? (
                      <select className={`builder-select${errors[f.id] ? " field-error" : ""}`} value={values[f.id] || ""} onChange={(e) => set(f.id, e.target.value)}>
                        <option value="">Select…</option>
                        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea className={`builder-textarea${errors[f.id] ? " field-error" : ""}`} placeholder={f.placeholder} value={values[f.id] || ""} onChange={(e) => set(f.id, e.target.value)} rows={3} />
                    ) : (
                      <input className={`builder-input${errors[f.id] ? " field-error" : ""}`} type="text" placeholder={f.placeholder} value={values[f.id] || ""} onChange={(e) => set(f.id, e.target.value)} />
                    )}
                    {errors[f.id] && <span className="field-error-msg">{errors[f.id]}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={handleBuild}>Build Prompt →</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              <p className="builder-subtitle">Review and edit your prompt before sending.</p>
              <textarea
                className="builder-preview-area"
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                rows={10}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setStep("form")}>← Edit</button>
              <button className="btn btn--primary" onClick={handleSend}>Send to AI →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
