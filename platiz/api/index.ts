// Global Dorado API - Vercel Serverless
import app from '../backend/src/index';

// Test route
app.get('/api/ping2', (_req: any, res: any) => {
  res.json({ pong: true, version: 'v2' });
});

export default app;
