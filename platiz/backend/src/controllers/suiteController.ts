import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

// ============================================================
// TENANTS
// ============================================================

export async function getMyTenants(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('tenant_suite')
      .select('*')
      .eq('owner_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener tenants' });
  }
}

export async function getTenantById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('tenant_suite')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', req.user!.id)
      .single();
    if (error || !data) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al obtener tenant' });
  }
}

export async function createTenant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, slug, subdomain, custom_domain, logo_url, primary_color, secondary_color, accent_color, plan_type, tools } = req.body;

    if (!name || !slug) { res.status(400).json({ error: 'Nombre y slug son obligatorios' }); return; }

    const slugLower = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data: existing } = await supabase.from('tenant_suite').select('id').eq('slug', slugLower).maybeSingle();
    if (existing) { res.status(409).json({ error: 'El slug ya esta en uso' }); return; }

    const { data, error } = await supabase.from('tenant_suite').insert([{
      owner_id: req.user!.id,
      name,
      slug: slugLower,
      subdomain: subdomain || `${slugLower}.suite.globalservicex.com`,
      custom_domain: custom_domain || null,
      logo_url: logo_url || null,
      primary_color: primary_color || '#0A0A0A',
      secondary_color: secondary_color || '#D4AF37',
      accent_color: accent_color || '#FFFFFF',
      plan_type: plan_type || 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }]).select().single();

    if (error) throw error;

    const toolsList = Array.isArray(tools) ? tools : ['booking'];
    const toolInserts = toolsList.map((slug: string) => ({
      tenant_id: data.id,
      tool_slug: slug,
      config: {}
    }));
    await supabase.from('tenant_tools').insert(toolInserts);

    res.status(201).json(data);
  } catch (e: any) {
    if (e?.code === '23505') { res.status(409).json({ error: 'Slug o subdominio ya existe' }); return; }
    res.status(500).json({ error: 'Error al crear tenant' });
  }
}

export async function updateTenant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id,owner_id').eq('id', req.params.id).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const { name, slug, subdomain, custom_domain, logo_url, primary_color, secondary_color, accent_color, is_active } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (subdomain !== undefined) updates.subdomain = subdomain;
    if (custom_domain !== undefined) updates.custom_domain = custom_domain;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (secondary_color !== undefined) updates.secondary_color = secondary_color;
    if (accent_color !== undefined) updates.accent_color = accent_color;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase.from('tenant_suite').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar tenant' });
  }
}

export async function deleteTenant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_suite').delete().eq('id', req.params.id).eq('owner_id', req.user!.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar tenant' });
  }
}

export async function checkSlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const slug = req.query.slug as string;
    if (!slug) { res.status(400).json({ error: 'Slug requerido' }); return; }
    const slugLower = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const { data } = await supabase.from('tenant_suite').select('id').eq('slug', slugLower).maybeSingle();
    res.json({ available: !data, slug: slugLower });
  } catch {
    res.status(500).json({ error: 'Error al verificar slug' });
  }
}

// ============================================================
// TOOLS
// ============================================================

export async function getTenantTools(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('id', req.params.tenantId).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const { data, error } = await supabase.from('tenant_tools').select('*').eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener herramientas' });
  }
}

export async function toggleTenantTool(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('id', req.params.tenantId).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const { tool_slug, is_active } = req.body;
    const { data, error } = await supabase.from('tenant_tools').update({ is_active, updated_at: new Date().toISOString() }).eq('tenant_id', req.params.tenantId).eq('tool_slug', tool_slug).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar herramienta' });
  }
}

// ============================================================
// CLIENTS
// ============================================================

export async function getTenantClients(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('id', req.params.tenantId).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const search = req.query.search as string | undefined;
    let query = supabase.from('tenant_clients').select('*').eq('tenant_id', req.params.tenantId).order('created_at', { ascending: false });

    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
}

export async function createTenantClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('id', req.params.tenantId).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const { name, email, phone, company, notes, tags } = req.body;
    if (!name) { res.status(400).json({ error: 'Nombre requerido' }); return; }

    const { data, error } = await supabase.from('tenant_clients').insert([{
      tenant_id: req.params.tenantId, name, email: email || null, phone: phone || null,
      company: company || null, notes: notes || null, tags: tags || []
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear cliente' });
  }
}

export async function updateTenantClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('id', req.params.tenantId).eq('owner_id', req.user!.id).single();
    if (!tenant) { res.status(404).json({ error: 'Tenant no encontrado' }); return; }

    const { name, email, phone, company, notes, tags } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (notes !== undefined) updates.notes = notes;
    if (tags !== undefined) updates.tags = tags;

    const { data, error } = await supabase.from('tenant_clients').update(updates).eq('id', req.params.clientId).eq('tenant_id', req.params.tenantId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
}

export async function deleteTenantClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_clients').delete().eq('id', req.params.clientId).eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
}

// ============================================================
// SERVICES
// ============================================================

export async function getTenantServices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('tenant_services').select('*').eq('tenant_id', req.params.tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
}

export async function createTenantService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, price, duration_minutes } = req.body;
    if (!name) { res.status(400).json({ error: 'Nombre requerido' }); return; }

    const { data, error } = await supabase.from('tenant_services').insert([{
      tenant_id: req.params.tenantId, name, description: description || null,
      price: price || 0, duration_minutes: duration_minutes || 60
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear servicio' });
  }
}

export async function updateTenantService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, price, duration_minutes, is_active } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase.from('tenant_services').update(updates).eq('id', req.params.serviceId).eq('tenant_id', req.params.tenantId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
}

export async function deleteTenantService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_services').delete().eq('id', req.params.serviceId).eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
}

// ============================================================
// PROFESSIONALS
// ============================================================

export async function getTenantProfessionals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('tenant_professionals').select('*').eq('tenant_id', req.params.tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
}

export async function createTenantProfessional(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, specialty, email, phone } = req.body;
    if (!name) { res.status(400).json({ error: 'Nombre requerido' }); return; }

    const { data, error } = await supabase.from('tenant_professionals').insert([{
      tenant_id: req.params.tenantId, name, specialty: specialty || null,
      email: email || null, phone: phone || null
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear profesional' });
  }
}

export async function updateTenantProfessional(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, specialty, email, phone, is_active } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (specialty !== undefined) updates.specialty = specialty;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase.from('tenant_professionals').update(updates).eq('id', req.params.professionalId).eq('tenant_id', req.params.tenantId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar profesional' });
  }
}

export async function deleteTenantProfessional(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_professionals').delete().eq('id', req.params.professionalId).eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar profesional' });
  }
}

// ============================================================
// BOOKINGS
// ============================================================

export async function getTenantBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { date, status } = req.query;
    let query = supabase.from('tenant_bookings').select('*').eq('tenant_id', req.params.tenantId).order('date', { ascending: false }).order('time', { ascending: true });

    if (date) query = query.eq('date', date);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
}

export async function createTenantBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { service, service_price, professional, date, time, duration_minutes, notes, client_name, client_email, client_phone, service_id, professional_id, client_id } = req.body;

    if (!service || !date || !time) {
      res.status(400).json({ error: 'Servicio, fecha y hora son obligatorios' });
      return;
    }

    const { data, error } = await supabase.from('tenant_bookings').insert([{
      tenant_id: req.params.tenantId,
      client_id: client_id || null,
      service_id: service_id || null,
      professional_id: professional_id || null,
      service,
      service_price: service_price || 0,
      professional: professional || null,
      date,
      time,
      duration_minutes: duration_minutes || 60,
      notes: notes || null,
      client_name: client_name || null,
      client_email: client_email || null,
      client_phone: client_phone || null,
      status: 'pending'
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear cita' });
  }
}

export async function updateTenantBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, notes, date, time, service_id, professional_id } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (service_id !== undefined) updates.service_id = service_id;
    if (professional_id !== undefined) updates.professional_id = professional_id;

    const { data, error } = await supabase.from('tenant_bookings').update(updates).eq('id', req.params.bookingId).eq('tenant_id', req.params.tenantId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar cita' });
  }
}

export async function deleteTenantBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_bookings').delete().eq('id', req.params.bookingId).eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
}

// ============================================================
// INVOICES
// ============================================================

export async function getTenantInvoices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('tenant_invoices').select('*').eq('tenant_id', req.params.tenantId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
}

export async function createTenantInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { client_id, issue_date, due_date, subtotal, tax, total, status, invoice_number } = req.body;
    if (!subtotal || !total) { res.status(400).json({ error: 'Subtotal y total requeridos' }); return; }

    const { data: lastInvoice } = await supabase.from('tenant_invoices').select('invoice_number').eq('tenant_id', req.params.tenantId).order('created_at', { ascending: false }).limit(1).maybeSingle();

    const lastNum = lastInvoice ? parseInt(lastInvoice.invoice_number.split('-').pop() || '0') : 0;
    const invNumber = invoice_number || `INV-${String(lastNum + 1).padStart(4, '0')}`;

    const { data, error } = await supabase.from('tenant_invoices').insert([{
      tenant_id: req.params.tenantId,
      client_id: client_id || null,
      invoice_number: invNumber,
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal, tax: tax || 0, total,
      status: status || 'draft'
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear factura' });
  }
}

export async function updateTenantInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, issue_date, due_date, subtotal, tax, total } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (issue_date !== undefined) updates.issue_date = issue_date;
    if (due_date !== undefined) updates.due_date = due_date;
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (tax !== undefined) updates.tax = tax;
    if (total !== undefined) updates.total = total;

    const { data, error } = await supabase.from('tenant_invoices').update(updates).eq('id', req.params.invoiceId).eq('tenant_id', req.params.tenantId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
}

export async function deleteTenantInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('tenant_invoices').delete().eq('id', req.params.invoiceId).eq('tenant_id', req.params.tenantId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar factura' });
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getSuiteDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const [{ count: totalTenants }, { count: activeTenants }] = await Promise.all([
      supabase.from('tenant_suite').select('*', { count: 'exact', head: true }).eq('owner_id', userId),
      supabase.from('tenant_suite').select('*', { count: 'exact', head: true }).eq('owner_id', userId).eq('is_active', true),
    ]);

    const tenantIds = await supabase.from('tenant_suite').select('id').eq('owner_id', userId);
    const ids = (tenantIds.data || []).map((t: any) => t.id);

    let totalClients = 0;
    let bookingsThisMonth = 0;

    if (ids.length > 0) {
      const [{ count: clientsCount }, { count: bookingsCount }] = await Promise.all([
        supabase.from('tenant_clients').select('*', { count: 'exact', head: true }).in('tenant_id', ids),
        supabase.from('tenant_bookings').select('*', { count: 'exact', head: true }).in('tenant_id', ids).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);
      totalClients = clientsCount || 0;
      bookingsThisMonth = bookingsCount || 0;
    }

    res.json({
      active_tenants: activeTenants || 0,
      total_tenants: totalTenants || 0,
      total_clients: totalClients,
      bookings_this_month: bookingsThisMonth,
      revenue_this_month: 0
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener estadisticas' });
  }
}

// ============================================================
// PUBLIC TENANT LANDING (sin auth)
// ============================================================

export async function getPublicTenantBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('tenant_suite')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single();
    if (error || !data) { res.status(404).json({ error: 'Pagina no encontrada' }); return; }

    res.json({
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      accent_color: data.accent_color,
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener pagina publica' });
  }
}

export async function getPublicTenantServices(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('slug', _req.params.slug).eq('is_active', true).single();
    if (!tenant) { res.status(404).json({ error: 'Pagina no encontrada' }); return; }

    const { data, error } = await supabase.from('tenant_services').select('*').eq('tenant_id', tenant.id).eq('is_active', true);
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
}

export async function getPublicTenantProfessionals(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('slug', _req.params.slug).eq('is_active', true).single();
    if (!tenant) { res.status(404).json({ error: 'Pagina no encontrada' }); return; }

    const { data, error } = await supabase.from('tenant_professionals').select('*').eq('tenant_id', tenant.id).eq('is_active', true);
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener profesionales' });
  }
}

export async function createPublicBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: tenant } = await supabase.from('tenant_suite').select('id').eq('slug', req.params.slug).eq('is_active', true).single();
    if (!tenant) { res.status(404).json({ error: 'Pagina no encontrada' }); return; }

    const { service, date, time, client_name, client_email, client_phone, notes, service_id, professional_id } = req.body;
    if (!service || !date || !time) { res.status(400).json({ error: 'Servicio, fecha y hora son obligatorios' }); return; }

    const { data, error } = await supabase.from('tenant_bookings').insert([{
      tenant_id: tenant.id,
      service_id: service_id || null,
      professional_id: professional_id || null,
      service,
      date,
      time,
      client_name: client_name || null,
      client_email: client_email || null,
      client_phone: client_phone || null,
      notes: notes || null,
      status: 'pending'
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al agendar cita' });
  }
}
