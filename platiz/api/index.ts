import app from '../backend/src/index';
import partnerRoutes from '../backend/src/routes/partnerRoutes';
app.use('/api/partners', partnerRoutes);
export default app;

