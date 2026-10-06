export function layout({ title, user, body, active }) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{
  --bg:#0a0c10;--bg2:#0f1218;--bg3:#161a22;--line:#1e2530;
  --fg:#c9d1d9;--fg2:#7d8794;--acc:#22d3ee;--acc2:#06b6d4;
  --green:#22c55e;--red:#ef4444;--yellow:#eab308;--purple:#a855f7;
  --mono:'JetBrains Mono','Fira Code',ui-monospace,Menlo,Consolas,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,Segoe UI,sans-serif;
 font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:var(--acc);text-decoration:none}
.mono{font-family:var(--mono)}

.nav{background:var(--bg2);border-bottom:1px solid var(--line);padding:12px 24px;
 display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.nav .brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:.04em}
.nav .brand .dot{width:8px;height:8px;border-radius:50%;background:var(--acc);
 box-shadow:0 0 12px var(--acc);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.nav .links{display:flex;gap:20px;font-size:13px;color:var(--fg2)}
.nav .links a{color:var(--fg2)}
.nav .links a:hover{color:var(--acc)}
.nav .links a.active{color:var(--acc)}
.nav .user{font-size:12px;color:var(--fg2);font-family:var(--mono)}

.wrap{max-width:1400px;margin:0 auto;padding:24px}

.btn{background:var(--bg3);border:1px solid var(--line);color:var(--fg);
 padding:8px 14px;border-radius:6px;cursor:pointer;font-size:13px;
 transition:.15s;font-family:inherit}
.btn:hover{border-color:var(--acc);color:var(--acc)}
.btn-primary{background:var(--acc);color:#001014;border-color:var(--acc);font-weight:600}
.btn-primary:hover{background:var(--acc2);color:#001014}
.btn-danger{border-color:#7f1d1d;color:#fca5a5}
.btn-danger:hover{border-color:var(--red);color:var(--red)}
.btn-sm{padding:5px 10px;font-size:12px}

.card{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:20px}
.card-title{font-size:12px;text-transform:uppercase;letter-spacing:.12em;
 color:var(--fg2);margin-bottom:14px;font-weight:600}

input,select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);
 color:var(--fg);padding:10px 12px;border-radius:6px;font-family:var(--mono);
 font-size:13px;outline:none;transition:.15s}
input:focus,select:focus,textarea:focus{border-color:var(--acc)}
label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;
 color:var(--fg2);margin-bottom:6px;font-weight:600}

.g{display:grid;gap:16px}
.g2{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.g3{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}

.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;
 text-transform:uppercase;letter-spacing:.08em;font-weight:600;font-family:var(--mono)}
.badge-green{background:rgba(34,197,94,.15);color:var(--green)}
.badge-red{background:rgba(239,68,68,.15);color:var(--red)}
.badge-yellow{background:rgba(234,179,8,.15);color:var(--yellow)}
.badge-gray{background:rgba(125,135,148,.15);color:var(--fg2)}

.muted{color:var(--fg2);font-size:12px}
.mono-sm{font-family:var(--mono);font-size:11px;color:var(--fg2)}
</style>
</head><body>
<div class="nav">
  <div class="brand"><span class="dot"></span>VanzRAT</div>
  <div class="links">
    <a href="/panel" class="${active==='dash'?'active':''}">Devices</a>
    <a href="/panel" class="${active==='res'?'active':''}">Results</a>
    <a href="/logout">Logout</a>
  </div>
  <div class="user">op://${user}</div>
</div>
<div class="wrap">${body}</div>
</body></html>`;
}
