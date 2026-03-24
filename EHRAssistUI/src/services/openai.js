import { OPENAI_MODEL } from '../constants/config';
import { STORAGE_KEYS } from '../constants/config';
import { TOOLS } from './tools';
import { buildSystemPrompt } from './systemPrompt';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let _systemPromptCache = null;
let _systemPromptDate = null;

export function getSystemPrompt() {
  const today = new Date().toISOString().split('T')[0];
  if (!_systemPromptCache || _systemPromptDate !== today) {
    _systemPromptCache = buildSystemPrompt();
    _systemPromptDate = today;
  }
  return _systemPromptCache;
}

export function getOpenAIKey() {
  return localStorage.getItem(STORAGE_KEYS.OPENAI_KEY) || '';
}

export function setOpenAIKey(key) {
  localStorage.setItem(STORAGE_KEYS.OPENAI_KEY, key);
}

/**
 * Streams the OpenAI response. Calls onTextChunk(chunk) for each text delta.
 * onRateLimitRetry(seconds) is called when rate limited - can update UI.
 * Returns { content, tool_calls, finish_reason }.
 */
export async function sendToOpenAI(messages, { onTextChunk = null, onRateLimitRetry = null } = {}, retryCount = 0) {
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error('OpenAI API key is required');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      stream: true,
    }),
  });

  if (res.status === 429 && retryCount < 3) {
    const errText = await res.text();
    let waitMs = 12000;
    try {
      const errJson = JSON.parse(errText);
      const msg = errJson.error?.message || '';
      const match = msg.match(/try again in (\d+\.?\d*)s/i);
      if (match) waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
    } catch (e) {}
    const waitSec = Math.ceil(waitMs / 1000);
    if (onRateLimitRetry) onRateLimitRetry(waitSec);
    await sleep(waitMs);
    return sendToOpenAI(messages, { onTextChunk, onRateLimitRetry }, retryCount + 1);
  }

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || 'OpenAI API error');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  const toolCallsMap = {};
  let finishReason = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') {
        finishReason = finishReason || 'stop';
        continue;
      }
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const choice = parsed.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta;
        if (delta?.content) {
          fullContent += delta.content;
          if (onTextChunk) onTextChunk(delta.content);
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallsMap[idx]) {
              toolCallsMap[idx] = { id: '', type: 'function', function: { name: '', arguments: '' } };
            }
            if (tc.id) toolCallsMap[idx].id += tc.id;
            if (tc.function?.name) toolCallsMap[idx].function.name += tc.function.name;
            if (tc.function?.arguments) toolCallsMap[idx].function.arguments += tc.function.arguments;
          }
        }
      } catch (e) {
        /* ignore malformed chunks */
      }
    }
  }

  const toolCallsList = Object.values(toolCallsMap);
  return {
    content: fullContent || null,
    tool_calls: toolCallsList.length ? toolCallsList : null,
    finish_reason: finishReason || (toolCallsList.length ? 'tool_calls' : 'stop'),
  };
}
