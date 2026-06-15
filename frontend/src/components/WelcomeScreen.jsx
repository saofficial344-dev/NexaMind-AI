import { useApp } from "../context/AppContext";

const SUGGESTIONS = [
  { label: "Write a product description", prompt: "Write a compelling product description for my main product.", type: "description", tone: "persuasive" },
  { label: "Create a social media post", prompt: "Create an engaging Instagram post for my business.", type: "custom", tone: "friendly" },
  { label: "Draft a follow-up email", prompt: "Write a professional follow-up email to a client who hasn't responded.", type: "email", tone: "professional" },
  { label: "Generate SEO content", prompt: "Create SEO-optimized content for my homepage.", type: "custom", tone: "professional" },
];

const MODE_LABELS = {
  general: "General Assistant", seo: "SEO Expert", social: "Social Media Manager",
  ads: "Meta Ads Expert", blog: "Blog Writer", product: "Product Description Writer",
  email: "Email Writer", coding: "Coding Assistant", business: "Business Consultant",
};

const MODE_ICONS = {
  general: "✦", seo: "🔍", social: "📱", ads: "📣", blog: "✍️",
  product: "🛍️", email: "📧", coding: "💻", business: "💼",
};

export default function WelcomeScreen() {
  const { activeWorkspace, expertMode, sendMessage, setWorkspaceModal } = useApp();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">
          <span style={{ fontSize: 28 }}>{MODE_ICONS[expertMode] || "✦"}</span>
        </div>

        <h1 className="welcome-title">
          {activeWorkspace?.business_name || activeWorkspace?.name
            ? `${MODE_LABELS[expertMode]} for ${activeWorkspace.business_name || activeWorkspace.name}`
            : "How can I help you today?"}
        </h1>

        {activeWorkspace ? (
          <p className="welcome-subtitle">
            Active workspace: <strong>{activeWorkspace.name}</strong>
            {activeWorkspace.industry ? ` · ${activeWorkspace.industry}` : ""}
          </p>
        ) : (
          <p className="welcome-subtitle">
            <button className="welcome-link" onClick={() => setWorkspaceModal({ open: true, mode: "create", workspace: null })}>
              + Create a workspace
            </button>{" "}to give the AI context about your business.
          </p>
        )}

        <div className="prompt-cards">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="prompt-card" onClick={() => sendMessage(s.prompt, s.type, s.tone)}>
              <span className="prompt-card-label">{s.label}</span>
              <span className="prompt-card-text">{s.prompt}</span>
            </button>
          ))}
        </div>

        {activeWorkspace?.description && (
          <div className="welcome-context-badge">
            <span>AI knows about your business</span>
          </div>
        )}
      </div>
    </div>
  );
}
