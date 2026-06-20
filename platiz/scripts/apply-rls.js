const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vhgxevfrgnzbebffejnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
  { auth: { persistSession: false } }
);

const policies = [
  { table: 'public.categories', name: 'categorias_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.items', name: 'items_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.streams', name: 'streams_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.banners', name: 'banners_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.partners', name: 'partners_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.store_products', name: 'store_products_lectura_publica', def: 'FOR SELECT USING (true)' },
  { table: 'public.memberships', name: 'memberships_lectura_publica', def: 'FOR SELECT USING (true)' },
];

async function run() {
  for (const p of policies) {
    await supabase.rpc('exec_sql', { sql_text: `DROP POLICY IF EXISTS "${p.name}" ON ${p.table}` });
    const { error } = await supabase.rpc('exec_sql', { sql_text: `CREATE POLICY "${p.name}" ON ${p.table} ${p.def}` });
    if (error) {
      console.log('ERROR:', p.table, '->', error.message);
    } else {
      console.log('OK:', p.table);
    }
  }
  console.log('DONE');
}

run();
