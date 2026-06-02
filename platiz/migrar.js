const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '2600:1f16:1482:9400:e98:82f:644c:b181',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '1111112233334@#',
    ssl: { rejectUnauthorized: false, servername: 'db.vhgxevfrgnzbebffejnz.supabase.co' },
    connectionTimeoutMillis: 10000,
    family: 6,
  });
  try {
    console.log('Conectando a IPv6 directa...');
    await client.connect();
    console.log('CONECTADO!');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;');
    console.log('phone OK');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
    console.log('video_url OK');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;');
    console.log('video_type OK');
    await client.end();
    console.log('\nMIGRACION COMPLETA!');
  } catch(e) {
    console.log('Error:', e.message);
    try { await client.end(); } catch {}
  }
}
main();
