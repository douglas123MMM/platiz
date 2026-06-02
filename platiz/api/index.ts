// Global Dorado API - Vercel Serverless
import app from '../backend/src/index';
import streamRoutes from '../backend/src/routes/streamRoutes';
import { runMigrations } from '../backend/src/controllers/streamController';
import { authenticate, requireAdmin } from '../backend/src/middleware/auth';

import express from 'express';
const router = express.Router();
router.post('/api/setup-db', authenticate, requireAdmin, runMigrations);

app.use('/api/streams', streamRoutes);
app.use(router);

export default app;
