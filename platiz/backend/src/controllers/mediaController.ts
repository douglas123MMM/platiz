import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase } from '../utils/upload';

export async function getAllMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, type } = req.query;
    let query = supabase.from('media_contents').select('*').eq('active', 1).order('sort_order', { ascending: true });
    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);
    const { data } = await query;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllMediaAdmin(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('media_contents').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMediaByGenre(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { genre } = req.params;
    const { data } = await supabase.from('media_contents').select('*').eq('active', 1).eq('genre', genre).order('sort_order', { ascending: true });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, video_url, category, genre, type } = req.body;
    if (!title || !video_url) { res.status(400).json({ error: 'Title and video URL required' }); return; }
    const image_url = req.file ? await uploadToSupabase(req.file) : (req.body.image_url || null);
    const { data, error } = await supabase.from('media_contents').insert({
      title, video_url, image_url, category: category || 'General', genre: genre || 'General', type: type || 'movie',
    }).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Media created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('media_contents').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const { title, video_url, image_url, category, genre, type } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (video_url !== undefined) updates.video_url = video_url;
    if (image_url !== undefined) updates.image_url = image_url;
    if (category !== undefined) updates.category = category;
    if (genre !== undefined) updates.genre = genre;
    if (type !== undefined) updates.type = type;
    if (req.file) updates.image_url = await uploadToSupabase(req.file);
    await supabase.from('media_contents').update(updates).eq('id', id);
    res.json({ message: 'Media updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteMedia(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await supabase.from('media_contents').delete().eq('id', id);
    res.json({ message: 'Media deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function toggleMediaActive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('media_contents').select('active').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
    const newActive = existing.active ? 0 : 1;
    await supabase.from('media_contents').update({ active: newActive, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ message: 'Toggled', active: newActive });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
