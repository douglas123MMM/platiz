import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './models/database';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import bannerRoutes from './routes/bannerRoutes';
import aiRoutes from './routes/aiRoutes';
import streamRoutes from './routes/streamRoutes';
import partnerRoutes from './routes/partnerRoutes';
import settingsRoutes from './routes/settingsRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import movieRoutes from './routes/movieRoutes';
import membershipRoutes from './routes/membershipRoutes';
import tmdbRoutes from './routes/tmdbRoutes';
import storeRoutes from './routes/storeRoutes';
import { streamVideo } from './controllers/videoController';
import { xtreamProxy, xtreamStream } from './controllers/xtreamController';
import { authenticate, requireAdmin } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({ windowMs: 60000, max: 100, message: { error: 'Too many requests' } });
app.use('/api', globalLimiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/store', storeRoutes);
app.get('/api/video/stream', streamVideo);
app.get('/api/xtream/proxy', xtreamProxy);
app.get('/api/xtream/stream', xtreamStream);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: 'v2.0', timestamp: new Date().toISOString() }));

app.post('/api/setup-db', authenticate, requireAdmin, async (_req, res) => {
  try {
    const pgHost = process.env.PG_HOST;
    const pgPass = process.env.PG_PASSWORD;
    if (!pgHost || !pgPass) { res.status(500).json({ ok: false, error: 'DB config not set' }); return; }
    const { Client } = require('pg');
    const client = new Client({
      host: pgHost, port: 5432, database: 'postgres', user: 'postgres',
      password: pgPass, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000,
    });
    await client.connect();
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
    await client.query(`CREATE TABLE IF NOT EXISTS memberships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service TEXT NOT NULL,
      account_email TEXT NOT NULL,
      account_password TEXT NOT NULL,
      profile TEXT NOT NULL DEFAULT 'Perfil 1',
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp TEXT;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link TEXT;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS movies_access BOOLEAN DEFAULT false;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_video_url TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_video_type TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS binance TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS pagomovil TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_group TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS binance_pay_id TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS binance_pay_email TEXT;');
    await client.query('ALTER TABLE settings ADD COLUMN IF NOT EXISTS binance_pay_qr TEXT;');
    await client.query(`CREATE TABLE IF NOT EXISTS referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      activated_at TIMESTAMPTZ,
      UNIQUE(referred_user_id)
    );`);
    await client.query(`UPDATE users SET referral_code = SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 10) WHERE referral_code IS NULL;`);
    await client.query('ALTER TABLE streams ADD COLUMN IF NOT EXISTS show_on_landing INTEGER DEFAULT 0;');
    await client.query(`CREATE TABLE IF NOT EXISTS partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL, role TEXT, photo_url TEXT, link TEXT,
      active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    await client.query(`CREATE TABLE IF NOT EXISTS store_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category TEXT NOT NULL CHECK (category IN ('Streaming','Creatividad','Diseno Grafico','Edicion de Videos','Herramientas','Antivirus','Oficina','Licencia','Monedas de Juegos','Redes Sociales')),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      terms TEXT DEFAULT '',
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      image_url TEXT DEFAULT '',
      support_number TEXT DEFAULT '',
      delivery_email TEXT DEFAULT '',
      delivery_password TEXT DEFAULT '',
      stock INTEGER DEFAULT 0,
      account_type TEXT DEFAULT 'permanente' CHECK (account_type IN ('temporal','permanente')),
      duration_days INTEGER DEFAULT 0,
      delivery_type TEXT DEFAULT 'manual' CHECK (delivery_type IN ('automatica','manual')),
      renewable BOOLEAN DEFAULT false,
      vendor_name TEXT DEFAULT '',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    await client.query(`CREATE TABLE IF NOT EXISTS store_purchases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      product_id UUID REFERENCES store_products(id),
      product_title TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    await client.query(`CREATE TABLE IF NOT EXISTS store_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      type TEXT NOT NULL CHECK (type IN ('purchase','recharge','refund')),
      amount DECIMAL(10,2) NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'completed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`);
    await client.query('ALTER TABLE store_transactions ADD COLUMN IF NOT EXISTS proof_image TEXT;');
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
