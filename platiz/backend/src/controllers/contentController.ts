import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase, deleteFromSupabase } from '../utils/upload';

export async function getCategories(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await supabase.from('items').select('*', { count: 'exact' }).eq('category_slug', slug).eq('active', 1).order('sort_order', { ascending: true }).order('created_at', { ascending: false }).range(from, to);

    res.json({ items: data || [], total: count || 0, page, limit, hasMore: (count || 0) > to + 1 });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllItems(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('items').select('*').order('category_slug').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getItemById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data } = await supabase.from('items').select('*').eq('id', id).maybeSingle();
    if (!data) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function searchItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      res.json([]);
      return;
    }
    const query = String(q).trim().replace(/\s+/g, '%');
    const { data } = await supabase
      .from('items')
      .select('*, categories!inner(name, icon)')
      .eq('active', 1)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    const mapped = (data || []).map((item: any) => ({
      ...item,
      category_name: item.categories?.name,
      category_icon: item.categories?.icon,
    }));
    res.json(mapped);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category_slug, title, description, link, video_url } = req.body;
    if (!category_slug || !title) {
      res.status(400).json({ error: 'Category slug and title are required' });
      return;
    }
    const image_url = req.file ? await uploadToSupabase(req.file) : null;

    const insertData: Record<string, any> = { category_slug, title, description, image_url, link };
    if (video_url) {
      const u = String(video_url).toLowerCase();
      if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) insertData.video_type = 'youtube';
      else if (u.includes('vimeo.com/')) insertData.video_type = 'vimeo';
      else if (u.includes('twitch.tv/')) insertData.video_type = 'twitch';
      else if (u.includes('drive.google.com/file/d/')) insertData.video_type = 'gdrive';
      else if (u.endsWith('.m3u8') || u.includes('.m3u8')) insertData.video_type = 'm3u8';
      else if ((u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.mkv') || u.includes('supabase.co/storage/v1/object/'))) insertData.video_type = 'direct';
      else insertData.video_type = 'iframe';
      insertData.video_url = video_url;
    }

    const { data, error } = await supabase.from('items').insert(insertData).select('id').single();

    if (error && (error.message.includes('video_url') || error.message.includes('video_type'))) {
      delete insertData.video_url;
      delete insertData.video_type;
      const { data: d2, error: e2 } = await supabase.from('items').insert(insertData).select('id').single();
      if (e2) throw e2;
      res.status(201).json({ message: 'Item created', id: d2.id });
      return;
    }
    if (error) throw error;
    res.status(201).json({ message: 'Item created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('items').select('id, video_url').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Item not found' }); return; }

    const { title, description, link, video_url } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link !== undefined) updates.link = link;
    if (video_url !== undefined) {
      updates.video_url = video_url;
      if (video_url) {
        const u = String(video_url).toLowerCase();
        if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) updates.video_type = 'youtube';
        else if (u.includes('vimeo.com/')) updates.video_type = 'vimeo';
        else if (u.includes('twitch.tv/')) updates.video_type = 'twitch';
        else if (u.includes('drive.google.com/file/d/')) updates.video_type = 'gdrive';
        else if (u.endsWith('.m3u8') || u.includes('.m3u8')) updates.video_type = 'm3u8';
        else if ((u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.mkv') || u.includes('supabase.co/storage/v1/object/'))) updates.video_type = 'direct';
        else updates.video_type = 'iframe';
      } else {
        updates.video_type = null;
      }
    }
    if (req.file) updates.image_url = await uploadToSupabase(req.file);

    const { error: updateError } = await supabase.from('items').update(updates).eq('id', id);
    if (updateError && (updateError.message.includes('video_url') || updateError.message.includes('video_type'))) {
      delete updates.video_url;
      delete updates.video_type;
      await supabase.from('items').update(updates).eq('id', id);
    }

    if (existing.video_url && video_url !== undefined && video_url !== existing.video_url) {
      deleteFromSupabase(existing.video_url).catch(() => {});
    }

    res.json({ message: 'Item updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('items').select('id, video_url').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Item not found' }); return; }

    if (existing.video_url) deleteFromSupabase(existing.video_url).catch(() => {});

    await supabase.from('items').delete().eq('id', id);
    res.json({ message: 'Item deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
