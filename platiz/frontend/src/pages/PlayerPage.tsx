import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import MediaPlayer from '../components/MediaPlayer';
import { HiArrowLeft } from 'react-icons/hi';
import { IconMovies } from '../icons/PremiumIcons';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !type) { setLoading(false); return; }
    setLoading(true);
    const endpoint = type === 'stream' ? `/streams/${id}` : `/content/item/${id}`;
    api.get(endpoint)
      .then((r) => setItem({ ...r.data, itemType: type }))
      .catch(() => {
        if (type === 'item') {
          api.get('/content/items').then((r) => {
            const found = (r.data || []).find((i: any) => i.id === id);
            setItem(found ? { ...found, itemType: type } : null);
          }).catch(() => setItem(null));
        } else {
          setItem(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#E5C158]/30 border-t-[#E5C158] rounded-full animate-spin" />
          <p className="text-gray-500">Cargando reproductor...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <IconMovies className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Contenido no encontrado</h2>
          <p className="text-gray-400 mb-6">El video solicitado no está disponible.</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <HiArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const videoUrl = item.video_url;
  const videoType = item.video_type;
  const title = item.title;
  const description = item.description;
  const thumbnail = item.thumbnail_url || item.image_url;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E5C158] transition-colors text-sm">
        <HiArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <MediaPlayer videoUrl={videoUrl} videoType={videoType} title={title} thumbnail={thumbnail} className="shadow-2xl shadow-[#E5C158]/5" autoPlay />

      <div className="glass rounded-2xl p-6 border border-[#E5C158]/10">
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        {item.platform && (
          <span className="badge badge-gold text-xs mb-3">{item.platform}</span>
        )}
        {description && <p className="text-gray-400 text-sm whitespace-pre-wrap">{description}</p>}
      </div>
    </div>
  );
}
