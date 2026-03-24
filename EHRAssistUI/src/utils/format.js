export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDisplayName(raw) {
  let name = raw.includes('@') ? raw.split('@')[0] : raw;
  name = name.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
