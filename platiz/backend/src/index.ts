import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models/database';
import authRoutes from './routes/authRoutes';
import contentRoutes from './routes/contentRoutes';
import bannerRoutes from './routes/bannerRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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
