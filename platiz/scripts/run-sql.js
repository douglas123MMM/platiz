const { Client } = require('pg');

(async () => {
  const sql = "ALTER TABLE store_products ADD COLUMN IF NOT EXISTS purchase_instructions TEXT DEFAULT '';";
  
  const client = new Client({
    host: '104.18.38.10',
    port: 6543,
    database: 'postgres',
    user: 'postgres',
    password: '1111112233334@#',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });
  
  try {
    console.log('Conectando...');
    await client.connect();
    console.log('CONECTADO');
    const res = await client.query(sql);
    console.log('OK:', res.command);
    await client.end();
  } catch (err) {
    console.log('Error:', err.message);
    try { await client.end(); } catch {}
  }
})();
