const { Client } = require('pg');

async function main() {
  const configs = [
    // Try with explicit IPv6 address
    { host: '2600:1f16:1482:9400:e98:82f:644c:b181', port: 5432, family: 6 },
    // Try pooler with IPv4
    { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, family: 4 },
    // Try direct with family 6 
    { host: 'db.vhgxevfrgnzbebffejnz.supabase.co', port: 5432, family: 6 },
    // Try direct with family 0 (any)
    { host: 'db.vhgxevfrgnzbebffejnz.supabase.co', port: 5432, family: 0 },
  ];

  for (const cfg of configs) {
    const client = new Client({
      host: cfg.host,
      port: cfg.port,
      database: 'postgres',
      user: 'postgres',
      password: '1111112233334@#',
      family: cfg.family,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });
    try {
      console.log(`Probando ${cfg.host}:${cfg.port} (family ${cfg.family})...`);
      await client.connect();
      console.log('✓ Conectado!');

      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;');
      console.log('✓ phone');
      await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
      console.log('✓ video_url');
      await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;');
      console.log('✓ video_type');

      const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='phone';");
      console.log(`\nVerificacion phone: ${r.rows.length > 0 ? 'EXISTE' : 'NO'}`);

      await client.end();
      console.log('\n✅ MIGRACION COMPLETA');
      return;
    } catch(e) {
      console.log(`  ✗ ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
  console.log('\n❌ No se pudo conectar. Usando Plan B...');
  await planB();
}

async function planB() {
  const { execSync } = require('child_process');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');
  
  console.log('Creando funcion SQL exec...');
  const { data, error } = await supabase.rpc('exec_sql', { query: "SELECT 1" });
  console.log('rpc test:', error ? error.message : 'OK');
}
main();
