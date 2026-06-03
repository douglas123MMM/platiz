(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );

  const guidetitle = 'Como poner precio a mi PLR';
  const fulltext = `Guia Estrategica de Precios: Maximiza el Valor de tu Negocio
Hola, familia Global Dorado!

Nos emociona acompanarte en uno de los pasos mas cruciales para el crecimiento de tu negocio: la fijacion de precios.

Ponerle precio a tus productos no es lanzar un numero al azar; se trata de entender el valor real que aportas y asegurar la rentabilidad y sostenibilidad de tu marca a largo plazo. Vamos a desglosarlo de forma simple y directa!

DIRECTRICES Y RANGOS DE PRECIOS
Utiliza estos rangos como punto de partida de acuerdo al volumen de contenido, nivel de personalizacion y el valor unico que ofreces.

PAQUETES DE IMAGENES CON IA
- Solo Fotos: $17 - $40+
- Fotos + Mockups: $40 - $70+
Criterio: Piensa en la cantidad de imagenes, la variedad y cuanto pagarias tu mismo por un pack similar.

EBOOKS, GUIAS Y PLANIFICADORES (Basado en extension y elementos visuales)
- Cortos (menos de 40 paginas): $17 - $47
- Largos (mas de 40 paginas): $47 - $97
- Sin fotos incluidas: $10 - $27
- Con fotos: $27 - $40
- Con fotos + Mockups: $40 - $70+

PLANTILLAS DE MARKETING Y REDES SOCIALES
- Menos de 100 plantillas: $10 - $27
- Mas de 100 plantillas: $27 - $47+
Para Carruseles o Reels:
- Sin fotos: $10 - $27
- Con fotos: $27 - $40
- Con Videos / Mockups: $37+
Criterio: Evalua el nivel de detalle. Se puede personalizar facilmente? Cubre el contenido de todo un mes?

PACKS Y COLECCIONES ESTRATEGICAS
Agrupar productos es excelente para aumentar el ticket de venta, pero no apliques descuentos excesivos.
La Regla: Suma el valor total de los articulos individuales y aplica un descuento del 10% al 40%.
Estrategia de Precios Psicologicos: Si el total con descuento da $100, fijalo en $97. Visualmente se percibe como una oportunidad mucho mayor.
Nota: A veces es mejor vender los productos por separado.

PRODUCTOS ESPECIALES Y DE ALTO VALOR
- Estrategia Viral de Instagram: $99+
- Paquete de Marketing Organico: $60+
- Clases Magistrales (Masterclasses): $47 - $111+

EMBUDOS DE VENTA (Seccion Systeme.io)
- Enlace en Bio: $7 (Ideal como gancho de entrada de alta conversion)
- Paginas Individuales (Landing Pages): $27 - $97
- Embudos de Pagina de Inicio: $111
- Kits de Embudo (6 paginas): $111 - $222
- Mega Funnels (14 paginas): $222 - $444
- Mega Funnels Completamente Equipados (26 paginas): $888 - $1297

POR QUE ES FUNDAMENTAL TU ESTRATEGIA DE PRECIOS?
- Tu trabajo vale: Tu tiempo, creatividad y energia tienen un costo.
- No compitas por precio: Posicionate como una opcion premium.
- El precio es tu decision: Estas pautas son una brujula.

PREGUNTAS CLAVE ANTES DE ETIQUETAR
1. Cuanto tiempo invertiste en la creacion, diseno y montaje digital?
2. Que recursos extra (mockups, fotos exclusivas) estas incluyendo?
3. Cuantas horas o dias de trabajo le estas ahorrando a tu cliente?

REFLEXION FINAL
El precio no es solo un numero; es un reflejo de tu confianza. Confianza en tu talento, en tu plataforma y en la transformacion que generas. Al fijar precios inteligentes, educas a tu cliente para que entienda que tu producto es una inversion, no un gasto.

Conoce tu valor, analiza tus opciones y lanzate con seguridad! Estamos contigo en cada paso del camino.`;

  const { error } = await s.from('items').insert({
    category_slug: 'plr-pro',
    title: guidetitle,
    description: fulltext,
    link: null,
    image_url: null,
    sort_order: -1,
    active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.log('ERROR:', error.message);
  } else {
    console.log('OK: Guia de precios insertada en PLR PRO');
  }
})();
