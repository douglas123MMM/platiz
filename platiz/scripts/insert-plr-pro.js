(async () => {
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );

  const items = [
    { title: 'STAN Y EMAIL MARKETING', link: 'https://www.canva.com/design/DAGH8FDJOzk/NSRIdc4jMhJf9-Vb1-YrlQ/view?utm_content=DAGH8FDJOzk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR sobre Stan y Email Marketing' },
    { title: 'DOMINANDO ETSY', link: 'https://www.canva.com/design/DAGhzpQu7MM/um7Hj-MzB7jf_4SUDpihrA/view?utm_content=DAGhzpQu7MM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para dominar Etsy' },
    { title: 'EMPEZANDO CON CANVA', link: 'https://www.canva.com/design/DAF68NOyOVo/g4ogY-jTg1wiVuu9RcHZjw/view?utm_content=DAF68NOyOVo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para empezar con Canva' },
    { title: 'Descubriendo Ganancias en los Lugares Mas Inesperados', link: 'https://www.canva.com/design/DAGhzwIq1kA/pg1bFS6VGX2serer4TGn2A/view?utm_content=DAGhzwIq1kA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR sobre ganancias inesperadas' },
    { title: 'COMO COMENZAR UN NEGOCIO DIGITAL', link: 'https://www.canva.com/design/DAGhz-jAVJk/l78yxKKqwPYjf2EoZQF6DQ/view?utm_content=DAGhz-jAVJk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para comenzar un negocio digital' },
    { title: 'GUIA DE AUTOACEPTACION', link: 'https://www.canva.com/design/DAGh0Jn53lE/4Ea6TAG7Q_z4ECwg-e8eTQ/view?utm_content=DAGh0Jn53lE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de autoaceptacion' },
    { title: 'EL FUTURO DE CHATGPT', link: 'https://www.canva.com/design/DAGhz0HdSAY/GKl8GRIDhDFY8PPAbAQZgw/view?utm_content=DAGhz0HdSAY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR sobre el futuro de ChatGPT' },
    { title: 'CREACION DE CONTENIDO DE VALOR', link: 'https://www.canva.com/design/DAGQsiEbR3k/chML978vjLvhYfCyLy1pig/view?utm_content=DAGQsiEbR3k&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para crear contenido de valor' },
    { title: '25 IDEAS DE PRODUCTOS DIGITALES', link: 'https://www.canva.com/design/DAGQsgpqxIc/R2UBarpx8Ugc7Sei8Bd4Kw/view?utm_content=DAGQsgpqxIc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '25 ideas de productos digitales PLR' },
    { title: 'LANZAMIENTO DIGITAL', link: 'https://www.canva.com/design/DAGOh2JqDuo/IH8ez0BQKLKJPMUimCkSNg/view?utm_content=DAGOh2JqDuo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de lanzamiento digital' },
    { title: 'GUIA DE MARKETING FACELESS', link: 'https://www.canva.com/design/DAGdOnntYh8/67gLTHUR29ami0W1WluXEw/view?utm_content=DAGdOnntYh8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de marketing faceless' },
    { title: '5 PASOS PARA HACER CRECER TU INSTAGRAM', link: 'https://www.canva.com/design/DAGhztvP92s/59ztU2YdVywIX_vQNuxhXQ/view?utm_content=DAGhztvP92s&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '5 pasos para crecer en Instagram - PLR' },
    { title: '600 IDEAS DE PRODUCTOS DIGITALES PARA ETSY', link: 'https://www.canva.com/design/DAGeFeY930c/yv7gGNGKOMQ-AfMhibsZ5g/view?utm_content=DAGeFeY930c&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '600 ideas de productos digitales para Etsy - PLR' },
    { title: '10K CON PRODUCTOS DIGITALES', link: 'https://www.canva.com/design/DAGPIK3HlIE/RdmeieLiWKeYMD0K646lgw/view?utm_content=DAGPIK3HlIE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para ganar 10K con productos digitales' },
    { title: 'AMPLIANDO TU NEGOCIO CON CHATGPT', link: 'https://www.canva.com/design/DAGCOYLTyEY/srGI-9cU68-0g3YT3wGJRw/view?utm_content=DAGCOYLTyEY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para ampliar negocio con ChatGPT' },
    { title: 'BANDEJA DE ENTRADA IMPACTANTE', link: 'https://www.canva.com/design/DAGIxAMhl0Q/tPdgMMBua0K4dWuOKCoyrg/view?utm_content=DAGIxAMhl0Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de bandeja de entrada impactante' },
    { title: 'LISTAS DE CORREOS ELECTRONICO', link: 'https://www.canva.com/design/DAGIxF1IpPg/ymBdaJpLPSPLjQ0wp0Hf6Q/view?utm_content=DAGIxF1IpPg&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de listas de correos electronicos' },
    { title: 'PLAN HACIA LA PROSPERIDAD ANONIMA', link: 'https://www.canva.com/design/DAGIx1v6PBY/zGWDDKT0CzdTWQRqfWkRDQ/view?utm_content=DAGIx1v6PBY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR plan hacia la prosperidad anonima' },
    { title: 'DOMINANDO LOS PLRS', link: 'https://www.canva.com/design/DAGH8BpRaYI/tQzicAgUDcKxz2-NXbt8yw/view?utm_content=DAGH8BpRaYI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para dominar los PLR' },
    { title: 'GUIA QUE PUBLICAR EN REDES', link: 'https://www.canva.com/design/DAGH8N94ymE/qqFtbDjZvd-OooocaFirDQ/view?utm_content=DAGH8N94ymE&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR sobre que publicar en redes' },
    { title: 'IDEAS DE PRODUCTOS DIGITALES', link: 'https://www.canva.com/design/DAGh0FpImC0/RrG4yW5WrEla-dDaZPshdg/view?utm_content=DAGh0FpImC0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Ideas de productos digitales - PLR' },
    { title: 'CURSO INTENSIVO DE CANVA', link: 'https://www.canva.com/design/DAGVseeV97U/02vh0I3luj5dM35afco_Jg/view?utm_content=DAGVseeV97U&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Curso intensivo de Canva - PLR' },
    { title: '50 CONSEJOS PARA CHATGPT', link: 'https://www.canva.com/design/DAGhz16wng8/aSMZpHS6kAv4KGFj1hYDnQ/view?utm_content=DAGhz16wng8&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '50 consejos para ChatGPT - PLR' },
    { title: 'CONVERTIRSE EN UN CREADOR DE CONTENIDO', link: 'https://www.canva.com/design/DAGhzyZla_M/rL2WYoKUSbh9HWEgzSfz5A/view?utm_content=DAGhzyZla_M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para convertirse en creador de contenido' },
    { title: 'MARKETING FACELESS EN TIK TOK', link: 'https://www.canva.com/design/DAGhzz07Fhc/LOudWtxA3A1JUx15qj-6UA/view?utm_content=DAGhzz07Fhc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Marketing faceless en TikTok - PLR' },
    { title: 'GUIA DE REELS FACELESS', link: 'https://www.canva.com/design/DAGhzmS2onQ/7ueVqgvH--3TDJz-AhxDrw/view?utm_content=DAGhzmS2onQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia de reels faceless - PLR' },
    { title: 'CONSEGUIR LA LIBERTAD ECONOMICA', link: 'https://www.canva.com/design/DAGhzi5ksHQ/m82daGE2ytY9jl75k-nfLA/view?utm_content=DAGhzi5ksHQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR para conseguir la libertad economica' },
    { title: '150 GANCHOS', link: 'https://www.canva.com/design/DAGhuYSMg2A/ipRvF1DzkG8VBRJZX3GnfQ/view?utm_content=DAGhuYSMg2A&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '150 ganchos para contenido - PLR' },
    { title: 'RETO 30 DIAS PARA REDES SOCIALES', link: 'https://www.canva.com/design/DAGhtQBkxQI/zS37mLPUYXPiIHdOMQlSTA/view?utm_content=DAGhtQBkxQI&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Reto 30 dias para redes sociales - PLR' },
    { title: 'HOJA DE RUTA FACELESS', link: 'https://www.canva.com/design/DAGhtMWrz7M/DuwHfWtPO9-xHl0s_vxTRQ/view?utm_content=DAGhtMWrz7M&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Hoja de ruta faceless - PLR' },
    { title: '5 PASOS PARA OPTIMIZAR TU INSTAGRAM', link: 'https://www.canva.com/design/DAGbRjzOa7w/zp2tmFLnjPCrcmKniskgwA/view?utm_content=DAGbRjzOa7w&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: '5 pasos para optimizar tu Instagram - PLR' },
    { title: 'GUIA DE MARKETING 2.0', link: 'https://www.canva.com/design/DAGhWWKP774/p4qi2itGnOdJnp3WDxiO4Q/view?utm_content=DAGhWWKP774&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia de marketing 2.0 - PLR' },
    { title: 'CONCEPTOS FUNDAMENTALES DE CHATGPT', link: 'https://www.canva.com/design/DAGhWDguskc/rmBVo3l_ytceSOeKPJ0uJw/view?utm_content=DAGhWDguskc&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Conceptos fundamentales de ChatGPT - PLR' },
    { title: 'ENTENDIENDO LOS DERECHOS DE REVENTA MAESTRA', link: 'https://www.canva.com/design/DAGhWIWb22U/qeQtTvBoy7JuBaHGqw_SPA/view?utm_content=DAGhWIWb22U&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Entendiendo los derechos de reventa maestra - PLR' },
    { title: 'DISEÑA MAS RAPIDO. GUIA DE CANVA', link: 'https://www.canva.com/design/DAGhSwY4fgY/tRJHl87BkNpk5rbjnod6cg/view?utm_content=DAGhSwY4fgY&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Disena mas rapido con Canva - PLR' },
    { title: 'MARKETING DE AFILIADOS', link: 'https://www.canva.com/design/DAGh2GXeAHA/I10mZvJTvBz9-Z4pD7xYBA/view?utm_content=DAGh2GXeAHA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia PLR de marketing de afiliados' },
    { title: 'PILARES DE CONTENIDO', link: 'https://www.canva.com/design/DAGhQ97Yr0U/CiOXEQjtEex9pTZoOMb5Eg/view?utm_content=DAGhQ97Yr0U&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Pilares de contenido - PLR' },
    { title: 'CORREOS MAGNETICOS', link: 'https://www.canva.com/design/DAGhRBC5Lao/o7pU37wl_FKw6NiMtYWx_w/view?utm_content=DAGhRBC5Lao&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Correos magneticos - PLR' },
    { title: 'GUIA VIRALIZA TUS REELS', link: 'https://www.canva.com/design/DAGhRI0V4Oo/KOCPIvlli5ITpainosKC_Q/view?utm_content=DAGhRI0V4Oo&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Guia para viralizar reels - PLR' },
    { title: 'DESCUBRIENDO GANANCIAS EN LOS LUGARES MAS INESPERADOS', link: 'https://www.canva.com/design/DAGhRD2G-zw/Am_4rGAtDkO029ZDL8P3XA/view?utm_content=DAGhRD2G-zw&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview', description: 'Descubriendo ganancias en lugares inesperados - PLR' },
  ];

  const now = new Date().toISOString();

  const { data: catData, error: catError } = await supabase.from('categories').upsert({
    name: 'PLR PRO',
    slug: 'plr_pro',
    icon: 'BookOpen',
    description: 'Guias PLR con derechos de reventa',
  }, { onConflict: 'slug' }).select('*').single();

  if (catError) {
    console.log('Error categoria:', catError.message);
  } else {
    console.log('Categoria OK:', catData.slug);
  }

  const rows = items.map((item, i) => ({
    category_slug: 'plr_pro',
    title: item.title,
    description: item.description,
    link: item.link,
    image_url: null,
    sort_order: i,
    active: 1,
    created_at: now,
    updated_at: now,
  }));

  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { error: insError } = await supabase.from('items').insert(batch);
    if (insError) {
      console.log('Error lote ' + i + ': ' + insError.message);
    } else {
      console.log('Lote ' + i + '-' + (i + batch.length - 1) + ' OK');
    }
  }
  console.log('TOTAL: ' + rows.length + ' guias PLR PRO insertadas');
})();
