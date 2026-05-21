const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8007';

function apiKey() {
  return localStorage.getItem('api_key');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const key = apiKey();
  if (key) headers['Authorization'] = `Bearer ${key}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const requestMagicLink = (email, company, use_case) =>
  request('/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify({ email, company, use_case }),
  });

export const verifyMagicLink = (token) =>
  request(`/auth/verify?token=${encodeURIComponent(token)}`);

// Profile
export const fetchProfile = () => request('/me');

// Rotate key
export const rotateKey = () => request('/me/rotate-key', { method: 'POST' });

// Websocket
export const wsStream = (token) => {
  const baseUrl = import.meta.env.VITE_API_WS_URL ?? 'ws://127.0.0.1:8007';
    const wsUrl = `${baseUrl}/ws/stream?token=${encodeURIComponent(token)}`;
    // const wsUrl = `ws://127.0.0.1:8007/ws/stream?token=${encodeURIComponent(token)}`; // for local
    return new WebSocket(wsUrl);
}