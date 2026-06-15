import { useState } from 'react';

const PLACEHOLDERS = {
  summary: 'Paste the text you want summarized here...',
  description: 'Describe the product/service (name, features, audience, etc.)...',
  email: 'Describe the email purpose (e.g., "Follow up with client about delayed project, polite tone")...',
};

const BUTTON_LABELS = {
  summary: 'Generate Summary',
  description: 'Generate Description',
  email: 'Generate Email',
};

const API_URL = 'http://localhost:5000/api/generate';

function ContentGenerator({ type }) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter some input first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt, tone }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      setResult(data.reply);
    } catch (err) {
      setError('Something went wrong. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <textarea
        placeholder={PLACEHOLDERS[type]}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <input
        type="text"
        placeholder="Optional: tone/style (e.g., formal, friendly, concise)"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : BUTTON_LABELS[type]}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-box">
          <span className="result-label">Result:</span>
          {result}
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentGenerator;
