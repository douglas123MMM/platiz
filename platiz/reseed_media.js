const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');

const channels = [
  { title: 'Big Buck Bunny (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', genre: 'Animación', type: 'movie', img: '' },
  { title: 'Sintel (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', genre: 'Animación', type: 'movie', img: '' },
  { title: 'Elephants Dream (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', genre: 'Animación', type: 'movie', img: '' },
  { title: 'Tears of Steel (HD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', genre: 'Ciencia Ficción', type: 'movie', img: '' },
  { title: 'For Bigger Blazes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', genre: 'Comedia', type: 'movie', img: '' },
  { title: 'For Bigger Escapes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', genre: 'Comedia', type: 'movie', img: '' },
  { title: 'For Bigger Fun', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', genre: 'Comedia', type: 'movie', img: '' },
  { title: 'For Bigger Joyrides', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', genre: 'Comedia', type: 'movie', img: '' },
  { title: 'For Bigger Meltdowns', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', genre: 'Acción', type: 'movie', img: '' },
  { title: 'Subaru Outback Review', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', genre: 'Documentales', type: 'movie', img: '' },
  { title: 'Volkswagen GTI Review', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', genre: 'Documentales', type: 'movie', img: '' },
  { title: 'We Are Going On Bullrun', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', genre: 'Acción', type: 'movie', img: '' },
  { title: 'What Car Can You Get', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', genre: 'Documentales', type: 'movie', img: '' },
  { title: 'NASA TV (Media)', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', genre: 'Ciencia', type: 'live', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg' },
  { title: 'Bloomberg TV', url: 'https://bloomberg-bloomberg-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Noticias', type: 'live', img: '' },
  { title: 'RT en Español', url: 'https://rt-esp.rttv.com/live/rtesp/playlist.m3u8', genre: 'Noticias', type: 'live', img: '' },
  { title: 'Pet Collective TV', url: 'https://petcollective-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', type: 'live', img: '' },
  { title: 'Nature Vision TV', url: 'https://naturevisiontv-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Documentales', type: 'live', img: '' },
  { title: 'Outdoor America TV', url: 'https://outdooramerica-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Deportes', type: 'live', img: '' },
  { title: 'Cheddar News', url: 'https://cheddar-cheddar-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Noticias', type: 'live', img: '' },
];

async function seed() {
  const { data: all } = await supabase.from('media_contents').select('id');
  if (all) await supabase.from('media_contents').delete().in('id', all.map(x => x.id));
  console.log('Limpiado');

  let i = 0;
  for (const ch of channels) {
    const { error } = await supabase.from('media_contents').insert({
      title: ch.title, video_url: ch.url, image_url: ch.img || '',
      category: ch.type === 'live' ? 'TV en Vivo' : 'Películas',
      genre: ch.genre, type: ch.type, active: 1, sort_order: i + 1
    });
    if (error) console.log('ERROR: ' + ch.title);
    else { i++; console.log(i + '. ' + ch.title); }
  }
  console.log('TOTAL: ' + i + ' canales');
  process.exit(0);
}
seed();
