import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { WelcomeCard } from './WelcomeCard';
import { MessageBubble } from './MessageBubble';
import { renderMarkdown } from '../../utils/markdown';

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export function ChatPanel({ userName, userInitial, isOpen, onClose }) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [streamingBubble, setStreamingBubble] = useState(null);

  const {
    conversationHistory,
    isTyping,
    streamingContent,
    rateLimitMessage,
    sendMessage,
    clearChat,
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, streamingContent]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const displayMessages = conversationHistory.filter(
    (m) => m.role === 'user' || (m.role === 'assistant' && m.content)
  );

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    inputRef.current.style.height = 'auto';

    sendMessage(text, {
      onStreamingBubble: (content) => setStreamingBubble(content),
      onFinalMessage: (finalText, _streamedText) => {
        setStreamingBubble(null);
      },
      onEndChat: (farewell) => {
        setStreamingBubble(null);
        // Append farewell as a bot message - it will show in next render via history
        // Actually the farewell is the final message - we need to append it
        // The useChat doesn't add it to history. Let me check - onEndChat is called
        // with the farewell message. We could either add it in the hook or show it here.
        // The original app does appendMessage("bot", args.farewell_message). So we need to
        // add it to the conversation. Let me update the hook to add the farewell to history
        // before calling onEndChat. Actually the hook returns early on end_chat, so we never
        // add the farewell to conversationHistory. We need to either:
        // 1. Add farewell to history in the hook before calling onEndChat
        // 2. Or have onEndChat receive it and the parent displays it
        // The simplest is to add it in the hook. Let me update useChat to push the farewell
        // to conversationHistory before calling onEndChat.
      },
      onError: (msg) => {
        setStreamingBubble(null);
        // We need to show the error - the hook could add it as a bot message
        // For now we could add an error state. Let me add an error message to the chat.
      },
    });
  };

  const handleChipClick = (query) => {
    handleSendWithQuery(query);
  };

  const handleSendWithQuery = (query) => {
    if (!query?.trim()) return;
    sendMessage(query.trim(), {
      onStreamingBubble: (content) => setStreamingBubble(content),
      onFinalMessage: () => setStreamingBubble(null),
      onEndChat: () => setStreamingBubble(null),
      onError: () => setStreamingBubble(null),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const showWelcome = displayMessages.length === 0 && !streamingContent && !isTyping;

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <div className="chat-panel-info">
          <img src="/chatbot_image/chatbot.png" alt="CareBridge" className="panel-avatar" />
          <div>
            <span className="panel-name">RSICareBridge</span>
            <span className="panel-status">
              <span className="online-dot" />
              Online
            </span>
          </div>
        </div>
        <div className="panel-header-actions">
          <button
            type="button"
            className="panel-action-btn"
            title="Clear chat"
            onClick={() => {
              clearChat();
            }}
          >
            <ClearIcon />
          </button>
          <button type="button" className="panel-action-btn" title="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>

      <div id="messages" className="messages-area">
        {showWelcome && <WelcomeCard userName={userName} onChipClick={handleChipClick} />}
        {displayMessages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role === 'user' ? 'user' : 'bot'}
            content={msg.content}
            userInitial={userInitial}
          />
        ))}
        {streamingContent && (
          <div className="msg-row bot">
            <img src="/chatbot_image/chatbot.png" alt="CareBridge" className="msg-avatar" />
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
              <div className="msg-bubble">
                {rateLimitMessage ? (
                  <span style={{ fontSize: '11px', color: '#4a5568' }}>{rateLimitMessage}</span>
                ) : (
                  streamingContent
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && !streamingContent && (
        <div className="typing-indicator">
          <img src="/chatbot_image/chatbot.png" alt="" className="typing-avatar" />
          <div className="typing-bubble">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      )}

      <div className="chat-input-bar">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about patient records, labs..."
            rows={1}
            maxLength={2000}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="send-btn"
            disabled={!inputValue.trim()}
            title="Send"
            onClick={handleSend}
          >
            <SendIcon />
          </button>
        </div>
        <p className="input-hint">CareBridge retrieves FHIR R4 data. Never provides treatment recommendations.</p>
      </div>
    </div>
  );
}
