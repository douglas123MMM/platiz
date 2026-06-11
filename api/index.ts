import app from '../platiz/backend/src/index';
import partnerRoutes from '../platiz/backend/src/routes/partnerRoutes';
import settingsRoutes from '../platiz/backend/src/routes/settingsRoutes';
import membershipRoutes from '../platiz/backend/src/routes/membershipRoutes';
app.use('/api/partners', partnerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/memberships', membershipRoutes);
export default app;
