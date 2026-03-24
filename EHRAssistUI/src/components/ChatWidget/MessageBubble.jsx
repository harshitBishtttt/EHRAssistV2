import { renderMarkdown } from '../../utils/markdown';
import { formatTime } from '../../utils/format';

export function MessageBubble({ role, content, userInitial }) {
  const isBot = role === 'bot';

  return (
    <div className={`msg-row ${role}`}>
      {isBot ? (
        <img src="/chatbot_image/chatbot.png" alt="CareBridge" className="msg-avatar" />
      ) : (
        <div className="msg-avatar user-av">{userInitial}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
        {isBot ? (
          <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          <div className="msg-bubble">{content}</div>
        )}
        <span className="msg-time">{formatTime()}</span>
      </div>
    </div>
  );
}
