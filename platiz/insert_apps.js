require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const apps = [
  ['GB MOD WhatsApp','1t_IzySuXSSGh0PT-gMenEHVFnAWLzKy_'],
  ['Adobe Lightroom Premium','1Meo95lGO_D9m1_wz1y3HtuX1f2Hq2vMh'],
  ['Cinepolis Premium','1QeBtCdSXIO3bA7FMNLcakVS01t6Rc4KU'],
  ['Zedge Premium','1uytLcT4xq3QrYlKS73eRWEoWi5mOXF4Q'],
  ['Lumini Pro','1XFrml-ZWb6bWSEE59yxGvXGY9hbc2yw5'],
  ['Photoroom Premium','11xNUqeJE10OZu1gcdoggCk-d_pedVVYx'],
  ['Sticker.ly Premium','1qKySf1Xm0cPq-tTryzQHieG4LTzAyYav'],
  ['Filmora Premium','1YhdW_JEKPl-Lj0oEdMpuZvssMQQqU3mT'],
  ['MangaToon Premium','1ug5rllBzqKm9XiLIZ-m9IOd08A_Z32fD'],
  ['SnapTube Premium','1v-Dwt8VhIVaT0ndYRmfHqA5lFTOzKinn'],
  ['DamonPS2 Pro','1-kg42hfs9kMHvJwVfMiF6cUgNW_ZwI-9'],
  ['TikTok Plus 18','1X34NFMxR9LcNauD1I4ZffXNJSCT8wwIr'],
  ['WebComics Premium','1FMQnxbK6hZmbzqaIAvlIaVKMM0hCjS8i'],
  ['DramaBox Premium','1uJs5i6ZJLSaSsKQ1KSWz50IyxkmHTSrh'],
  ['VPN Hola Gratis','1AGjqGrkX8YkHK53Qd3HWt4qBCxT9fsYI'],
  ['Photoshop Mobile','1uREz-rhAGiYUOQ_yYBu429UYgcqTJ3XT'],
  ['WPS Office Premium','1CxAU8HXm6gyde8k3fi9p4Wo55zPlhy2B'],
  ['AZ Screen Recorder','1zMWqAvknF69594nAg2Ry5etkHwbSD6Yf'],
  ['FX Player Premium','1R-LrvJq7peyjiBdZ_H27SW7zC8IKDIFd'],
  ['iLovePDF Premium','1kmrwhdwO-DXZK9Fxta6rp5puZWv_20Ky'],
  ['TrueCaller Premium','10w-y6pgm61ElGhZtzIvAstog_0A75iE-'],
  ['PicsArt Gold','1atORQ9yJRmGMyYlvjXiW5lsKtXJZS-DR'],
  ['YouTube ReVanced','1mP_lAfe4qPlRaJkmcK8leizmDfLcJb7U'],
  ['VivaCut Pro','1YqMoi3O0F880R2d5ACgZEvWOqgiNlWjj'],
  ['Spotify Premium APK','17uv6oZVcvv60Hx3-_Bz1NgIF3dKq-5rV'],
  ['MAGIS TV','1OSy8mnVGwASYQ5Ots2RjfpwZcKuVHImz'],
  ['Walli 4K Premium','1bfpkub1yBQuyWjxu3BMjI3ZSAnpm55O2'],
  ['Rave Premium','1NcxevvR4F9lEL-NQceofdGTNnl-iHqER'],
  ['DeepSeek AI','1RgU_qEYa9lFaSbzs9yCBfFCFn1XHtLN6'],
];

async function insert() {
  let count = 0;
  for (let i = 0; i < apps.length; i++) {
    const [name, imgId] = apps[i];
    const img = 'https://wsrv.nl/?url=' + encodeURIComponent('https://drive.google.com/thumbnail?id=' + imgId + '&sz=w400') + '&output=webp&w=400&q=75';
    const { error } = await supabase.from('items').insert({
      category_slug: 'apps', title: name, description: 'APPS PREMIUM', image_url: img, link: '', sort_order: i + 1
    });
    if (!error) { count++; console.log(count + '. ' + name); }
    else console.log('ERR: ' + name.substring(0,30));
  }
  console.log('\n' + count + ' APPS insertadas en la categoria aplicaciones!');
  process.exit(0);
}
insert();
