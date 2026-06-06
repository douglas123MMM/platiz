const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://vhgxevfrgnzbebffejnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM'
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
