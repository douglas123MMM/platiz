(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );

  const text = `Guia Estrategica de Precios PLR PRO | Familia Global Dorado

Hola, familia Global Dorado!

Ponerle precio a tus productos PLR no es un numero al azar. Es reflejar el valor real que entregas y construir un negocio rentable y sostenible. Aqui tienes una guia clara y directa basada en lo que ofrecemos en nuestra seccion PLR PRO.

============================================
GUIAS PLR (Disenos en Canva)
============================================
Son guias profesionales listas para personalizar con tu marca.

- Guias cortas (Marketing, Instagram, TikTok): $7 - $17
- Guias intermedias (Negocios, Productos Digitales): $17 - $27
- Guias avanzadas (Estrategia, Embudos, Logistica): $27 - $47
- Guias premium (+50 paginas, multi-tema): $47 - $77

Criterio: Evalua el valor practico. Una guia que ensena a ganar dinero vale mas que una guia informativa basica.

============================================
PLANTILLAS DE EBOOKS Y WORKBOOKS
============================================
- Workbooks / Lead Magnets: $7 - $17
- Plantillas de Marca Personal: $17 - $27
- Workbooks de Social Media: $17 - $37
- Kits de Generacion de Leads: $27 - $47

============================================
KITS DE MARCA
============================================
- Paletas de Colores: $7 - $17
- Kits de Marca (15-31 disenos): $17 - $37
- Plantillas de Logos (+50): $17 - $27
- Kit Completo de Identidad Visual: $37 - $67

============================================
MOCKUPS PARA PRODUCTOS DIGITALES
============================================
- Mockups de Smartphones: $7 - $17
- Packs de Mockups Aesthetic (174+): $17 - $27
- Mockups para Listing de Etsy (127-187): $17 - $37
- Coleccion Completa de Mockups: $37 - $67

============================================
PLANTILLAS DE VIDEO Y CONTENIDO
============================================
- Videos Faceless (50-87 videos): $10 - $27
- Reels Hechos Para Ti (40-200): $17 - $37
- Carruseles de Marketing Digital: $10 - $27
- Posts para Redes Sociales (105+): $10 - $17
- Packs Masivos (800-1700 videos/posts): $37 - $77

============================================
PLANTILLAS DE PINTEREST
============================================
- Plantillas Individuales: $5 - $10
- Packs Tematicos (10-20 plantillas): $10 - $17
- 1000 Plantillas para Pines: $27 - $47

============================================
PLANNERS Y PLANIFICADORES
============================================
- Planner de Productos Digitales: $7 - $17
- Planificador de Contenido / Instagram: $10 - $27
- Planificador de Marca: $17 - $27

============================================
ESTRATEGIA DE PRECIOS Y PACKS
============================================
Regla de oro para combos: Suma el valor individual y aplica 10%-30% de descuento.

Ejemplo practico:
- 3 Guias de Instagram ($17 c/u = $51) + Kit de Marca ($27) = $78
- Con descuento del 20%: $62

Precio psicologico: Si el total da $62, redondea a $57 para que se perciba como mejor oferta.

============================================
PREGUNTAS CLAVE ANTES DE PONER PRECIO
============================================
1. Cuantas paginas o disenos incluye? A mayor contenido, mayor precio.
2. El cliente puede personalizarlo facilmente en Canva? Si es editable, vale mas.
3. Resuelve un problema concreto (conseguir clientes, crecer en redes)?
4. Que valor le estas ahorrando al cliente en tiempo y esfuerzo?

============================================
REFLEXION FINAL
============================================
Tu trabajo tiene valor. No compitas por precio: compite por calidad y transformacion. Estas pautas son una brujula, pero TU conoces tu mercado y el esfuerzo detras de cada producto. El precio justo atrae al cliente correcto.

Conoce tu valor, confia en tu producto y vende con seguridad.
Familia Global Dorado: Transformamos Internet en Dinero.`;

  const { error } = await s.from('items').update({ description: text }).eq('title', 'Como poner precio a mi PLR').eq('category_slug', 'plr-pro');
  
  if (error) {
    console.log('ERROR:', error.message);
  } else {
    console.log('OK: Texto adaptado actualizado en PLR PRO');
  }
})();
