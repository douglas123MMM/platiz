import { Response, Request } from 'express';

// Proxy de video: convierte enlace de Google Drive en stream directo
export async function streamVideo(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).send('Missing url');
      return;
    }

    // Extraer ID de Google Drive
    let videoUrl = '';
    if (url.includes('drive.google.com/file/d/')) {
      const id = url.match(/\/d\/([^/]+)/)?.[1];
      videoUrl = id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
    } else if (url.includes('drive.google.com/open?id=')) {
      const id = url.split('id=')[1]?.split('&')[0];
      videoUrl = id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
    } else {
      // Redirigir directamente otros URLs
      res.redirect(url);
      return;
    }

    // Intentar descargar el video de Google Drive y hacer stream
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      res.status(502).send('No se pudo acceder al video. Asegurate de que el archivo este publico en Google Drive.');
      return;
    }

    // Verificar si Google Drive pide confirmación (archivos grandes)
    const contentDisposition = response.headers.get('content-disposition') || '';
    if (!contentDisposition.includes('attachment') && !contentDisposition.includes('filename')) {
      // Google Drive está mostrando página de confirmación, no el video
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

    // Stream directo
    res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buf = await response.arrayBuffer();
    res.send(Buffer.from(buf));

  } catch (e: any) {
    res.status(500).send(e.message || 'Error de streaming');
  }
}
