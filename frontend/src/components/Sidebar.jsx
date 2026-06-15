import { useState } from "react";
import { useApp } from "../context/AppContext";

const EXPERT_MODES = [
  { id: "general", name: "General Assistant", icon: "✦" },
  { id: "seo", name: "SEO Expert", icon: "🔍" },
  { id: "social", name: "Social Media", icon: "📱" },
  { id: "ads", name: "Meta Ads", icon: "📣" },
  { id: "blog", name: "Blog Writer", icon: "✍️" },
  { id: "product", name: "Product Desc.", icon: "🛍️" },
  { id: "email", name: "Email Writer", icon: "📧" },
  { id: "coding", name: "Coding", icon: "💻" },
  { id: "business", name: "Business Consultant", icon: "💼" },
];

export default function Sidebar() {
  const {
    workspaces, activeWorkspaceId, setActiveWorkspaceId,
    conversations, activeConversationId,
    expertMode, setExpertMode,
    sidebarPanel, setSidebarPanel,
    sidebarOpen,
    newChat, loadConversation, deleteConversation, renameConversation,
    deleteWorkspace, setWorkspaceModal, openConfirm,
    setCurrentView, currentView,
  } = useApp();

  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [wsDropOpen, setWsDropOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const filteredConvs = conversations.filter((c) => {
    const matchesWs = !activeWorkspaceId || c.workspace_id === activeWorkspaceId || !c.workspace_id;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesWs && matchesSearch;
  });

  const handleRename = async (id) => {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    try { await renameConversation(id, renameVal.trim()); }
    catch (e) { /* ignore */ }
    setRenamingId(null);
  };

  const handleDelete = (id, title) => {
    openConfirm(`Delete "${title}"? This cannot be undone.`, () => deleteConversation(id));
  };

  return (
    <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><SparkleIcon /></div>
          <span className="sidebar-logo-name">AI Assistant</span>
        </div>
        <button className="new-chat-btn" onClick={newChat} aria-label="New chat">
          <PlusIcon /> New Chat
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="ws-switcher">
        <button className="ws-switcher-btn" onClick={() => setWsDropOpen((p) => !p)}>
          <span className="ws-switcher-dot" />
          <span className="ws-switcher-name">{activeWorkspace?.name || "Select workspace"}</span>
          <ChevronIcon />
        </button>
        {wsDropOpen && (
          <div className="ws-dropdown">
            {workspaces.map((w) => (
              <button
                key={w.id}
                className={`ws-dropdown-item${w.id === activeWorkspaceId ? " ws-dropdown-item--active" : ""}`}
                onClick={() => { setActiveWorkspaceId(w.id); setWsDropOpen(false); }}
              >
                <span className="ws-dropdown-name">{w.name}</span>
                {w.business_name && <span className="ws-dropdown-biz">{w.business_name}</span>}
              </button>
            ))}
            <div className="ws-dropdown-sep" />
            <button className="ws-dropdown-action" onClick={() => { setWorkspaceModal({ open: true, mode: "create", workspace: null }); setWsDropOpen(false); }}>
              + New Workspace
            </button>
            {activeWorkspace && !activeWorkspace.is_default && (
              <button className="ws-dropdown-action" onClick={() => { setWorkspaceModal({ open: true, mode: "edit", workspace: activeWorkspace }); setWsDropOpen(false); }}>
                Edit Workspace
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expert Mode Selector */}
      <div className="sidebar-mode">
        <button className="sidebar-mode-btn" onClick={() => setModeOpen((p) => !p)}>
          <span>{EXPERT_MODES.find((m) => m.id === expertMode)?.icon || "✦"}</span>
          <span className="sidebar-mode-label">{EXPERT_MODES.find((m) => m.id === expertMode)?.name || "General"}</span>
          <ChevronIcon />
        </button>
        {modeOpen && (
          <div className="mode-dropdown">
            {EXPERT_MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-item${m.id === expertMode ? " mode-item--active" : ""}`}
                onClick={() => { setExpertMode(m.id); setModeOpen(false); }}
              >
                <span className="mode-item-icon">{m.icon}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="sidebar-tabs">
        <button className={`sidebar-tab${sidebarPanel === "chats" ? " sidebar-tab--active" : ""}`} onClick={() => { setSidebarPanel("chats"); setCurrentView("chat"); }}>Chats</button>
        <button className={`sidebar-tab${sidebarPanel === "saved" ? " sidebar-tab--active" : ""}`} onClick={() => { setSidebarPanel("saved"); setCurrentView("saved"); }}>Saved</button>
        <button className={`sidebar-tab${sidebarPanel === "templates" ? " sidebar-tab--active" : ""}`} onClick={() => { setSidebarPanel("templates"); setCurrentView("templates"); }}>Templates</button>
      </div>

      {/* Panel Content */}
      <div className="sidebar-nav">
        {sidebarPanel === "chats" && (
          <>
            <div className="sidebar-search-wrap">
              <input
                className="sidebar-search"
                placeholder="Search chats…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search conversations"
              />
            </div>
            {filteredConvs.length === 0 ? (
              <p className="sidebar-empty-hint">No conversations yet.<br />Start a new chat to begin.</p>
            ) : (
              <ul className="sidebar-conv-list">
                {filteredConvs.map((conv) => (
                  <li key={conv.id} className="sidebar-conv-li">
                    {renamingId === conv.id ? (
                      <div className="sidebar-rename-wrap">
                        <input
                          className="sidebar-rename-input"
                          value={renameVal}
                          onChange={(e) => setRenameVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRename(conv.id); if (e.key === "Escape") setRenamingId(null); }}
                          autoFocus
                        />
                        <button className="sidebar-rename-save" onClick={() => handleRename(conv.id)}>✓</button>
                      </div>
                    ) : (
                      <button
                        className={`sidebar-conv-item${conv.id === activeConversationId ? " sidebar-conv-item--active" : ""}`}
                        onClick={() => loadConversation(conv.id)}
                        title={conv.title}
                      >
                        <ChatIcon />
                        <span className="sidebar-conv-title">{conv.title}</span>
                        <div className="sidebar-conv-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="sidebar-conv-action" title="Rename" onClick={() => { setRenamingId(conv.id); setRenameVal(conv.title); }}>✎</button>
                          <button className="sidebar-conv-action sidebar-conv-action--del" title="Delete" onClick={() => handleDelete(conv.id, conv.title)}>✕</button>
                        </div>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {sidebarPanel === "saved" && (
          <div className="sidebar-panel-hint">
            <p>View saved AI responses in the main panel.</p>
          </div>
        )}
        {sidebarPanel === "templates" && (
          <div className="sidebar-panel-hint">
            <p>Browse templates in the main panel.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={() => { setCurrentView("settings"); setSidebarPanel("chats"); }}>
          <SettingsIcon /> Settings
        </button>
        {activeWorkspace && !activeWorkspace.is_default && (
          <button
            className="sidebar-footer-btn sidebar-footer-btn--danger"
            onClick={() => openConfirm(`Delete workspace "${activeWorkspace.name}"? This cannot be undone.`, () => deleteWorkspace(activeWorkspace.id))}
          >
            <TrashIcon /> Delete Workspace
          </button>
        )}
        <p className="sidebar-footer-text">Powered by Llama 3.3 · Free</p>
      </div>
    </aside>
  );
}

function SparkleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>;
}
function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function ChatIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function ChevronIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
}
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}
function SettingsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}
