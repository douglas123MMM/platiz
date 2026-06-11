import app from '../platiz/backend/src/index';
import partnerRoutes from '../platiz/backend/src/routes/partnerRoutes';
import settingsRoutes from '../platiz/backend/src/routes/settingsRoutes';
app.use('/api/partners', partnerRoutes);
app.use('/api/settings', settingsRoutes);
export default app;
