import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import PromptBuilder from "./PromptBuilder";

const CONTENT_TYPES = [
  { value: "custom", label: "Custom" },
  { value: "summary", label: "Summary" },
  { value: "description", label: "Description" },
  { value: "email", label: "Email" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "persuasive", label: "Persuasive" },
];

export default function ChatInput({ onSend, loading }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("custom");
  const [tone, setTone] = useState("professional");
  const textareaRef = useRef(null);
  const { promptBuilderOpen, setPromptBuilderOpen, currentView } = useApp();

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [prompt]);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || loading) return;
    onSend(prompt, type, tone);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [prompt, type, tone, loading, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }, [handleSubmit]);

  if (currentView !== "chat") return null;

  return (
    <>
      {promptBuilderOpen && <PromptBuilder onSend={onSend} onClose={() => setPromptBuilderOpen(false)} />}
      <div className="input-panel">
        <div className="input-selectors">
          <div className="chip-group">
            {CONTENT_TYPES.map((ct) => (
              <button key={ct.value} className={`chip${type === ct.value ? " chip--active" : ""}`} onClick={() => setType(ct.value)} disabled={loading} aria-pressed={type === ct.value}>
                {ct.label}
              </button>
            ))}
            <button className="chip chip--builder" onClick={() => setPromptBuilderOpen(true)} disabled={loading} title="Smart Prompt Builder">
              ✦ Builder
            </button>
          </div>
          <select className="tone-select" value={tone} onChange={(e) => setTone(e.target.value)} disabled={loading} aria-label="Tone">
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            rows={1}
            aria-label="Message"
          />
          <button className="send-btn" onClick={handleSubmit} disabled={loading || !prompt.trim()} aria-label="Send message">
            {loading ? <span className="send-spinner" aria-hidden="true" /> : <SendIcon />}
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </>
  );
}

function SendIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
}
