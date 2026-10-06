CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  install_id TEXT UNIQUE,
  model TEXT,
  brand TEXT,
  android TEXT,
  sdk INTEGER,
  carrier TEXT,
  phone TEXT,
  battery INTEGER DEFAULT 0,
  last_seen INTEGER,
  first_seen INTEGER,
  ip TEXT,
  country TEXT,
  status TEXT DEFAULT 'active',
  api_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS commands (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  cmd TEXT,
  args TEXT,
  status TEXT DEFAULT 'pending',
  created INTEGER,
  sent INTEGER,
  done INTEGER
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  command_id TEXT,
  device_id TEXT,
  data TEXT,
  file_key TEXT,
  created INTEGER
);

CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  created INTEGER
);

CREATE INDEX IF NOT EXISTS idx_cmd_dev ON commands(device_id, status);
CREATE INDEX IF NOT EXISTS idx_res_dev ON results(device_id, created DESC);
