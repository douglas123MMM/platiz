import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getMyStore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('user_stores').select('*').eq('user_id', req.user!.id).maybeSingle();
    if (error) throw error;
    res.json(data || null);
  } catch {
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
}

export async function createStore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: existing } = await supabase.from('user_stores').select('id').eq('user_id', req.user!.id).maybeSingle();
    if (existing) { res.status(409).json({ error: 'Ya tenes una tienda' }); return; }

    const { store_name, slug, description, whatsapp, primary_color, accent_color, text_color, card_color, logo_url } = req.body;
    if (!slug) { res.status(400).json({ error: 'Slug requerido' }); return; }

    const slugLower = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data: slugExists } = await supabase.from('user_stores').select('id').eq('slug', slugLower).maybeSingle();
    if (slugExists) { res.status(409).json({ error: 'Ese link ya esta en uso' }); return; }

    const { data, error } = await supabase.from('user_stores').insert([{
      user_id: req.user!.id,
      store_name: store_name || 'Mi Tienda',
      slug: slugLower,
      description: description || '',
      whatsapp: whatsapp || '',
      primary_color: primary_color || '#0A0A0A',
      accent_color: accent_color || '#25D366',
      text_color: text_color || '#FFFFFF',
      card_color: card_color || '#1A1A2E',
      logo_url: logo_url || null
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (e: any) {
    if (e?.code === '23505') { res.status(409).json({ error: 'Link no disponible' }); return; }
    res.status(500).json({ error: 'Error al crear tienda' });
  }
}

export async function updateStore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: store } = await supabase.from('user_stores').select('id').eq('id', req.params.id).eq('user_id', req.user!.id).single();
    if (!store) { res.status(404).json({ error: 'Tienda no encontrada' }); return; }

    const { store_name, description, whatsapp, primary_color, accent_color, text_color, card_color, logo_url, is_active } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (store_name !== undefined) updates.store_name = store_name;
    if (description !== undefined) updates.description = description;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp;
    if (primary_color !== undefined) updates.primary_color = primary_color;
    if (accent_color !== undefined) updates.accent_color = accent_color;
    if (text_color !== undefined) updates.text_color = text_color;
    if (card_color !== undefined) updates.card_color = card_color;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase.from('user_stores').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar tienda' });
  }
}

export async function getStoreProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_products').select('*').eq('store_id', req.params.storeId).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

export async function createStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: store } = await supabase.from('user_stores').select('id').eq('id', req.params.storeId).eq('user_id', req.user!.id).single();
    if (!store) { res.status(404).json({ error: 'Tienda no encontrada' }); return; }

    const { name, description, price, image_url, category } = req.body;
    if (!name || price === undefined) { res.status(400).json({ error: 'Nombre y precio requeridos' }); return; }

    const { data, error } = await supabase.from('store_products').insert([{
      store_id: req.params.storeId,
      name,
      description: description || '',
      price: parseFloat(price) || 0,
      image_url: image_url || '',
      category: category || 'General'
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

export async function updateStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, price, image_url, category, is_active, sort_order } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (image_url !== undefined) updates.image_url = image_url;
    if (category !== undefined) updates.category = category;
    if (is_active !== undefined) updates.is_active = is_active;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabase.from('store_products').update(updates).eq('id', req.params.productId).eq('store_id', req.params.storeId).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

export async function deleteStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('store_products').delete().eq('id', req.params.productId).eq('store_id', req.params.storeId);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

export async function checkStoreSlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const slug = req.query.slug as string;
    if (!slug) { res.status(400).json({ error: 'Slug requerido' }); return; }
    const slugLower = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const { data } = await supabase.from('user_stores').select('id').eq('slug', slugLower).maybeSingle();
    res.json({ available: !data, slug: slugLower });
  } catch {
    res.status(500).json({ error: 'Error al verificar slug' });
  }
}

// Public endpoints
export async function getPublicStore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: store, error } = await supabase.from('user_stores').select('*').eq('slug', req.params.slug).eq('is_active', true).single();
    if (error || !store) { res.status(404).json({ error: 'Tienda no encontrada' }); return; }
    res.json(store);
  } catch {
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
}

export async function getPublicStoreProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: store } = await supabase.from('user_stores').select('id').eq('slug', req.params.slug).eq('is_active', true).single();
    if (!store) { res.status(404).json({ error: 'Tienda no encontrada' }); return; }

    const { data, error } = await supabase.from('store_products').select('*').eq('store_id', store.id).eq('is_active', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}
