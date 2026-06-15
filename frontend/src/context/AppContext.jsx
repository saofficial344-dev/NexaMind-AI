import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [expertMode, setExpertMode] = useState("general");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [settings, setSettings] = useState({});
  const [sidebarPanel, setSidebarPanel] = useState("chats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("chat");
  const [workspaceModal, setWorkspaceModal] = useState({ open: false, mode: "create", workspace: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });
  const [promptBuilderOpen, setPromptBuilderOpen] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [initError, setInitError] = useState(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const [wsData, stData, convData] = await Promise.all([
          api.getWorkspaces(),
          api.getSettings(),
          api.getConversations(),
        ]);
        setWorkspaces(wsData.workspaces);
        setSettings(stData.settings);
        setConversations(convData.conversations);
        setExpertMode(stData.settings.default_expert_mode || "general");

        // Set active workspace from settings or first available
        const defaultId = stData.settings.default_workspace_id;
        const firstId = wsData.workspaces[0]?.id;
        setActiveWorkspaceId(defaultId || firstId || null);
      } catch (err) {
        setInitError(err.message);
      }
    })();
  }, []);

  // === WORKSPACE ACTIONS ===

  const createWorkspace = useCallback(async (data) => {
    const res = await api.createWorkspace(data);
    setWorkspaces((prev) => [...prev, res.workspace]);
    return res.workspace;
  }, []);

  const updateWorkspace = useCallback(async (id, data) => {
    const res = await api.updateWorkspace(id, data);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? res.workspace : w)));
    return res.workspace;
  }, []);

  const deleteWorkspace = useCallback(async (id) => {
    await api.deleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspaceId === id) {
      const remaining = workspaces.filter((w) => w.id !== id);
      setActiveWorkspaceId(remaining[0]?.id || null);
    }
  }, [activeWorkspaceId, workspaces]);

  // === CONVERSATION ACTIONS ===

  const loadConversation = useCallback(async (convId) => {
    setActiveConversationId(convId);
    setSidebarOpen(false);
    setCurrentView("chat");
    if (!convId) {
      setMessages([]);
      return;
    }
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages);
      if (res.conversation.expert_mode) setExpertMode(res.conversation.expert_mode);
      if (res.conversation.workspace_id) setActiveWorkspaceId(res.conversation.workspace_id);
    } catch (err) {
      console.error("Failed to load conversation:", err.message);
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setCurrentView("chat");
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback(async (id) => {
    await api.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

  const renameConversation = useCallback(async (id, title) => {
    const res = await api.updateConversation(id, { title });
    setConversations((prev) => prev.map((c) => (c.id === id ? res.conversation : c)));
  }, []);

  // === SEND MESSAGE ===

  const sendMessage = useCallback(async (prompt, type = "custom", tone = "professional") => {
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt.trim();
    let convId = activeConversationId;
    let isNewConv = false;

    if (!convId) {
      isNewConv = true;
      const title = userPrompt.slice(0, 55) + (userPrompt.length > 55 ? "…" : "");
      try {
        const res = await api.createConversation({
          workspaceId: activeWorkspaceId,
          expertMode,
          title,
        });
        convId = res.conversation.id;
        setConversations((prev) => [res.conversation, ...prev]);
        setActiveConversationId(convId);
      } catch (err) {
        const tempErr = { id: "e_" + Date.now(), role: "assistant", content: null, error: "Failed to create conversation: " + err.message, created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, tempErr]);
        return;
      }
    }

    const tempId = "u_tmp_" + Date.now();
    const tempMsg = { id: tempId, role: "user", content: userPrompt, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setLoading(true);

    try {
      const data = await api.generate({
        conversationId: convId,
        workspaceId: activeWorkspaceId,
        expertMode,
        prompt: userPrompt,
        type,
        tone,
      });

      const now = new Date().toISOString();
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId);
        return [
          ...without,
          { id: data.userMessageId, role: "user", content: userPrompt, created_at: now },
          { id: data.aiMessageId, role: "assistant", content: data.reply, created_at: new Date(Date.now() + 1).toISOString() },
        ];
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, last_message: data.reply.slice(0, 100), updated_at: now }
            : c
        )
      );
    } catch (err) {
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== tempId);
        return [...without, { id: "e_" + Date.now(), role: "assistant", content: null, error: err.message, created_at: new Date().toISOString() }];
      });
    } finally {
      setLoading(false);
    }
  }, [activeConversationId, activeWorkspaceId, expertMode, loading]);

  // === TRANSFORM MESSAGE ===

  const transformMessage = useCallback(async (content, action, options = {}) => {
    if (actionLoading) return;
    const loadKey = action + "_" + Date.now();
    setActionLoading(loadKey);

    try {
      const data = await api.transform({
        content,
        action,
        conversationId: activeConversationId,
        workspaceId: activeWorkspaceId,
        expertMode,
        ...options,
      });

      const newMsg = {
        id: data.aiMessageId || "a_" + Date.now(),
        role: "assistant",
        content: data.result,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);

      if (activeConversationId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? { ...c, last_message: data.result.slice(0, 100), updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      const errMsg = { id: "e_" + Date.now(), role: "assistant", content: null, error: err.message, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, activeConversationId, activeWorkspaceId, expertMode]);

  // === SAVED RESPONSES ===

  const loadSaved = useCallback(async (params = {}) => {
    const res = await api.getSaved(params);
    setSavedItems(res.saved_responses);
  }, []);

  const saveResponse = useCallback(async (content, messageId) => {
    const res = await api.createSaved({
      content,
      workspaceId: activeWorkspaceId,
      expertMode,
      conversationId: activeConversationId,
      messageId,
    });
    setSavedItems((prev) => [res.saved_response, ...prev]);
    return res.saved_response;
  }, [activeWorkspaceId, expertMode, activeConversationId]);

  const deleteSaved = useCallback(async (id) => {
    await api.deleteSaved(id);
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // === SETTINGS ===

  const updateSettings = useCallback(async (data) => {
    const res = await api.updateSettings(data);
    setSettings(res.settings);
  }, []);

  // === MODALS ===

  const openConfirm = useCallback((message, onConfirm) => {
    setConfirmModal({ open: true, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal({ open: false, message: "", onConfirm: null });
  }, []);

  const value = {
    workspaces, activeWorkspaceId, activeWorkspace, setActiveWorkspaceId,
    conversations, activeConversationId, activeConversation, messages,
    expertMode, setExpertMode,
    loading, actionLoading,
    settings, updateSettings,
    sidebarPanel, setSidebarPanel,
    sidebarOpen, setSidebarOpen,
    currentView, setCurrentView,
    workspaceModal, setWorkspaceModal,
    confirmModal, closeConfirm, openConfirm,
    promptBuilderOpen, setPromptBuilderOpen,
    savedItems, setSavedItems,
    initError,
    // Actions
    createWorkspace, updateWorkspace, deleteWorkspace,
    loadConversation, newChat, deleteConversation, renameConversation,
    sendMessage, transformMessage,
    loadSaved, saveResponse, deleteSaved,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
