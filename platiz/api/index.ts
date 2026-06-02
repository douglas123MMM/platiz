// Global Dorado API - Vercel Serverless
import app from '../backend/src/index';

app.post('/api/migrate', async (_req: any, res: any) => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      host: 'db.vhgxevfrgnzbebffejnz.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: '1111112233334@#',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
    await client.connect();
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;');
    await client.end();
    res.json({ ok: true, message: 'Migraciones ejecutadas correctamente' });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default app;
