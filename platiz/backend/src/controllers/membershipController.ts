import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getMemberships(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search } = req.query;
    let query = supabase.from('memberships').select('*').order('expiry_date', { ascending: true });
    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`client_name.ilike.${term},service.ilike.${term},account_email.ilike.${term},client_phone.ilike.${term}`);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' });
  }
}

export async function getMembershipById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('memberships').select('*').eq('id', req.params.id).single();
    if (error || !data) { res.status(404).json({ error: 'Membership not found' }); return; }
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function createMembership(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { service, account_email, account_password, profile, client_name, client_phone, purchase_date, expiry_date, status, cost } = req.body;
    if (!service || !account_email || !account_password || !client_name || !client_phone || !expiry_date) {
      res.status(400).json({ error: 'Todos los campos marcados son obligatorios' });
      return;
    }
    const phone = client_phone.replace(/[^\d+]/g, '').replace(/^0+/, '');
    if (phone.length < 8) { res.status(400).json({ error: 'Numero de telefono invalido' }); return; }
    const { data, error } = await supabase.from('memberships').insert([{
      service, account_email, account_password, profile: profile || 'Perfil 1',
      client_name, client_phone: phone, purchase_date: purchase_date || new Date().toISOString().split('T')[0],
      expiry_date, status: status || 'active', cost: parseFloat(cost) || 0
    }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateMembership(req: AuthRequest, res: Response): Promise<void> {
  try {
    const updates: Record<string, unknown> = {};
    const fields = ['service', 'account_email', 'account_password', 'profile', 'client_name', 'client_phone', 'purchase_date', 'expiry_date', 'status', 'cost'];
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (updates.client_phone) updates.client_phone = String(updates.client_phone).replace(/[^\d+]/g, '').replace(/^0+/, '');
    if (updates.cost !== undefined) updates.cost = parseFloat(updates.cost as string) || 0;
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('memberships').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function deleteMembership(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('memberships').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function sendReminder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('memberships').select('*').eq('id', req.params.id).single();
    if (error || !data) { res.status(404).json({ error: 'Membership not found' }); return; }
    const message = `Hola ${data.client_name}, te saludamos de tu proveedor de streaming. Te notificamos que tu membresia del servicio de ${data.service} ha vencido. Te gustaria renovarla para seguir disfrutando de tus pantallas? Quedamos atentos!`;
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${data.client_phone}?text=${encoded}`;
    res.json({ url: waUrl, phone: data.client_phone, message });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
