import { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import WelcomeScreen from "./components/WelcomeScreen";
import WorkspaceModal from "./components/WorkspaceModal";
import ConfirmModal from "./components/ConfirmModal";
import SavedResponses from "./components/SavedResponses";
import Templates from "./components/Templates";
import Settings from "./components/Settings";

function Layout() {
  const {
    messages, loading, sidebarOpen, setSidebarOpen,
    currentView, activeConversation, activeWorkspace,
    expertMode, confirmModal, workspaceModal,
    sendMessage, promptBuilderOpen,
  } = useApp();

  const EXPERT_LABELS = {
    general: "General Assistant", seo: "SEO Expert", social: "Social Media Manager",
    ads: "Meta Ads Expert", blog: "Blog Writer", product: "Product Description Writer",
    email: "Email Writer", coding: "Coding Assistant", business: "Business Consultant",
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <Sidebar />

      <div className="main-panel">
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen((p) => !p)} aria-label="Toggle sidebar">
            <MenuIcon />
          </button>
          <div className="topbar-context">
            {activeWorkspace && (
              <span className="topbar-workspace">{activeWorkspace.business_name || activeWorkspace.name}</span>
            )}
            {activeWorkspace && <span className="topbar-sep">·</span>}
            <span className="topbar-mode">{EXPERT_LABELS[expertMode] || "General Assistant"}</span>
          </div>
        </header>

        {currentView === "settings" ? (
          <Settings />
        ) : currentView === "saved" ? (
          <SavedResponses />
        ) : currentView === "templates" ? (
          <Templates />
        ) : (
          <>
            <div className="chat-scroll-area">
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <ChatArea messages={messages} loading={loading} />
              )}
            </div>
            <ChatInput onSend={sendMessage} loading={loading} />
          </>
        )}
      </div>

      {workspaceModal.open && <WorkspaceModal />}
      {confirmModal.open && <ConfirmModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}
