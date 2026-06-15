import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function SavedResponses() {
  const { savedItems, loadSaved, deleteSaved, activeWorkspaceId, openConfirm } = useApp();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    loadSaved({ workspaceId: activeWorkspaceId || undefined })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeWorkspaceId]);

  const filtered = savedItems.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleDelete = (id, title) => {
    openConfirm(`Delete saved response "${title}"?`, () => deleteSaved(id));
  };

  const downloadTxt = (content, title) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.slice(0, 40).replace(/[^a-z0-9]/gi, "_") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2 className="panel-title">Saved Responses</h2>
        <p className="panel-subtitle">{filtered.length} saved item{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="panel-search-bar">
        <input className="panel-search" placeholder="Search saved responses…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="panel-loading"><span className="send-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="panel-empty">
          <p>No saved responses yet.</p>
          <p>Click "Save" under any AI response to save it here.</p>
        </div>
      ) : (
        <div className="saved-list">
          {filtered.map((item) => (
            <div key={item.id} className="saved-card">
              <div className="saved-card-header">
                <span className="saved-card-title">{item.title}</span>
                <div className="saved-card-actions">
                  <button className="saved-action" onClick={() => handleCopy(item.id, item.content)} title="Copy">
                    {copied === item.id ? "✓" : "Copy"}
                  </button>
                  <button className="saved-action" onClick={() => downloadTxt(item.content, item.title)} title="Download TXT">
                    ↓ TXT
                  </button>
                  <button className="saved-action saved-action--del" onClick={() => handleDelete(item.id, item.title)} title="Delete">
                    ✕
                  </button>
                </div>
              </div>
              <div className="saved-card-meta">
                <span className="saved-badge">{item.expert_mode || "general"}</span>
                <span className="saved-date">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <p className="saved-card-preview">{item.content.slice(0, 200)}{item.content.length > 200 ? "…" : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
