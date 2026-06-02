const { Client } = require('pg');

async function main() {
  // Try multiple connection formats
  const configs = [
    { label: 'pooler-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres' },
    { label: 'pooler-2', host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: 'postgres' },
  ];

  for (const cfg of configs) {
    const client = new Client({
      host: cfg.host,
      port: cfg.port,
      database: 'postgres',
      user: cfg.user,
      password: '1111112233334@#',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      console.log(`Probando ${cfg.label}...`);
      await client.connect();
      console.log(`✓ Conectado (${cfg.label})`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`);
      await client.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;`);
      await client.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;`);
      await client.query(`CREATE TABLE IF NOT EXISTS streams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL, description TEXT, thumbnail_url TEXT,
        video_url TEXT NOT NULL, video_type TEXT, platform TEXT,
        active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
      );`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_streams_active ON streams(active);`);
      console.log('✓ Migraciones completadas');
      await client.end();
      return;
    } catch(e) {
      console.log(`  ✗ ${e.message}`);
      try { await client.end(); } catch {}
    }
  }
  console.log('\nNo se pudo conectar. Ejecuta manualmente en SQL Editor de Supabase.');
}
main();
