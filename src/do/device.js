export class DeviceSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Set();
  }

  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      this.clients.add(server);
      server.addEventListener('close', () => this.clients.delete(server));
      server.addEventListener('error', () => this.clients.delete(server));
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname === '/notify') {
      const payload = await req.text();
      for (const ws of this.clients) {
        try { ws.send(payload); } catch { this.clients.delete(ws); }
      }
      return new Response('ok');
    }

    return new Response('not found', { status: 404 });
  }
}
