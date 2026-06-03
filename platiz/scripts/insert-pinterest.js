(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );
  const now = new Date().toISOString();
  const ts = [
    'DOMINANDO ETSY Y PINTEREST|DAGNC-E_W_M/rLskbjq3eMXQHSfPjj-guw',
    '1000 PLANTILLAS PARA PINES|DAGJFRPqHRA/zQlyxseNW8WX1uYvQquGMQ',
    'Peach Marble Pinterest Template|DAEBlMh2NLM/l5gyL_MlkXsJuhlvt_Egjw',
    'Vintage Pinterest Template|DAEMpS-BqDc/6sGCvhUkQ_rSBHonzV8P3w',
    'Vibrant Pinterest Video Pins|DAELU65DNfE/ttTIp-on3hNo0ZR-gmAwkQ',
    'Pink Foodies Pinterest|DAEA6seD2fM/C-TEGVL7kXVaX79akRYVZg',
    'Vintage X Fall Pinterest|DAEHeCD7eCU/BaAC_yVkzOr5fPROM5sd-w',
    'Yellow Marble Pinterest|DADqZ3cmQKc/-wyBEIDALo0_K89NjxYp_A',
    'Travel Blogger Pinterest|DAEB1XGZrcU/YdsH8pI86fx-chCc2EPEfQ',
    'Peach Ombre Pinterest|DAECsGxCoo8/s_wVoXyZODvC2HaiSOBhlg',
    'Pretty Nerds Video Pinterest|DAENp3WmA_Q/Jbx0aaIlrF2CO4AfB13lTw',
    'Pretty and Vibrant Pinterest|DAENGDw5ZCA/xeJaKnRUeKpGUYHeFykIjg',
    'Peachy Pinterest For Bloggers|DAEmOzMkdmg/mNL8SJ1vWL9Y901Tw8cXwQ',
    'Road Trip Travel Pinterest|DAEjgxlGv2Y/GvwNqwyT1EBHyb6lyPO81g',
    'Familiar Travel Blogger Pinterest|DAEmN9KA5to/5FtO5KYY1U_sU5F__eAQSg',
    'Perfect Mommy Blogger Pinterest|DAEWS83oTJA/N8t7fPtf-QzGhoD1C4ENRw',
    'Holiday Shenanigans Pinterest|DAEOaVDz4Zs/BgfItkRGQUASMwSNi9Rv2A',
    'Mental Health Pinterest Blue|DAFdz9TW-hE/vi4UShiO_s4128aGXcsREQ',
    'Food Blogger Pinterest Pins|DAE-3jJHccU/KD1aqVjLF1joHzFoYGdYSA',
    'Healthcare Pinterest Template|DAFXRM9hiXA/UGJcvCZGX8YUcCvb8DcI9w',
    'Pink Ombre Pinterest|DAFMBW7JuqE/2TaF2hZX7K5gapteslpJwA',
    'Mommy Blogger Pinterest Pins|DAFYNT-KF2s/rBWDRUkwLXcqMR_3lzzrWw',
    'Pet Engagement Pinterest|DAFf9zYx7GM/NfCgeKZQfWjYzKG_BjQj_A',
    'Business Development Pinterest|DAFau3wNKh8/gavinBPsjXwclREXvg1LYQ',
    'Interior Design Pinterest|DAFcmhxMTKE/vMnobSBOvG31RdaihwRTaw',
    'Mental Health Pinterest Pink|DAFd0oxD2-0/v369KimSKeP2jvcRf_OFaw',
    'Surgeon Pinterest Pins|DAFVe132BhE/2dCxuvkllY8VDs0kA3c-yA',
    'Bakery Pinterest Posts|DAFVRTlR3YU/96LOA9djNOvKO_G-zV1SIg',
    'Feminine Pinterest Template|DAE6e7uBl-4/WlimD9AHGnyAJoTqiEGHww',
    '20 Food Blogger Pinterest|DAFNtEZBXGw/UwXYkQOwRNKpGymGRr01cw',
    'Restaurant Pinterest Pins|DAFV7qE4Gmg/BUGLgSTAUNIX8Va9huKxAQ',
    'Dental Clinic Pinterest|DAFV1tyfOIY/eXBKiiaOm6fcwznkPlaafg',
    'Mommy Blogger Beige Pinterest|DAFYM_GIozQ/HU0-6yu7D2JpQToVLsw_vw',
    'Black and Gold Pinterest|DAFauaJ6-pU/IaKYUkI9fRRAelEWTfpPGQ',
    'Medical Doctor Pinterest|DAFNgk8DasA/pmGXdRyG1qnZyH0zeXazFw',
    'Business Consultant Pinterest|DAFavP4ygss/P2nVVJdFkb86RGuAH9wtRg',
    'Real Estate Pinterest Template|DAE51KklPjo/dDq4x_CyAF92Y234vtnSsw',
    'Business Coach Pinterest|DAFPdoFAHaE/AbS2VnNGuOjc_jBH__5fvg',
    'Hair Salon Pinterest Pins|DAFYlFZgKGs/NJ-tfNYXjZTBTa5FFKD6UQ',
    'Travel Agent Pinterest|DAFYBrL6mn4/BJizQpq2a7avNT0cH5RaTA',
  ];
  for (let i = 0; i < ts.length; i++) {
    const [title, id] = ts[i].split('|');
    const { error } = await s.from('items').insert({
      category_slug: 'plr-pro', title, description: 'Pinterest Template PLR',
      link: 'https://www.canva.com/design/' + id + '/view',
      sort_order: 154 + i, active: 1, created_at: now, updated_at: now,
    });
    console.log(error ? 'ERR' : 'OK', title.substring(0, 40));
  }
  console.log('Total ~' + (154 + ts.length));
})();
