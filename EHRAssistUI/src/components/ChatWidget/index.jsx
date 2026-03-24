import { useState } from 'react';
import { ChatPanel } from './ChatPanel';

const ToggleOpenIcon = () => (
  <img src="/chatbot_image/chatbot.png" alt="CareBridge" className="toggle-icon-open" />
);

const ToggleCloseIcon = () => (
  <svg className="toggle-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function ChatWidget({ userName, userInitial }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const togglePanel = () => setIsPanelOpen((prev) => !prev);
  const closePanel = () => setIsPanelOpen(false);

  return (
    <div id="chat-widget">
      {isPanelOpen && (
        <ChatPanel
          userName={userName}
          userInitial={userInitial}
          isOpen={isPanelOpen}
          onClose={closePanel}
        />
      )}
      <button
        type="button"
        className="chat-toggle-btn"
        title="Open CareBridge"
        onClick={togglePanel}
        aria-label={isPanelOpen ? 'Close chat' : 'Open CareBridge'}
      >
        {isPanelOpen ? <ToggleCloseIcon /> : <ToggleOpenIcon />}
      </button>
    </div>
  );
}
