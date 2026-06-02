import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase } from '../utils/upload';

export async function getPartners(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('partners').select('*').order('sort_order', { ascending: true });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getActivePartners(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('partners').select('*').eq('active', 1).order('sort_order', { ascending: true });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPartner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, role: partnerRole, link } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required' }); return; }
    const photo_url = req.file ? await uploadToSupabase(req.file) : null;
    const { data, error } = await supabase.from('partners').insert({ name, role: partnerRole, link, photo_url }).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Partner created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePartner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('partners').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Partner not found' }); return; }
    const { name, role: partnerRole, link } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (partnerRole !== undefined) updates.role = partnerRole;
    if (link !== undefined) updates.link = link;
    if (req.file) updates.photo_url = await uploadToSupabase(req.file);
    await supabase.from('partners').update(updates).eq('id', id);
    res.json({ message: 'Partner updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePartner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('partners').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Partner not found' }); return; }
    await supabase.from('partners').delete().eq('id', id);
    res.json({ message: 'Partner deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function togglePartnerActive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('partners').select('active').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Partner not found' }); return; }
    const newActive = existing.active ? 0 : 1;
    await supabase.from('partners').update({ active: newActive, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ message: `Partner ${newActive ? 'activated' : 'deactivated'}`, active: newActive });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getLandingVideos(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('streams').select('*').eq('show_on_landing', 1).eq('active', 1).order('sort_order', { ascending: true });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
