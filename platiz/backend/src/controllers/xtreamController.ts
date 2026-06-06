import { Response, Request } from 'express';

// Proxy para Xtream Codes API - evita CORS
export async function xtreamProxy(req: Request, res: Response): Promise<void> {
  try {
    const { server, username, password, action } = req.query;
    if (!server || !username || !password) {
      res.status(400).json({ error: 'server, username, password required' });
      return;
    }
    const base = String(server).replace(/\/+$/, '');
    const url = `${base}/player_api.php?username=${username}&password=${password}&action=${action || 'get_live_streams'}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await r.json();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Proxy para streams de video (Live/VOD/Series)
export async function xtreamStream(req: Request, res: Response): Promise<void> {
  try {
    const { server, username, password, stream, type } = req.query;
    if (!server || !username || !password || !stream) {
      res.status(400).send('Missing params');
      return;
    }
    const base = String(server).replace(/\/+$/, '');
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
