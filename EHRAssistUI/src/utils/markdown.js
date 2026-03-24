import { marked } from 'marked';

export function renderMarkdown(text) {
  return marked.parse(text || '');
}
