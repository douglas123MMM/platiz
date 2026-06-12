import { Response, Request } from 'express';

const INTERNAL_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
];

function isInternalHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') {
    return true;
  }
  return INTERNAL_IP_PATTERNS.some(p => p.test(hostname));
}

function validateServerUrl(serverUrl: string): URL | null {
  try {
    let urlString = serverUrl;
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = 'http://' + urlString;
    }
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    // Block internal/private IPs and localhost
    if (isInternalHost(hostname)) {
      return null;
    }

    // Block raw IPv4 addresses
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

// WARNING: Credentials (username, password) are sent as query parameters.
// Prefer using Basic Auth (base64) or POST body when the upstream API supports it.
export async function xtreamProxy(req: Request, res: Response): Promise<void> {
  try {
    const { server, username, password, action } = req.query;
    if (!server || !username || !password) {
      res.status(400).json({ error: 'server, username, password required' });
      return;
    }

    const validServer = validateServerUrl(String(server));
    if (!validServer) {
      res.status(403).json({ error: 'Invalid or internal server URL' });
      return;
    }

    const base = validServer.origin;
    const url = `${base}/player_api.php?username=${username}&password=${password}&action=${action || 'get_live_streams'}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await r.json();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// WARNING: Credentials (username, password) are sent in the URL path.
// Prefer using Basic Auth (base64) or POST body when the upstream API supports it.
export async function xtreamStream(req: Request, res: Response): Promise<void> {
  try {
    const { server, username, password, stream, type } = req.query;
    if (!server || !username || !password || !stream) {
      res.status(400).send('Missing params');
      return;
    }

    const validServer = validateServerUrl(String(server));
    if (!validServer) {
      res.status(403).send('Invalid or internal server URL');
      return;
    }

    const base = validServer.origin;
    let url = '';
    if (type === 'vod') url = `${base}/movie/${username}/${password}/${stream}.m3u8`;
    else if (type === 'series') url = `${base}/series/${username}/${password}/${stream}.m3u8`;
    else url = `${base}/live/${username}/${password}/${stream}.m3u8`;

    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'video/mp2t');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buf));
  } catch (e: any) {
    res.status(500).send(e.message);
  }
}
