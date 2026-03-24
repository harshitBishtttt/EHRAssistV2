import { LOGIN_URL } from '../constants/config';
import { STORAGE_KEYS } from '../constants/config';

export async function login(email, password) {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 400) {
      throw new Error('Invalid credentials. Please try again.');
    }
    throw new Error(`Login failed (${res.status}). Please try again.`);
  }

  const data = await res.json();
  const token = data.idToken || data.token || data.access_token;
  if (!token) throw new Error('Login failed: no token received.');

  const name = data.displayName || data.name || email.split('@')[0];

  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, name);
  return name;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser() {
  return localStorage.getItem(STORAGE_KEYS.USER);
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}
