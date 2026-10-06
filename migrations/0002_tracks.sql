CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  link_id TEXT,
  lat REAL,
  lon REAL,
  accuracy REAL,
  altitude REAL,
  ip TEXT,
  ua TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  referer TEXT,
  created INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tracks_link ON tracks(link_id, created DESC);
