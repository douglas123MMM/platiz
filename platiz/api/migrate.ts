import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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

    res.status(200).json({ ok: true, message: 'Migraciones ejecutadas' });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
