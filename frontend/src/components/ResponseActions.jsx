import { useState } from "react";
import { useApp } from "../context/AppContext";

const PRIMARY_ACTIONS = [
  { id: "shorter", label: "Shorter" },
  { id: "longer", label: "Longer" },
  { id: "professional", label: "Professional" },
  { id: "simple", label: "Simplify" },
];

const MORE_ACTIONS = [
  { id: "improve_cta", label: "Improve CTA" },
  { id: "add_emojis", label: "Add Emojis" },
  { id: "remove_emojis", label: "Remove Emojis" },
  { id: "instagram", label: "→ Instagram" },
  { id: "facebook", label: "→ Facebook Post" },
  { id: "tiktok", label: "→ TikTok Script" },
  { id: "blog", label: "→ Blog Post" },
  { id: "email", label: "→ Email" },
  { id: "meta_ad", label: "→ Meta Ad" },
  { id: "translate", label: "Translate…" },
  { id: "change_tone", label: "Change Tone…" },
];

const LANGUAGES = ["Arabic", "French", "Spanish", "German", "Hindi", "Chinese", "Japanese", "Portuguese", "Russian", "Turkish", "Urdu"];
const TONES = ["professional", "friendly", "formal", "casual", "persuasive", "humorous", "empathetic"];

export default function ResponseActions({ content, messageId }) {
  const { transformMessage, actionLoading } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const isLoading = Boolean(actionLoading);

  const run = (action, options = {}) => {
    if (isLoading) return;
    setMoreOpen(false);
    setTranslateOpen(false);
    setToneOpen(false);
    transformMessage(content, action, options);
  };

  return (
    <div className="response-actions">
      <div className="response-actions-inner">
        {PRIMARY_ACTIONS.map((a) => (
          <button
            key={a.id}
            className="ra-btn"
            onClick={() => run(a.id)}
            disabled={isLoading}
            title={a.label}
          >
            {isLoading && actionLoading?.startsWith(a.id) ? <MiniSpinner /> : a.label}
          </button>
        ))}

        <div className="ra-more-wrap">
          <button className="ra-btn ra-btn--more" onClick={() => { setMoreOpen((p) => !p); setTranslateOpen(false); setToneOpen(false); }} disabled={isLoading}>
            More ▾
          </button>

          {moreOpen && (
            <div className="ra-dropdown">
              {MORE_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  className="ra-dropdown-item"
                  onClick={() => {
                    if (a.id === "translate") { setTranslateOpen(true); setMoreOpen(false); }
                    else if (a.id === "change_tone") { setToneOpen(true); setMoreOpen(false); }
                    else run(a.id);
                  }}
                  disabled={isLoading}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {translateOpen && (
            <div className="ra-dropdown">
              <p className="ra-dropdown-label">Translate to:</p>
              {LANGUAGES.map((lang) => (
                <button key={lang} className="ra-dropdown-item" onClick={() => run("translate", { language: lang })} disabled={isLoading}>
                  {lang}
                </button>
              ))}
              <button className="ra-dropdown-cancel" onClick={() => setTranslateOpen(false)}>Cancel</button>
            </div>
          )}

          {toneOpen && (
            <div className="ra-dropdown">
              <p className="ra-dropdown-label">Change tone to:</p>
              {TONES.map((t) => (
                <button key={t} className="ra-dropdown-item" onClick={() => run("change_tone", { tone: t })} disabled={isLoading}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
              <button className="ra-dropdown-cancel" onClick={() => setToneOpen(false)}>Cancel</button>
            </div>
          )}
        </div>

        {isLoading && (
          <span className="ra-loading">Transforming…</span>
        )}
      </div>
    </div>
  );
}

function MiniSpinner() {
  return <span className="mini-spinner" aria-hidden="true" />;
}
