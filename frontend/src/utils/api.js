const BASE = "http://localhost:5000/api";

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + path, opts);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  // Workspaces
  getWorkspaces: () => request("GET", "/workspaces"),
  createWorkspace: (body) => request("POST", "/workspaces", body),
  updateWorkspace: (id, body) => request("PUT", `/workspaces/${id}`, body),
  deleteWorkspace: (id) => request("DELETE", `/workspaces/${id}`),

  // Conversations
  getConversations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/conversations${qs ? "?" + qs : ""}`);
  },
  createConversation: (body) => request("POST", "/conversations", body),
  updateConversation: (id, body) => request("PUT", `/conversations/${id}`, body),
  deleteConversation: (id) => request("DELETE", `/conversations/${id}`),
  getMessages: (id) => request("GET", `/conversations/${id}/messages`),

  // Generate
  generate: (body) => request("POST", "/generate", body),
  transform: (body) => request("POST", "/generate/transform", body),

  // Saved responses
  getSaved: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request("GET", `/saved${qs ? "?" + qs : ""}`);
  },
  createSaved: (body) => request("POST", "/saved", body),
  updateSaved: (id, body) => request("PUT", `/saved/${id}`, body),
  deleteSaved: (id) => request("DELETE", `/saved/${id}`),

  // Settings
  getSettings: () => request("GET", "/settings"),
  updateSettings: (body) => request("PUT", "/settings", body),
};
