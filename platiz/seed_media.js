const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(data));
    }).on('error', (e) => { console.log('Fetch error:', e.message); resolve(''); });
  });
}

async function seed() {
  console.log('Obteniendo canales IPTV desde repositorios publicos...');

  const channels = [];

  // Canales de TV en vivo - Noticias (fuentes publicas m3u8)
  const newsChannels = [
    { title: 'CNN en Español', video_url: 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Noticias', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN_International_logo.svg' },
    { title: 'France 24 Español', video_url: 'https://f24hls-i.akamaihd.net/hls/live/221192/F24_ES_LO_HLS/master.m3u8', genre: 'Noticias', img: 'https://upload.wikimedia.org/wikipedia/commons/6/65/FRANCE_24_logo.svg' },
    { title: 'Euronews Español', video_url: 'https://rakuten-euronews-3-es.samsung.wurl.tv/playlist.m3u8', genre: 'Noticias', img: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Euronews_2022.svg' },
    { title: 'RT Español', video_url: 'https://rt-esp.rttv.com/live/rtesp/playlist.m3u8', genre: 'Noticias', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Russia-today-logo.svg' },
    { title: 'DW Español', video_url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dw102/index.m3u8', genre: 'Noticias', img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Deutsche_Welle_symbol_2012.svg' },
    { title: 'Canal 26 Argentina', video_url: 'https://live.canal26.com/hls/stream.m3u8', genre: 'Noticias', img: 'https://i.imgur.com/cL6UZwz.png' },
    { title: 'MILENIO TV', video_url: 'https://d1ygn0qmqn5cem.cloudfront.net/out/v1/9b4e6493b3e14bb48e56f2ebcb9b0c62/index.m3u8', genre: 'Noticias', img: 'https://i.imgur.com/HLZSwMd.png' },
    { title: 'ADN 40 MX', video_url: 'https://mdstrm.com/live-stream-playlist/60b578b06079417eb4b05764.m3u8', genre: 'Noticias', img: 'https://i.imgur.com/sFqBKLX.png' },
  ];

  const sportsChannels = [
    { title: 'F1 TV Pro', video_url: 'https://f1tv-cdn.formula1.com/hls/live/1000000/index.m3u8', genre: 'Deportes', img: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg' },
    { title: 'MotoGP Live', video_url: 'https://motogp-live.motogp.com/hls/live/1000/index.m3u8', genre: 'Deportes', img: 'https://i.imgur.com/motogp.png' },
    { title: 'Red Bull TV', video_url: 'https://rbtv01.sfl.cdn.redbull.com/hls/playlist.m3u8', genre: 'Deportes', img: 'https://i.imgur.com/redbulltv.png' },
    { title: 'ESPN Deportes', video_url: 'https://espn-deportes-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Deportes', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg' },
    { title: 'Fight Sports', video_url: 'https://fightsports-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Deportes', img: 'https://i.imgur.com/fightsports.png' },
  ];

  const entertainmentChannels = [
    { title: 'MTV Europe', video_url: 'https://mtveu-lh.akamaihd.net/i/mtveu_1@347024/master.m3u8', genre: 'Entretenimiento', img: 'https://upload.wikimedia.org/wikipedia/commons/9/94/MTV_Logo_2010.svg' },
    { title: 'Fashion TV', video_url: 'https://fash1043.cloudycdn.services/slive/ftv_midnite_secrets_adaptive.smil/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/fashiontv.png' },
    { title: 'Canal Cocina', video_url: 'https://canalcocina-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/canalcocina.png' },
    { title: 'VIAJAR TV', video_url: 'https://viajar-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/viajartv.png' },
    { title: 'Tastemade Español', video_url: 'https://tastemadees-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/tastemade.png' },
    { title: 'Fuel TV', video_url: 'https://fueltv-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/fueltv.png' },
    { title: 'Bon Appetit TV', video_url: 'https://bonappetit-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Entretenimiento', img: 'https://i.imgur.com/bonappetit.png' },
  ];

  const cultureChannels = [
    { title: 'NASA TV Public', video_url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', genre: 'Cultura', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg' },
    { title: 'Arte Español', video_url: 'https://arteespanol-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Cultura', img: 'https://i.imgur.com/arte.png' },
    { title: 'Museum TV', video_url: 'https://museumtv-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Cultura', img: 'https://i.imgur.com/museumtv.png' },
    { title: 'Qwest TV (Jazz)', video_url: 'https://qwesttv-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Cultura', img: 'https://i.imgur.com/qwesttv.png' },
    { title: 'Clubbing TV', video_url: 'https://clubbingtv-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Cultura', img: 'https://i.imgur.com/clubbingtv.png' },
  ];

  const kidsChannels = [
    { title: 'Baby TV Español', video_url: 'https://babytv-es-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Infantil', img: 'https://i.imgur.com/babytv.png' },
    { title: 'Toon Goggles', video_url: 'https://toongoggles-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Infantil', img: 'https://i.imgur.com/toongoggles.png' },
    { title: 'Cartoon Power', video_url: 'https://cartoonpower-1-eu.rakuten.wurl.tv/playlist.m3u8', genre: 'Infantil', img: 'https://i.imgur.com/cartoonpower.png' },
  ];

  const movieChannels = [
    { title: 'Big Buck Bunny (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', genre: 'Acción/Aventura', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg' },
    { title: 'Sintel (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', genre: 'Acción/Aventura', img: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Sintel_poster.jpg' },
    { title: 'Elephants Dream (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', genre: 'Documentales', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Elephants_Dream_poster.jpg' },
    { title: 'Tears of Steel (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', genre: 'Ciencia Ficción', img: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Tears_of_Steel_poster.jpg' },
    { title: 'For Bigger Blazes (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', genre: 'Comedia', img: '' },
    { title: 'Subaru Outback (MP4)', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', genre: 'Documentales', img: '' },
    { title: 'Volkswagen GTI Review', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', genre: 'Documentales', img: '' },
    { title: 'We Are Going On Bullrun', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', genre: 'Acción/Aventura', img: '' },
  ];

  channels.push(...newsChannels.map(c => ({ ...c, category: 'TV en Vivo', type: 'live' })));
  channels.push(...sportsChannels.map(c => ({ ...c, category: 'TV en Vivo', type: 'live' })));
  channels.push(...entertainmentChannels.map(c => ({ ...c, category: 'TV en Vivo', type: 'live' })));
  channels.push(...cultureChannels.map(c => ({ ...c, category: 'TV en Vivo', type: 'live' })));
  channels.push(...kidsChannels.map(c => ({ ...c, category: 'TV en Vivo', type: 'live' })));
  channels.push(...movieChannels.map(c => ({ ...c, category: 'Películas', type: 'movie' })));

  console.log('Insertando ' + channels.length + ' canales...');
  let i = 0;
  for (const ch of channels) {
    const { error } = await supabase.from('media_contents').insert({
      title: ch.title, video_url: ch.video_url, image_url: ch.img,
      category: ch.category, genre: ch.genre, type: ch.type,
      active: 1, sort_order: i + 1,
    });
    if (error) {
      console.log('  ERROR ' + ch.title + ': ' + error.message.substring(0, 80));
    } else {
      i++;
      if (i % 10 === 0) console.log('  ' + i + '/' + channels.length + ' OK');
    }
  }
  console.log('\nINSERTADOS: ' + i + ' canales y peliculas!');
  process.exit(0);
}

seed();
