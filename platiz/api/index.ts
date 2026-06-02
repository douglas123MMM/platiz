import app from '../backend/src/index';
import partnerRoutes from '../backend/src/routes/partnerRoutes';
import settingsRoutes from '../backend/src/routes/settingsRoutes';
app.use('/api/partners', partnerRoutes);
app.use('/api/settings', settingsRoutes);
export default app;

