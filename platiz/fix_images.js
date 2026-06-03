const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');

// Base Wikipedia URL for raw SVGs
const B = 'https://upload.wikimedia.org/wikipedia/commons/';

const logos = {
  'WinRAR': B + '3/3a/WinRAR_icon.png',
  'AnyDesk': B + 'thumb/3/39/AnyDesk_logo.svg.svg',
  'QuickBooks Enterprise 2023': B + 'thumb/0/0e/Intuit_QuickBooks_logo.svg.svg',
  'Memu Emulator Android': B + 'thumb/d/d7/Android_robot.svg.svg',
  'Office 365 Pro Plus': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Microsoft Office 2024': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Microsoft Office 2019 Pro Plus': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Microsoft Office 2016': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'MS Publisher 2016': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Microsoft Office 2007': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Windows 11 AIO 16in1': B + 'thumb/8/87/Windows_logo_-_2021.svg.svg',
  'Windows 10 22H2 AIO 15in1': B + 'thumb/8/87/Windows_logo_-_2021.svg.svg',
  'Windows 7 Ultimate 2024': B + 'thumb/8/87/Windows_logo_-_2021.svg.svg',
  'Power BI con Activacion': B + 'thumb/c/cf/New_Power_BI_Logo.svg.svg',
  'WPS Office PC': B + 'thumb/d/d9/WPS_Office_2019_logo.svg.svg',
  'Office 2013-2024 + Activacion': B + 'thumb/0/0c/Microsoft_Office_logo_%282018%E2%80%93present%29.svg.svg',
  'Microsoft Activator Universal': B + 'thumb/4/44/Microsoft_logo.svg.svg',
  'Adobe Photoshop 2024': B + 'thumb/a/af/Adobe_Photoshop_CC_icon.svg.svg',
  'Photoshop Beta': B + 'thumb/a/af/Adobe_Photoshop_CC_icon.svg.svg',
  'Adobe Acrobat Pro DC 2024': B + 'thumb/6/6e/Adobe_Acrobat_DC_logo_2020.svg.svg',
  'Adobe Illustrator 2024': B + 'thumb/f/fb/Adobe_Illustrator_CC_icon.svg.svg',
  'Adobe Premiere Pro 2024': B + 'thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg.svg',
  'Adobe Premiere Rush': B + 'thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg.svg',
  'Adobe InDesign 2024': B + 'thumb/4/48/Adobe_InDesign_CC_icon.svg.svg',
  'Adobe Lightroom 6.5': B + 'thumb/b/b6/Adobe_Photoshop_Lightroom_CC_logo.svg.svg',
  'Adobe Lightroom Classic 2023': B + 'thumb/b/b6/Adobe_Photoshop_Lightroom_CC_logo.svg.svg',
  'Substance 3D Designer': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Dimension 3.4.11': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe After Effects 2024': B + 'thumb/c/cb/Adobe_After_Effects_CC_icon.svg.svg',
  'Substance 3D Modeler': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Prelude 2022': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Substance 3D Painter': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Audition 2024': B + 'thumb/0/0e/Adobe_Audition_CC_icon_%282020%29.svg.svg',
  'Adobe Bridge 2024': B + 'thumb/9/9c/Adobe_Bridge_CC_icon.svg.svg',
  'Adobe Fresco': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Character Animator 2024': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Speech to Text v12': B + 'thumb/4/40/Adobe_Premiere_Pro_CC_icon.svg.svg',
  'Adobe Animate 2024': B + 'thumb/7/7e/Adobe_Animate_CC_icon_%282020%29.svg.svg',
  'Photoshop Elements 2024': B + 'thumb/a/af/Adobe_Photoshop_CC_icon.svg.svg',
  'Adobe XD 57.1': B + 'thumb/c/c2/Adobe_XD_CC_icon.svg.svg',
  'Adobe Media Encoder 2024': B + 'thumb/6/66/Adobe_Media_Encoder_CC_icon.svg.svg',
  'Substance Suite 2023': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe DNG Converter 16.2': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Dreamweaver 2021': B + 'thumb/5/54/Adobe_Dreamweaver_CC_icon.svg.svg',
  'Firefly AI para Photoshop': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Reader XI 11': B + 'thumb/6/6e/Adobe_Acrobat_DC_logo_2020.svg.svg',
  'Adobe Muse CC 2018': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Collection 2020': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Collection 2022': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'Adobe Collection 2023': B + 'thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg.svg',
  'IDM Downloader': B + 'thumb/1/1b/Internet_Download_Manager_logo.png',
  '4K Video Downloader': B + 'thumb/0/09/YouTube_full-color_icon_%282024%29.svg.svg',
  'Adobe Illustrator 2025': B + 'thumb/f/fb/Adobe_Illustrator_CC_icon.svg.svg',
  'Adobe Photoshop 2025': B + 'thumb/a/af/Adobe_Photoshop_CC_icon.svg.svg',
  'After Effects 2025': B + 'thumb/c/cb/Adobe_After_Effects_CC_icon.svg.svg',
  'Nitro PDF Editor Pro': B + 'thumb/8/87/PDF_file_icon.svg.svg',
  'Wondershare PDFelement Pro': B + 'thumb/8/87/PDF_file_icon.svg.svg',
};

async function go() {
  const d = await s.from('items').select('id,title').eq('category_slug', 'programas');
  let c = 0;
  for (const i of d.data) {
    const logo = logos[i.title];
    if (logo) {
      await s.from('items').update({ image_url: logo }).eq('id', i.id);
      c++;
      console.log(c + '. ' + i.title.substring(0,40));
    } else {
      console.log('FALTA: ' + i.title);
    }
  }
  console.log(c + '/57 ACTUALIZADAS');
  process.exit(0);
}
go();
