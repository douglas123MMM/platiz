import { useState, useEffect } from 'react';
import { HiExclamation } from 'react-icons/hi';

interface MediaPlayerProps {
  videoUrl: string;
  videoType?: string;
  title?: string;
  thumbnail?: string;
  className?: string;
  autoPlay?: boolean;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getTwitchChannel(url: string): string | null {
  const m = url.match(/twitch\.tv\/([^/]+)/);
  return m ? m[1] : null;
}

function getGoogleDriveId(url: string): string | null {
  const m = url.match(/\/d\/([^/]+)/);
  return m ? m[1] : null;
}

function detectType(url: string): string {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (getYouTubeId(u)) return 'youtube';
  if (getVimeoId(u)) return 'vimeo';
  if (getTwitchChannel(u)) return 'twitch';
  if (getGoogleDriveId(u)) return 'gdrive';
  if (u.endsWith('.m3u8') || u.includes('.m3u8')) return 'm3u8';
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.mkv') || u.includes('supabase.co/storage/v1/object/')) return 'direct';
  return 'iframe';
}

export default function MediaPlayer({ videoUrl, videoType, title, thumbnail, className = '', autoPlay = false }: MediaPlayerProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const type = videoType || detectType(videoUrl);

  useEffect(() => { setError(false); setLoaded(false); }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 p-12 ${className}`}>
        <div className="text-center">
          <HiExclamation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hay enlace de video disponible</p>
        </div>
      </div>
    );
  }

  const onError = () => setError(true);
  const onLoad = () => setLoaded(true);

  const containerClasses = `relative w-full overflow-hidden rounded-2xl bg-black ${!loaded ? 'animate-pulse' : ''} ${className}`;

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 p-12 ${className}`}>
        <div className="text-center">
          <HiExclamation className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-1">Error al cargar el video</p>
          <p className="text-gray-500 text-sm">El enlace no es válido o no permite reproducción embebida.</p>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[#E5C158] hover:text-[#F0D78C] text-sm font-medium">Abrir enlace externo</a>
        </div>
      </div>
    );
  }

  if (type === 'youtube') {
    const ytId = getYouTubeId(videoUrl);
    if (!ytId) {
      return (
        <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 ${className}`} style={{ minHeight: 360 }}>
          <div className="text-center p-8">
            <HiExclamation className="w-12 h-12 text-yellow-500/60 mx-auto mb-4" />
            <p className="text-gray-400">URL de YouTube no válida</p>
          </div>
        </div>
      );
    }
    const ytSrc = `https://www.youtube.com/embed/${ytId}${autoPlay ? '?autoplay=1' : ''}`;
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <iframe src={ytSrc} title={title || 'YouTube video'} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen onError={onError} onLoad={onLoad} />
      </div>
    );
  }

  if (type === 'vimeo') {
    const vId = getVimeoId(videoUrl);
    if (!vId) {
      return (
        <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 ${className}`} style={{ minHeight: 360 }}>
          <p className="text-gray-400">URL de Vimeo no válida</p>
        </div>
      );
    }
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <iframe src={`https://player.vimeo.com/video/${vId}${autoPlay ? '?autoplay=1' : ''}`} title={title || 'Vimeo video'} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen onError={onError} onLoad={onLoad} />
      </div>
    );
  }

  if (type === 'twitch') {
    const channel = getTwitchChannel(videoUrl);
    if (!channel) {
      return (
        <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 ${className}`} style={{ minHeight: 360 }}>
          <p className="text-gray-400">URL de Twitch no válida</p>
        </div>
      );
    }
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <iframe src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}${autoPlay ? '&autoplay=true' : ''}`} title={title || 'Twitch stream'} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen onError={onError} onLoad={onLoad} />
      </div>
    );
  }

  if (type === 'gdrive') {
    const gdId = getGoogleDriveId(videoUrl);
    if (!gdId) {
      return (
        <div className={`flex items-center justify-center bg-[#0a0a0f] rounded-2xl border border-[#E5C158]/10 ${className}`} style={{ minHeight: 360 }}>
          <p className="text-gray-400">URL de Google Drive no válida</p>
        </div>
      );
    }
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <iframe src={`https://drive.google.com/file/d/${gdId}/preview`} title={title || 'Google Drive video'} className="absolute inset-0 w-full h-full" allow="autoplay" allowFullScreen onError={onError} onLoad={onLoad} />
      </div>
    );
  }

  if (type === 'm3u8') {
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <video className="absolute inset-0 w-full h-full" controls autoPlay={autoPlay} playsInline onError={onError} onLoadedData={onLoad}>
          <source src={videoUrl} type="application/x-mpegURL" />
          Tu navegador no soporta la reproduccion de este formato.
        </video>
      </div>
    );
  }

  // Video directo (MP4, WebM, MOV, Supabase Storage)
  if (type === 'direct') {
    return (
      <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
        {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <video className="absolute inset-0 w-full h-full" controls autoPlay={autoPlay} playsInline onError={onError} onLoadedData={onLoad}>
          <source src={videoUrl} type="video/mp4" />
          <p className="text-gray-400 text-center mt-10">Tu navegador no puede reproducir este video. Prueba con otro navegador o descarga el archivo.</p>
        </video>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={{ aspectRatio: '16/9' }}>
      {!loaded && thumbnail && <img src={thumbnail} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
      <iframe src={videoUrl} title={title || 'Contenido embebido'} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen onError={onError} onLoad={onLoad} sandbox="allow-scripts allow-same-origin allow-presentation" />
    </div>
  );
}

export { detectType, getYouTubeId, getVimeoId, getGoogleDriveId };
