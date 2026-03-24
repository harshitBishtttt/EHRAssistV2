import { useState, useRef, useEffect } from 'react';
import { setOpenAIKey } from '../services/openai';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function ApiKeyModal({ onSuccess }) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-')) {
      setError('Please enter a valid OpenAI API key (starts with sk-).');
      return;
    }
    setError('');
    setOpenAIKey(trimmed);
    onSuccess();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <img src="/chatbot_image/chatbot.png" alt="" className="modal-logo" />
          <div>
            <h3>OpenAI API Key Required</h3>
            <p>Enter your key to power CareBridge's AI engine. It is stored only in your browser.</p>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label htmlFor="apikey-input">OpenAI API Key</label>
          <div className="pw-wrap">
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              id="apikey-input"
              placeholder="sk-proj-..."
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="pw-toggle"
              id="toggle-apikey"
              onClick={() => setShowKey(!showKey)}
              aria-label="Toggle API key visibility"
            >
              <EyeIcon />
            </button>
          </div>
        </div>
        {error && (
          <div className="error-banner">
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}
        <button type="button" className="launch-btn" style={{ marginTop: '16px' }} onClick={handleSave}>
          Save &amp; Continue
        </button>
        <p className="login-footer" style={{ marginTop: '12px' }}>
          Your key is stored locally in this browser only and never sent anywhere except OpenAI.
        </p>
      </div>
    </div>
  );
}
