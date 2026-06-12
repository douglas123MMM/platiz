const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  const { data: cols } = await sb.from('users').select('catalog_theme').limit(1);
  if (cols === null || (cols && cols.length === 0)) {
    console.log('Column may not exist. Run in Supabase SQL Editor: ALTER TABLE users ADD COLUMN IF NOT EXISTS catalog_theme TEXT DEFAULT ''dark'';');
  } else {
    console.log('Column exists');
  }
}
run();
