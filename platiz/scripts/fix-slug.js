(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );

  const now = new Date().toISOString();

  // 1. Crear nueva categoria plr-pro
  console.log('1. Creando categoria plr-pro...');
  const { data: newCat, error: catErr } = await supabase.from('categories').insert({
    name: 'PLR PRO',
    slug: 'plr-pro',
    icon: 'BookOpen',
    description: 'Guias PLR con derechos de reventa',
    created_at: now,
  }).select().single();
  if (catErr) { console.log('Error creando categoria:', catErr.message); return; }
  console.log('   OK:', newCat.slug);

  // 2. Migrar items de plr_pro a plr-pro
  console.log('2. Migrando items...');
  const { data: items, error: listErr } = await supabase.from('items').select('id').eq('category_slug', 'plr_pro');
  if (listErr) { console.log('Error listando:', listErr.message); return; }
  console.log('   Items encontrados:', items.length);

  for (let i = 0; i < items.length; i++) {
    const { error: updErr } = await supabase.from('items').update({ category_slug: 'plr-pro' }).eq('id', items[i].id);
    if (updErr) { console.log('   Error en item', i, ':', updErr.message); return; }
    if (i % 10 === 0) console.log('   Migrados:', i + 1, '/', items.length);
  }
  console.log('   OK:', items.length, 'items migrados');

  // 3. Eliminar categoria antigua
  console.log('3. Eliminando categoria plr_pro...');
  const { error: delErr } = await supabase.from('categories').delete().eq('slug', 'plr_pro');
  if (delErr) { console.log('Error eliminando:', delErr.message); return; }
  console.log('   OK');

  // Verificar
  const { data: verify } = await supabase.from('items').select('id').eq('category_slug', 'plr-pro');
  console.log('VERIFICACION: plr-pro tiene', verify.length, 'items');
})();
