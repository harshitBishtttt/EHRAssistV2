import { useCallback, useState } from 'react';
import { sendChatMessage, clearChatSession } from '../services/chatApi';

const SESSION_ID = 'default';

export function useChat() {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  const clearChat = useCallback(async () => {
    setConversationHistory([]);
    setStreamingContent('');
    setRateLimitMessage('');
    try {
      await clearChatSession(SESSION_ID);
    } catch (e) {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(
    async (userMessage, { onFinalMessage, onEndChat, onError }) => {
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
      setConversationHistory(newHistory);
      setIsTyping(true);
      setRateLimitMessage('');

      try {
        const { content, conversationEnded } = await sendChatMessage(userMessage, SESSION_ID);

        setConversationHistory((prev) => [...prev, { role: 'assistant', content }]);
        setIsTyping(false);
        setStreamingContent('');
        setRateLimitMessage('');

        if (conversationEnded && onEndChat) {
          onEndChat(content);
        } else if (onFinalMessage) {
          onFinalMessage(content, content);
        }
      } catch (err) {
        const errMsg = `Sorry, I encountered an error: ${err.message}. Please try again.`;
        setConversationHistory((prev) => [...prev, { role: 'assistant', content: errMsg }]);
        setIsTyping(false);
        setStreamingContent('');
        setRateLimitMessage('');
        if (onError) onError(err.message);
      }
    },
    [conversationHistory]
  );

  return {
    conversationHistory,
    isTyping,
    streamingContent,
    rateLimitMessage,
    sendMessage,
    clearChat,
  };
}
