import { useState } from "react";
import { useApp } from "../context/AppContext";
import ResponseActions from "./ResponseActions";

function renderContent(content) {
  if (!content) return null;
  const parts = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++} className="msg-text">{content.slice(lastIndex, match.index)}</span>);
    }
    const lang = match[1].trim();
    const code = match[2].replace(/\n$/, "");
    parts.push(
      <div key={key++} className="code-block-wrapper">
        {lang && <div className="code-lang">{lang}</div>}
        <pre className="code-block"><code>{code}</code></pre>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(<span key={key++} className="msg-text">{content.slice(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : <span className="msg-text">{content}</span>;
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Message({ message }) {
  const [copied, setCopied] = useState(false);
  const { saveResponse, actionLoading } = useApp();
  const isUser = message.role === "user";
  const isError = Boolean(message.error);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || message.error || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    try { await saveResponse(message.content, message.id); }
    catch (e) { /* ignore */ }
  };

  return (
    <div className={`message message--${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="message-avatar" aria-hidden="true"><AvatarIcon /></div>
      )}

      <div className={`message-bubble ${isUser ? "message-bubble--user" : isError ? "message-bubble--error" : "message-bubble--assistant"}`}>
        {isError ? (
          <div className="error-content"><WarnIcon /><span>{message.error}</span></div>
        ) : (
          <div className="message-content">{renderContent(message.content)}</div>
        )}

        <div className="message-footer">
          <span className="message-time">{formatTime(message.created_at || Date.now())}</span>
          {!isUser && !isError && (
            <div className="message-quick-actions">
              <button className="copy-msg-btn" onClick={handleCopy}>{copied ? "✓ Copied" : "Copy"}</button>
              <button className="copy-msg-btn" onClick={handleSave}>Save</button>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="message-avatar message-avatar--user" aria-hidden="true">You</div>
      )}

      {!isUser && !isError && (
        <ResponseActions content={message.content} messageId={message.id} />
      )}
    </div>
  );
}

function AvatarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>;
}
function WarnIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
