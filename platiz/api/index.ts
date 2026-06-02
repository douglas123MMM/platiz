import app from '../backend/src/index';
import partnerRoutes from '../backend/src/routes/partnerRoutes';
import settingsRoutes from '../backend/src/routes/settingsRoutes';
import mediaRoutes from '../backend/src/routes/mediaRoutes';
app.use('/api/partners', partnerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
export default app;

