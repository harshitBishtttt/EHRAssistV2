import { CHAT_API_BASE } from '../constants/config';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Send user prompt to Spring Boot backend.
 * Backend processes (OpenAI + FHIR tools) and returns response.
 */
export async function sendChatMessage(message, sessionId = 'default') {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    throw new Error('No auth token. Please log in.');
  }

  const res = await fetch(`${CHAT_API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Chat API error (${res.status})`);
  }

  return res.json();
}

/**
 * Clear conversation for the given session.
 */
export async function clearChatSession(sessionId = 'default') {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return;

  await fetch(`${CHAT_API_BASE}/api/chat/clear-conversation?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
