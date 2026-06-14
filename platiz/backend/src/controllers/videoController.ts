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

function validateGoogleUrl(urlString: string): URL | null {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname !== 'googleapis.com' && !hostname.endsWith('.googleapis.com') &&
      hostname !== 'google.com' && !hostname.endsWith('.google.com')
    ) {
      return null;
    }

    if (isInternalHost(hostname)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

// Valida URLs de Supabase Storage (videos subidos)
function isSupabaseStorageUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.includes('supabase.co') && parsed.pathname.includes('/storage/v1/object/');
  } catch {
    return false;
  }
}

// Valida URLs de video directo (MP4, WebM, etc.)
function isDirectVideoUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (isInternalHost(parsed.hostname)) return false;
    const path = parsed.pathname.toLowerCase();
    return path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mov') || path.endsWith('.mkv');
  } catch {
    return false;
  }
}

export async function streamVideo(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).send('Missing url');
      return;
    }

    // Google Drive
    const validGoogleUrl = validateGoogleUrl(url);
    if (validGoogleUrl) {
      await streamGoogleDrive(validGoogleUrl, url, res);
      return;
    }

    // Supabase Storage o video directo (MP4, WebM, MOV)
    if (isSupabaseStorageUrl(url) || isDirectVideoUrl(url)) {
      await streamDirectVideo(url, res);
      return;
    }

    res.status(403).send('URL not allowed');
  } catch (e: any) {
    res.status(500).send(e.message || 'Error de streaming');
  }
}

async function streamGoogleDrive(validUrl: URL, originalUrl: string, res: Response): Promise<void> {
  let videoUrl = '';
  if (originalUrl.includes('drive.google.com/file/d/')) {
    const id = originalUrl.match(/\/d\/([^/]+)/)?.[1];
    videoUrl = id ? `https://drive.google.com/uc?export=download&id=${id}` : originalUrl;
  } else if (originalUrl.includes('drive.google.com/open?id=')) {
    const id = originalUrl.split('id=')[1]?.split('&')[0];
    videoUrl = id ? `https://drive.google.com/uc?export=download&id=${id}` : originalUrl;
  } else {
    videoUrl = originalUrl;
  }

  const response = await fetch(videoUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    redirect: 'follow',
  });

  if (!response.ok) {
    res.status(502).send('No se pudo acceder al video. Asegurate de que el archivo este publico en Google Drive.');
    return;
  }

  const contentDisposition = response.headers.get('content-disposition') || '';
  if (!contentDisposition.includes('attachment') && !contentDisposition.includes('filename')) {
    const text = await response.text();
    const confirmMatch = text.match(/href="(\/uc\?export=download[^"]+)"/);
    if (confirmMatch) {
      const confirmUrl = 'https://drive.google.com' + confirmMatch[1].replace(/&amp;/g, '&');
      const confirmRes = await fetch(confirmUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (confirmRes.ok) {
        res.setHeader('Content-Type', confirmRes.headers.get('content-type') || 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buf = await confirmRes.arrayBuffer();
        res.send(Buffer.from(buf));
        return;
      }
    }
    res.status(502).send('Google Drive solicito verificacion. El archivo debe ser publico.');
    return;
  }

  res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const buf = await response.arrayBuffer();
  res.send(Buffer.from(buf));
}

async function streamDirectVideo(videoUrl: string, res: Response): Promise<void> {
  const response = await fetch(videoUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  if (!response.ok) {
    res.status(502).send('No se pudo acceder al video');
    return;
  }

  const contentType = response.headers.get('content-type') || 'video/mp4';
  const contentLength = response.headers.get('content-length');

  // Forzar tipo MIME compatible con todos los navegadores
  let forcedType = contentType;
  if (contentType.includes('octet-stream') || contentType.includes('quicktime') || contentType === '') {
    // Inferir del nombre del archivo
    if (videoUrl.toLowerCase().endsWith('.webm')) forcedType = 'video/webm';
    else if (videoUrl.toLowerCase().endsWith('.mov')) forcedType = 'video/mp4';
    else forcedType = 'video/mp4';
  }

  res.setHeader('Content-Type', forcedType);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (contentLength) res.setHeader('Content-Length', contentLength);

  const buf = await response.arrayBuffer();
  res.send(Buffer.from(buf));
}
