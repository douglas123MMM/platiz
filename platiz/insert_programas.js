const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');

const logos = {
  'winrar': 'https://i.imgur.com/winrar.png',
  'anydesk': 'https://i.imgur.com/anydesk.png',
  'quickbooks': 'https://i.imgur.com/quickbooks.png',
  'memu': 'https://i.imgur.com/memu.png',
  'office': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'office24': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'office2019': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'office2016': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'publisher': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'office2007': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'windows': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_logo_%282012%29.svg',
  'powerbi': 'https://i.imgur.com/powerbi.png',
  'wps': 'https://i.imgur.com/wpsoffice.png',
  'office13': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'activator': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_logo_%282012%29.svg',
  'photoshop': 'https://i.imgur.com/photoshop.png',
  'beta': 'https://i.imgur.com/photoshop.png',
  'acrobat': 'https://i.imgur.com/acrobat.png',
  'illustrator': 'https://i.imgur.com/illustrator.png',
  'premiere': 'https://i.imgur.com/premiere.png',
  'rush': 'https://i.imgur.com/premiere.png',
  'indesign': 'https://i.imgur.com/indesign.png',
  'lightroom': 'https://i.imgur.com/lightroom.png',
  'substance': 'https://i.imgur.com/substance.png',
  'dimension': 'https://i.imgur.com/dimension.png',
  'after': 'https://i.imgur.com/aftereffects.png',
  'modeler': 'https://i.imgur.com/substance.png',
  'prelude': 'https://i.imgur.com/premiere.png',
  'painter': 'https://i.imgur.com/substance.png',
  'audition': 'https://i.imgur.com/audition.png',
  'bridge': 'https://i.imgur.com/bridge.png',
  'fresco': 'https://i.imgur.com/fresco.png',
  'character': 'https://i.imgur.com/characteranimator.png',
  'speech': 'https://i.imgur.com/premiere.png',
  'animate': 'https://i.imgur.com/animate.png',
  'elements': 'https://i.imgur.com/photoshop.png',
  'xd': 'https://i.imgur.com/adobexd.png',
  'encoder': 'https://i.imgur.com/mediaencoder.png',
  'suite': 'https://i.imgur.com/substance.png',
  'dng': 'https://i.imgur.com/photoshop.png',
  'dreamweaver': 'https://i.imgur.com/dreamweaver.png',
  'firefly': 'https://i.imgur.com/photoshop.png',
  'stager': 'https://i.imgur.com/substance.png',
  'reader': 'https://i.imgur.com/acrobat.png',
  'muse': 'https://i.imgur.com/muse.png',
  '2020': 'https://i.imgur.com/adobecc.png',
  '2022': 'https://i.imgur.com/adobecc.png',
  '2023': 'https://i.imgur.com/adobecc.png',
  'idm': 'https://i.imgur.com/idm.png',
  'youtube': 'https://i.imgur.com/4kdownloader.png',
  '4k': 'https://i.imgur.com/4kdownloader.png',
  'illustrator2025': 'https://i.imgur.com/illustrator.png',
  'photoshop2025': 'https://i.imgur.com/photoshop.png',
  'after2025': 'https://i.imgur.com/aftereffects.png',
  'nitro': 'https://i.imgur.com/nitro.png',
  'wondershare': 'https://i.imgur.com/wondershare.png',
};

// Fallback: use generic icon with text
const getImg = (name) => {
  const n = name.toLowerCase();
  if (n.includes('winrar')) return logos.winrar;
  if (n.includes('anydesk')) return logos.anydesk;
  if (n.includes('quickbook')) return logos.quickbooks;
  if (n.includes('memu')) return logos.memu;
  if (n.includes('office 365')) return logos.office;
  if (n.includes('office 24')) return logos.office24;
  if (n.includes('office 2019')) return logos.office2019;
  if (n.includes('office 2016')) return logos.office2016;
  if (n.includes('publisher')) return logos.publisher;
  if (n.includes('office 2007')) return logos.office2007;
  if (n.includes('windows 11')) return logos.windows;
  if (n.includes('windows 10')) return logos.windows;
  if (n.includes('window 7')) return logos.windows;
  if (n.includes('power bi')) return logos.powerbi;
  if (n.includes('wps office')) return logos.wps;
  if (n.includes('office 2013')) return logos.office13;
  if (n.includes('product activator') || n.includes('all product')) return logos.activator;
  if (n.includes('photoshop')) return logos.photoshop;
  if (n.includes('acrobat')) return logos.acrobat;
  if (n.includes('illustrator')) return logos.illustrator;
  if (n.includes('premiere pro') || n.includes('premiere 2024')) return logos.premiere;
  if (n.includes('rush')) return logos.rush;
  if (n.includes('indesign')) return logos.indesign;
  if (n.includes('lightroom')) return logos.lightroom;
  if (n.includes('substance') && n.includes('designer')) return logos.substance;
  if (n.includes('dimension')) return logos.dimension;
  if (n.includes('after effect')) return logos.after;
  if (n.includes('modeler')) return logos.modeler;
  if (n.includes('prelude')) return logos.prelude;
  if (n.includes('painter')) return logos.painter;
  if (n.includes('audition')) return logos.audition;
  if (n.includes('bridge')) return logos.bridge;
  if (n.includes('fresco')) return logos.fresco;
  if (n.includes('character')) return logos.character;
  if (n.includes('speech')) return logos.speech;
  if (n.includes('animate')) return logos.animate;
  if (n.includes('elements')) return logos.elements;
  if (n.includes('xd')) return logos.xd;
  if (n.includes('media encoder')) return logos.encoder;
  if (n.includes('substance') && n.includes('suite')) return logos.suite;
  if (n.includes('dng')) return logos.dng;
  if (n.includes('dreamweaver')) return logos.dreamweaver;
  if (n.includes('firefly')) return logos.firefly;
  if (n.includes('stager')) return logos.stager;
  if (n.includes('reader')) return logos.reader;
  if (n.includes('muse')) return logos.muse;
  if (n.includes('complete collection 2020')) return logos['2020'];
  if (n.includes('complete collection 2022')) return logos['2022'];
  if (n.includes('complete collection 2023')) return logos['2023'];
  if (n.includes('idm')) return logos.idm;
  if (n.includes('youtube video download')) return logos.youtube;
  if (n.includes('4k video download')) return logos['4k'];
  if (n.includes('nitro')) return logos.nitro;
  if (n.includes('wondershare') || n.includes('pdfelement')) return logos.wondershare;
  // Default modern icon
  return 'https://i.imgur.com/software.png';
};

const programs = [
  ['WinRAR','https://www.win-rar.com/start.html?&L=0','Software Windows'],
  ['AnyDesk','https://anydesk.uptodown.com/windows/descargar','Software Windows'],
  ['QuickBooks Enterprise 2023','https://downloads.quickbooks.com/app/qbdt/products','Software Windows'],
  ['Memu Emulator Android','https://www.memuplay.com/es/','Software Windows'],
  ['Office 365 Pro Plus','https://drive.google.com/drive/folders/1P4NggsgIpRgBZ9qNJzTQyG4VBvOjaaNJ','Microsoft'],
  ['Microsoft Office 2024','https://www.mediafire.com/file/14syr4hat9myzlx','Microsoft'],
  ['Microsoft Office 2019 Pro Plus','https://drive.google.com/drive/folders/1sPNDcM3cSVGFextsYcd2QFWL4UBaz8Pb','Microsoft'],
  ['Microsoft Office 2016','https://drive.google.com/file/d/1-f4lqX1nJreTXjr-zE9xcqEwvXOmp6OF/view','Microsoft'],
  ['MS Publisher 2016','https://drive.google.com/file/d/1svtlFTYCABoSKdqVEpcBe7V9OVHXYOEA/view','Microsoft'],
  ['Microsoft Office 2007','https://drive.google.com/drive/folders/1S7DEL7sR2Zt3kQ5JRm3K7ZvIvEUarlas','Microsoft'],
  ['Windows 11 AIO 16in1','https://msdl.gravesoft.dev/#3113','Microsoft'],
  ['Windows 10 22H2 AIO 15in1','https://drive.google.com/drive/folders/1OuWnkZFNpYu1i1TjEkuldWc8ccspwUSK','Microsoft'],
  ['Windows 7 Ultimate 2024','https://www.mediafire.com/file/ngiwfz8m2qyh2rk','Microsoft'],
  ['Power BI con Activacion','https://drive.google.com/drive/folders/1SiOI0u5cDb5rvcRmtyZhQiunPKp3935b','Microsoft'],
  ['WPS Office PC','https://drive.google.com/drive/folders/1WPrpE0XFNQIPNTAOM9FMi9uArA40bwCt','Microsoft'],
  ['Office 2013-2024 + Activacion','https://youtu.be/Tr3c80qfDyI','Microsoft'],
  ['Microsoft Activator Universal','https://drive.google.com/drive/folders/1Bze1IlNCi3b-M-hH9ouNcJmoGK3FDyFv','Microsoft'],
  ['Adobe Photoshop 2024','https://drive.google.com/drive/folders/17c-Lhyu30ggz4hvLPOndegirssr7PMXL','Adobe'],
  ['Photoshop Beta','https://drive.google.com/file/d/1_H3_nuOUVoKl0bbrT4B-TZIPsUsfAsqn/view','Adobe'],
  ['Adobe Acrobat Pro DC 2024','https://www.mediafire.com/file/vmlyp08obshvimb','Adobe'],
  ['Adobe Illustrator 2024','https://drive.google.com/drive/folders/1NteKDjzMfSkMwRH6BDKmI3W0q3u4UzZz','Adobe'],
  ['Adobe Premiere Pro 2024','https://www.mediafire.com/file/h4bepwmu4tzs9ie','Adobe'],
  ['Adobe Premiere Rush','https://drive.google.com/drive/folders/1_AWrgbW3IH_IirZUz7AMX4L8oOMwfQi-','Adobe'],
  ['Adobe InDesign 2024','https://drive.google.com/drive/folders/1NIWaEOjQlQ3u0ZqqmBvxFvPvqelivEwD','Adobe'],
  ['Adobe Lightroom 6.5','https://drive.google.com/drive/folders/1MqS1Wk0AS5-I4BkCxg1wCIFAE6WKpT0h','Adobe'],
  ['Adobe Lightroom Classic 2023','https://drive.google.com/drive/folders/15QG7mbCVPeNdFD1EMrUreQr94vsg2_4C','Adobe'],
  ['Substance 3D Designer','https://www.mediafire.com/file/dk9j6s66yzy4q41','Adobe'],
  ['Adobe Dimension 3.4.11','https://www.mediafire.com/file/655ezi5nmxjj2tt','Adobe'],
  ['Adobe After Effects 2024','https://drive.google.com/drive/folders/1hnx8JBadfRBq7TpFGMBmHTjPxD-IoDis','Adobe'],
  ['Substance 3D Modeler','https://www.mediafire.com/file/ifba39q9wwtefg7','Adobe'],
  ['Adobe Prelude 2022','https://www.mediafire.com/file/swxz4u0vtyc0pk7','Adobe'],
  ['Substance 3D Painter','https://www.mediafire.com/file/qw58u68p86ico3o','Adobe'],
  ['Adobe Audition 2024','https://www.mediafire.com/file/6kq42l353hxvjk4','Adobe'],
  ['Adobe Bridge 2024','https://drive.google.com/file/d/1Zu8tSy0Hc9R1pNSXq3vtwtL2yJR6QhCy/view','Adobe'],
  ['Adobe Fresco','https://drive.google.com/drive/folders/1g8zkjYbiasggVdsi-E08C3iiOIar1ZZN','Adobe'],
  ['Character Animator 2024','https://drive.google.com/drive/folders/1WeDUySZ6TTGyHyZSkNYkXd6FsR2RSSvR','Adobe'],
  ['Adobe Speech to Text v12','https://www.mediafire.com/file/nb50hjr3huf1ysx','Adobe'],
  ['Adobe Animate 2024','https://drive.google.com/drive/folders/1UIBOHloRFaVSiKLXReQNTaJbNMGY_8f2','Adobe'],
  ['Photoshop Elements 2024','https://www.mediafire.com/file/h23sqhgz4c997jl','Adobe'],
  ['Adobe XD 57.1','https://drive.google.com/drive/folders/1-6-j_JKPQdilC9Cmr3_7IuvwajWNu9Kw','Adobe'],
  ['Adobe Media Encoder 2024','https://drive.google.com/drive/folders/1bVSLwRf-vVQKNLdnE8u3AfLiGPiSXqCu','Adobe'],
  ['Substance Suite 2023','https://www.mediafire.com/file/c3zdrc12w8c2jt6','Adobe'],
  ['Adobe DNG Converter 16.2','https://www.mediafire.com/file/zq3v12asuwkjhn4','Adobe'],
  ['Adobe Dreamweaver 2021','https://www.mediafire.com/file/aljfa87vj6cpq7j','Adobe'],
  ['Firefly AI para Photoshop','https://www.mediafire.com/file/w9ppy3lis5grej3','Adobe'],
  ['Adobe Reader XI 11','https://www.mediafire.com/file/evbzrvgb8jusdk1','Adobe'],
  ['Adobe Muse CC 2018','https://drive.google.com/drive/folders/1bgVjFQ-U2ZT24yK3ZuGOd-XgbIirCklK','Adobe'],
  ['Adobe Collection 2020','https://drive.google.com/drive/folders/1b6PkEUFKyu7216GIxvcVIt7gFARBkJGb','Adobe'],
  ['Adobe Collection 2022','https://drive.google.com/drive/folders/1kgCGW7ssQAXc7QuKQAyoQJ36Y3sbfwed','Adobe'],
  ['Adobe Collection 2023','https://drive.google.com/drive/folders/1Kgbjk4syDVqaDZN1pGXoGdcnganBCcyG','Adobe'],
  ['IDM Downloader','https://www.youtube.com/watch?v=A3xbFVKhjsI','Gestores Descarga'],
  ['4K Video Downloader','https://drive.google.com/drive/folders/10WCokX7ElocGPmKZMJrRJKkp3jnl4KsV','Gestores Descarga'],
  ['Adobe Illustrator 2025','https://www.mediafire.com/file/ha4utjlg9jz5zme','Adobe Suite'],
  ['Adobe Photoshop 2025','https://www.mediafire.com/file/63pp93unbozjkjc','Adobe Suite'],
  ['After Effects 2025','https://www.mediafire.com/file/bqhd7iqg1fffkvn','Adobe Suite'],
  ['Nitro PDF Editor Pro','https://drive.google.com/drive/folders/1MugbwV2NJ6zV_H4ljQVCxhx-qwA7vQhk','Editores PDF'],
  ['Wondershare PDFelement Pro','https://drive.google.com/drive/folders/1HcLk2sTqYrnYAOjD3sAWxQG6xJ2gH_op','Editores PDF'],
];

async function insert() {
  let count = 0;
  for (let i = 0; i < programs.length; i++) {
    const [name, link, cat] = programs[i];
    const img = getImg(name);
    const { error } = await supabase.from('items').insert({
      category_slug: 'programas', title: name, description: 'COLECCIÓN DE PROGRAMAS - ' + cat, image_url: img, link: link, sort_order: i + 1
    });
    if (!error) { count++; console.log(count + '. ' + name); }
    else console.log('ERR: ' + name.substring(0,30) + ' - ' + error.message.substring(0,80));
  }
  console.log('\n' + count + ' PROGRAMAS insertados!');
  process.exit(0);
}
insert();
