require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const links = {
  'GB MOD WhatsApp': 'https://gbwhatsapp.malavida.com/android/descargar',
  'Adobe Lightroom Premium': 'https://www.mediafire.com/file/w07ivr3r0bw9lkp',
  'Cinepolis Premium': 'https://apkgstore.com/cinepolis-premium-apk-para-android/',
  'Zedge Premium': 'https://getmodsapk.com/zedge-wallpapers-ringtones-mod-apk/',
  'Lumini Pro': 'https://espacioapk.com/lumii-pro-apk/download/',
  'Photoroom Premium': 'https://www.mediafire.com/file/4q4vyhn56ea8gzw',
  'Sticker.ly Premium': 'https://www.mediafire.com/file/dsvnc1abowmmhf7',
  'Filmora Premium': 'https://filmora-mod.latestmodapks.com/download/',
  'MangaToon Premium': 'https://www.mediafire.com/file/ysbvo6exkm48gbl',
  'SnapTube Premium': 'https://www.snaptubear.com/snaptube-premium/',
  'DamonPS2 Pro': 'https://www.mediafire.com/file/nukpllrojlp7547',
  'TikTok Plus 18': 'https://luzgamer.com/tiktok-18-plus-apk/',
  'WebComics Premium': 'https://drive.google.com/drive/folders/1wZhs4NoRX74-V1F2fJmXjfsAEuX5Rstj',
  'DramaBox Premium': 'https://victorraulrr.info/dramabox-premium-apk/download/',
  'VPN Hola Gratis': 'https://www.malavida.com/es/soft/hola-internet-accelerator/android/descargar',
  'Photoshop Mobile': 'https://www.malavida.com/es/soft/photoshop/android/descargar',
  'WPS Office Premium': 'https://drive.google.com/file/d/1_Eg505HSB4gYQf5sghcgEqehXV-cVd5M/view',
  'AZ Screen Recorder': 'https://drive.google.com/file/d/1fft2bmEkHxlZhLAQ6LZfakP9fwNkFq3u/view',
  'FX Player Premium': 'https://drive.google.com/file/d/1lS4zhchOJen0oH0Yh_SLN4Y4xr8MbJxZ/view',
  'iLovePDF Premium': 'https://www.mediafire.com/file/l8p1q1kaox4iwm1',
  'TrueCaller Premium': 'https://drive.google.com/file/d/1AjxN8uCTWH88TNhG8C3FHpH33-Tf15ar/view',
  'PicsArt Gold': 'https://drive.google.com/file/d/1X5vkNuL3_f-Ne7Z4iFZ6BIORWn97tiv3/view',
  'YouTube ReVanced': 'https://drive.google.com/file/d/1CXN6ayaPRzQ2YmBz09NiNXbY00Ojt4aF/view',
  'VivaCut Pro': 'https://drive.google.com/file/d/13jDEQxosF89xlkPtw8lNirrqX1OKlScS/view',
  'Spotify Premium APK': 'https://spotify-premium-apk.apknexa.com/',
  'MAGIS TV': 'https://magistv.icu/es/descargar10/',
  'Walli 4K Premium': 'https://drive.google.com/file/d/1-jW6F5z1CNjAErlcsg_J9Kn8xa7tpqb3/view',
  'Rave Premium': 'https://drive.google.com/file/d/1PPvCayDLMVGXa6WXDRkn3GfOz9Dax5fm/view',
  'DeepSeek AI': 'https://deepseek-ai-assistant.uptodown.com/android/descargar',
};

async function go() {
  const { data: apps } = await supabase.from('items').select('id,title').eq('category_slug', 'apps');
  let u = 0;
  for (const a of apps) {
    const link = links[a.title];
    if (link) { await supabase.from('items').update({ link }).eq('id', a.id); u++; }
  }
  console.log(u + ' APPS actualizadas con enlace');
  process.exit(0);
}
go();
