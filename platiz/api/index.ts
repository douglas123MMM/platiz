// Global Dorado API - Vercel Serverless
import app from '../backend/src/index';
import streamRoutes from '../backend/src/routes/streamRoutes';
import streamController from '../backend/src/controllers/streamController';

app.use('/api/streams', streamRoutes);

// Ruta de prueba simple
app.get('/api/ping', (_req: any, res: any) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

export default app;
