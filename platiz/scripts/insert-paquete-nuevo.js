(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );

  const items = [
    { title: 'ORGANIZACIONES SIN FINES DE LUCRO' },
    { title: 'Gestion de Despacho de Camiones (Logistica)' },
    { title: 'Tu negocio en grupo desde casa' },
    { title: 'GUIA PARA INICIAR UN NEGOCIO DE GUARDERIA INFANTIL' },
    { title: 'Empresa de camiones PAQUETE EMPRESARIAL' },
    { title: 'El salon de manicura' },
    { title: 'Lista de Proveedores mas de 3000' },
    { title: 'Como Charlar con los proveedores' },
    { title: 'Agencia de turismo desde el hogar' },
    { title: 'Comenzando como asistente virtual - negocio en casa' },
    { title: 'Gana dinero desde casa con Dropshipping' },
    { title: 'CONSEJOS PARA EL NEGOCIO DEL CABELLO' },
    { title: 'Crear Marca de Empresa' },
    { title: 'El negocio de maquina de snacks' },
    { title: 'Guia para iniciar un negocio de laboratorio de diagnostico' },
    { title: 'Iniciar un negocio de RCP en movimiento' },
    { title: 'Crear Tienda de envios como negocio' },
    { title: 'El modelo de negocio de AIRBNB' },
    { title: 'Reparacion de credito para tu negocio' },
    { title: 'CENTRO DE ATENCION TELEFONICA VIRTUAL' },
    { title: 'Guia. El financiamiento de empresas' },
    { title: 'Como usar threads para tus negocios' },
    { title: 'Gana dinero online' },
    { title: '177 ideas de productos digitales' },
    { title: 'GANCHOS Y SUBTITULOS PARA REEL DE INSTAGRAM' },
    { title: 'Productos Digitales, kit de inicio' },
    { title: 'Como hacer y vender Productos Digitales' },
    { title: 'Automatizar para generar ingresos Extras' },
    { title: 'El Libro del Marketing' },
    { title: 'Precios de productos y explicaciones' },
    { title: 'Informe para CREDITO' },
    { title: 'Estrategia de productos digitales con ETSY' },
    { title: 'Guia de ingresos con TURO' },
    { title: 'Creador de Contenido UGC' },
    { title: 'Plantillas de curriculum' },
    { title: 'Flebotomista movil como modelo de negocio' },
    { title: 'Atencion telefonica para entrevistas practicas' },
    { title: 'El Negocio de Agente de Credito' },
    { title: 'Como convertirte en un Agente de Bienes y Raices' },
    { title: 'Como convertirse en Un agente de seguros certificado' },
    { title: 'Guion de entrevista para enfermero registrado' },
    { title: 'Ser un reclutador edicion empresarial' },
    { title: 'Guia Sobre la INMERSION EN LA TECNOLOGIA' },
    { title: 'CONDUCTOR DE CAMION CON LICENCIA CDL, EEUU' },
    { title: 'Planificar una escuela de enfermeria' },
    { title: 'Guia para la gestion de Lideres' },
    { title: 'Entrar en el mundo de Recursos Humanos' },
    { title: 'Guia de reclutador Independiente' },
    { title: 'Tecnico de farmacia certificado, EEUU' },
    { title: 'Coleccion de Imagenes vainilla Mockups' },
    { title: '200+ Galeria de Fotos', link: 'https://drive.google.com/drive/folders/1WNL8wmj38_3OBIxNgYDRSpnbw-XbJv_w' },
    { title: 'Galeria de 120 - corporativas para historias' },
    { title: 'Instagram-plantilla' },
    { title: 'Galeria 50 fotos mujer Elegante' },
    { title: '50 fotos de mujeres para historias' },
  ];

  // Build full Canva links for items without explicit link
  const canvaIds = [
    'DAGh2GCj6Ak/10s6_HIUbYrUvriS_LFevw', 'DAGh2P2YMfw/PUwfZ3WhdsXIm6QcqjNTcg', 'DAGh2fNG8ko/l2I0H2fxq5abjegwtB0VzQ',
    'DAGh2RlcW5U/0RQCOoOhcogT3nmtDdaDAQ', 'DAGh2cShxb8/7q3-uIV7Y83xIT_7N-moLg', 'DAGh2nRFXv8/NqwK53YeBK0dYesRluCCxg',
    'DAGh2u3RIvE/Tc40DIYHdLgWfurR-yoVZw', 'DAGh2uXc1Ks/FUVBx6rO9MPLJSlImTYhkg', 'DAGh2lwO2mY/oICxQJSVUW6tt8vHvOBNVg',
    'DAGh20qwtIc/aCKFZ5QZUmep4CTmnZne-g', 'DAGh2-ZIsVs/jA9MQV8NVNdTgjxMAms04Q', 'DAGh2y1Qqeg/t4ueFl-BEapxr3YDN0UA5Q',
    'DAGh4_vt2Ow/6s61g8qt6JjhDQOOoKcW6Q', 'DAGh5LQyhdA/Q95cpQwEmGmRWnZ2HooVZQ', 'DAGh5H-IGuo/Ye3FZUuTeXrbZrYzxKB5YA',
    'DAGh5dOCQXU/fB1f65XGmP0-ee9860XU9g', 'DAGh5XMZODk/E6UkMNTbe_8lOIc6mHQ2sg', 'DAGh5fEbZF8/50dHDBRVTe9R-UP9K7MRAw',
    'DAGh5uEKIXg/YREQfXQYSDXLVjJ26uqWHA', 'DAGh5uWAhFw/on8iWeGrjrK4ScIVuz4chQ', 'DAGh5kF4-c4/5rptNNP-4-lc3AE1VNIN2Q',
    'DAGh5hAbPzQ/E--SvGbaHCdCuPBuaheCmg', 'DAGh5upkC50/v3gaM6-T8qfE9eNJ90Bzqg', 'DAGh5x_xEEw/RfpiFsp_qzKNTWnqxX0Bwg',
    'DAGh58tpaWs/mkikrzh5jIBKlRYeE_VDrw', 'DAGh55xiHnk/3ymnty8MNkJadzQmodCtvg', 'DAGh6KcQ4nQ/a73B2YMOh2KLvQM9jTnT3Q',
    'DAGh6BNz5aw/3fDYrr5PQ3jecWmLTzd9Gw', 'DAGh6CABOJg/lpNhHiEFdbyAFI3BhuFm8w', 'DAGh6fOnSYg/mtzk50YihTCc5WOL9m7Ncg',
    'DAGh6vg6Rew/AqfJpB2SAd0V0RCgq-1g8A', 'DAGh6rXq7wY/QA-I4kEk3qZorn3a7CQsgg', 'DAGh6sIhIxE/Cn2U74llXMIOWt0aQybHmw',
    'DAGh6u7b8Qc/w_bQHyrPRfl-aBsJ2mQrew', 'DAGh6qDoQU8/Hium6Nwr4s--3Xj-zgzZmw', 'DAGh6xJBHeM/aUxUFmy2GaYzMuzW0P8dyg',
    'DAGh7Mdt_h4/SHXx7BDXaRzqSFCH_Q4qJA', 'DAGh7E6q-n8/wq4M9-twnSqwZRVrzdFJPA', 'DAGh7IxTTCc/N1zqlCZNrftVKoMGeo3S3g',
    'DAGh7BS4KVg/rKYdBSZrIEXaNWnmP2FsXQ', 'DAGh7C2x73I/CjDy21WGrYuIGIQ5dNw52A', 'DAGh7FLdfvw/VYzH5O1bnGry77vSz2q-Iw',
    'DAGh70Hd1Pw/cf_d1o7CFhJx1CXau52wbA', 'DAGh71csT4c/y-3rp9IMCeUx9e3mU0rNDg', 'DAGh75tcZKM/ADnkaBBr8m58E6PxBs4WPA',
    'DAGh73rb-Ac/Yda4W6gYckibIJkh_YaBAA', 'DAGh8KSbqtY/ULmFP50ITv1edqj0OtD87Q', 'DAGh8KzOUr8/4C8rvzhogwHaBu9LCNuMXw',
    'DAGh8WG0WAc/pWvyVbhYVO-y1wVxeGRuoQ', 'DAGh8Yoj0q8/H1LbaEHVjyPbTQf_XQ1Csw',
    // Google Drive link is item index 50, skip
    'DAGfgYXG7cU/e0EP_khVtBB_3XoBSJI-Rg', 'DAGiGCZTctc/mtGr31SGhovQ3D4zHxDztg',
    'DAGfgcg9Wpk/Lj9ZaV13SSkI2B7EjevP5Q', 'DAGfgRJShWY/ZSzzL6gLT2ckhEBdggQ_Qg',
  ];

  const now = new Date().toISOString();
  let canvaIdx = 0;
  let inserted = 0;

  for (const item of items) {
    const link = item.link || (canvaIdx < canvaIds.length ? `https://www.canva.com/design/${canvaIds[canvaIdx]}/view` : null);
    if (!item.link) canvaIdx++;

    const { error } = await supabase.from('items').insert({
      category_slug: 'plr-pro',
      title: item.title,
      description: 'Guia PLR - PAQUETE NUEVO',
      link,
      image_url: null,
      sort_order: 48 + inserted,
      active: 1,
      created_at: now,
      updated_at: now,
    });
    if (error) {
      console.log('Error:', error.message.substring(0, 60));
    } else {
      inserted++;
    }
  }
  console.log(`\nInsertados: ${inserted}/${items.length}`);
  console.log('PLR PRO total ~' + (48 + inserted));
})();
