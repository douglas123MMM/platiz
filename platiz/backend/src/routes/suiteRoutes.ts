import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMyTenants, getTenantById, createTenant, updateTenant, deleteTenant, checkSlug,
  getTenantTools, toggleTenantTool,
  getTenantClients, createTenantClient, updateTenantClient, deleteTenantClient,
  getTenantServices, createTenantService, updateTenantService, deleteTenantService,
  getTenantProfessionals, createTenantProfessional, updateTenantProfessional, deleteTenantProfessional,
  getTenantBookings, createTenantBooking, updateTenantBooking, deleteTenantBooking,
  getTenantInvoices, createTenantInvoice, updateTenantInvoice, deleteTenantInvoice,
  getSuiteDashboardStats,
  getPublicTenantBySlug, getPublicTenantServices, getPublicTenantProfessionals, createPublicBooking
} from '../controllers/suiteController';

const router = Router();

router.get('/dashboard', authenticate, getSuiteDashboardStats);
router.get('/check-slug', authenticate, checkSlug);

router.get('/tenants', authenticate, getMyTenants);
router.post('/tenants', authenticate, createTenant);
router.get('/tenants/:id', authenticate, getTenantById);
router.put('/tenants/:id', authenticate, updateTenant);
router.delete('/tenants/:id', authenticate, deleteTenant);

router.get('/tenants/:tenantId/tools', authenticate, getTenantTools);
router.patch('/tenants/:tenantId/tools', authenticate, toggleTenantTool);

router.get('/tenants/:tenantId/clients', authenticate, getTenantClients);
router.post('/tenants/:tenantId/clients', authenticate, createTenantClient);
router.put('/tenants/:tenantId/clients/:clientId', authenticate, updateTenantClient);
router.delete('/tenants/:tenantId/clients/:clientId', authenticate, deleteTenantClient);

router.get('/tenants/:tenantId/services', authenticate, getTenantServices);
router.post('/tenants/:tenantId/services', authenticate, createTenantService);
router.put('/tenants/:tenantId/services/:serviceId', authenticate, updateTenantService);
router.delete('/tenants/:tenantId/services/:serviceId', authenticate, deleteTenantService);

router.get('/tenants/:tenantId/professionals', authenticate, getTenantProfessionals);
router.post('/tenants/:tenantId/professionals', authenticate, createTenantProfessional);
router.put('/tenants/:tenantId/professionals/:professionalId', authenticate, updateTenantProfessional);
router.delete('/tenants/:tenantId/professionals/:professionalId', authenticate, deleteTenantProfessional);

router.get('/tenants/:tenantId/bookings', authenticate, getTenantBookings);
router.post('/tenants/:tenantId/bookings', authenticate, createTenantBooking);
router.put('/tenants/:tenantId/bookings/:bookingId', authenticate, updateTenantBooking);
router.delete('/tenants/:tenantId/bookings/:bookingId', authenticate, deleteTenantBooking);

router.get('/tenants/:tenantId/invoices', authenticate, getTenantInvoices);
router.post('/tenants/:tenantId/invoices', authenticate, createTenantInvoice);
router.put('/tenants/:tenantId/invoices/:invoiceId', authenticate, updateTenantInvoice);
router.delete('/tenants/:tenantId/invoices/:invoiceId', authenticate, deleteTenantInvoice);

router.get('/public/:slug', getPublicTenantBySlug);
router.get('/public/:slug/services', getPublicTenantServices);
router.get('/public/:slug/professionals', getPublicTenantProfessionals);
router.post('/public/:slug/bookings', createPublicBooking);

export default router;
