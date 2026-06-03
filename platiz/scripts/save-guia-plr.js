(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );
  const guide = "Guia Estrategica de Precios PLR PRO | Familia Global Dorado\n\nHola, familia Global Dorado!\n\nPonerle precio a tus productos PLR no es un numero al azar. Es reflejar el valor real que entregas y construir un negocio rentable y sostenible.\n\nGUIAS PLR (Disenos en Canva)\n- Guias cortas (Marketing, Instagram, TikTok): $7 - $17\n- Guias intermedias (Negocios, Productos Digitales): $17 - $27\n- Guias avanzadas (Estrategia, Embudos, Logistica): $27 - $47\n- Guias premium (+50 paginas): $47 - $77\n\nPLANTILLAS DE EBOOKS Y WORKBOOKS\n- Workbooks / Lead Magnets: $7 - $17\n- Plantillas de Marca Personal: $17 - $27\n- Workbooks de Social Media: $17 - $37\n- Kits de Generacion de Leads: $27 - $47\n\nKITS DE MARCA\n- Paletas de Colores: $7 - $17\n- Kits de Marca (15-31 disenos): $17 - $37\n- Plantillas de Logos (+50): $17 - $27\n- Kit Completo de Identidad Visual: $37 - $67\n\nMOCKUPS\n- Mockups de Smartphones: $7 - $17\n- Packs de Mockups Aesthetic: $17 - $27\n- Mockups para Etsy: $17 - $37\n- Coleccion Completa: $37 - $67\n\nPLANTILLAS DE VIDEO Y CONTENIDO\n- Videos Faceless (50-87): $10 - $27\n- Reels Hechos Para Ti (40-200): $17 - $37\n- Carruseles Marketing Digital: $10 - $27\n- Posts para Redes (105+): $10 - $17\n- Packs Masivos (800-1700): $37 - $77\n\nPLANTILLAS DE PINTEREST\n- Plantillas Individuales: $5 - $10\n- Packs Tematicos: $10 - $17\n- 1000 Plantillas para Pines: $27 - $47\n\nPLANNERS Y PLANIFICADORES\n- Planner de Productos Digitales: $7 - $17\n- Planificador de Contenido / Instagram: $10 - $27\n- Planificador de Marca: $17 - $27\n\nESTRATEGIA DE PRECIOS Y PACKS\nRegla de oro: Suma el valor individual y aplica 10%-30% de descuento. Precio psicologico: redondea hacia abajo.\n\nPREGUNTAS CLAVE\n1. Cuantas paginas o disenos incluye?\n2. Se puede personalizar facilmente en Canva?\n3. Resuelve un problema concreto?\n4. Que valor le ahorras al cliente?\n\nREFLEXION FINAL\nTu trabajo tiene valor. No compitas por precio: compite por calidad. El precio justo atrae al cliente correcto.\n\nFamilia Global Dorado: Transformamos Internet en Dinero.";
  const r = await s.from('items').insert({
    category_slug: 'settings',
    title: 'guia_plr_pro',
    description: guide,
    link: null,
    sort_order: 0,
    active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log(r.error ? r.error.message : 'OK: Guia guardada en items (category: settings)');
})();
