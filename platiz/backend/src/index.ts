import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models/database';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import bannerRoutes from './routes/bannerRoutes';
import aiRoutes from './routes/aiRoutes';
import streamRoutes from './routes/streamRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/streams', streamRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: 'v2.0', timestamp: new Date().toISOString() }));

app.post('/api/setup-db', async (_req, res) => {
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
    res.json({ ok: true, message: 'Migraciones ejecutadas' });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => console.log(`🚀 Platiz API running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('Failed to start:', e);
    app.listen(PORT, () => console.log(`⚠️ Platiz API running (DB might be unavailable)`));
  }
}

if (process.env.VERCEL !== '1') start();

export default app;
