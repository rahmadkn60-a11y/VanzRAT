import { hmac } from './crypto.js';

export async function signToken(payload, secret) {
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const sig = await hmac(secret, body);
  return `${body}.${sig}`;
}

export async function verifyToken(token, secret) {
  try {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = await hmac(secret, body);
    if (expected !== sig) return null;
    const payload = JSON.parse(atob(body));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export async function operatorAuth(req, env) {
  const cookie = req.headers.get('Cookie') || '';
  const m = cookie.match(/vanzrat_session=([^;]+)/);
  if (!m) return null;
  return verifyToken(m[1], env.JWT_SECRET || 'change-me');
}

export async function implantAuth(req) {
  const a = req.headers.get('Authorization') || '';
  return a.startsWith('Bearer ') ? a.slice(7) : null;
}
