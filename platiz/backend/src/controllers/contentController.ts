import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase } from '../utils/upload';

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
    const { data } = await supabase.from('items').select('*').eq('category_slug', slug).eq('active', 1).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    res.json(data || []);
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

export async function searchItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      res.json([]);
      return;
    }
    const query = String(q).trim();
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
    const { category_slug, title, description, link } = req.body;
    if (!category_slug || !title) {
      res.status(400).json({ error: 'Category slug and title are required' });
      return;
    }
    const image_url = req.file ? await uploadToSupabase(req.file) : null;
    const { data, error } = await supabase.from('items').insert({ category_slug, title, description, image_url, link }).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Item created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('items').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Item not found' }); return; }

    const { title, description, link } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (link !== undefined) updates.link = link;
    if (req.file) updates.image_url = await uploadToSupabase(req.file);

    await supabase.from('items').update(updates).eq('id', id);
    res.json({ message: 'Item updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('items').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Item not found' }); return; }
    await supabase.from('items').delete().eq('id', id);
    res.json({ message: 'Item deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
