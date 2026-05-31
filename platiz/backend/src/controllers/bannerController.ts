import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase } from '../utils/upload';

export async function getBanners(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('banners').select('*').eq('active', 1).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllBanners(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('banners').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, link } = req.body;
    if (!title) { res.status(400).json({ error: 'Title is required' }); return; }
    const image_url = req.file ? await uploadToSupabase(req.file) : null;
    const { data, error } = await supabase.from('banners').insert({ title, description, image_url, link }).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Banner created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('banners').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Banner not found' }); return; }

    const { title, description, link, active } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link !== undefined) updates.link = link;
    if (active !== undefined) updates.active = active ? 1 : 0;
    if (req.file) updates.image_url = await uploadToSupabase(req.file);

    await supabase.from('banners').update(updates).eq('id', id);
    res.json({ message: 'Banner updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('banners').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Banner not found' }); return; }
    await supabase.from('banners').delete().eq('id', id);
    res.json({ message: 'Banner deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
