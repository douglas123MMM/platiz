import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error && error.message.includes('does not exist')) {
      res.json({ whatsapp: '', telegram: '', plr_guide: '' });
      return;
    }
    const settings = data || { whatsapp: '', telegram: '' };
    const { data: guide } = await supabase.from('items').select('description').eq('category_slug', 'settings').eq('title', 'guia_plr_pro').maybeSingle();
    res.json({ ...settings, plr_guide: guide?.description || '' });
  } catch {
    res.json({ whatsapp: '', telegram: '', plr_guide: '' });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whatsapp, telegram, plr_guide } = req.body;
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    if (existing) {
      await supabase.from('settings').update({ whatsapp, telegram, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ id: 1, whatsapp, telegram }).select('id').single();
    }
    if (plr_guide !== undefined) {
      const { data: guideItem } = await supabase.from('items').select('id').eq('category_slug', 'settings').eq('title', 'guia_plr_pro').maybeSingle();
      if (guideItem) {
        await supabase.from('items').update({ description: plr_guide, updated_at: new Date().toISOString() }).eq('id', guideItem.id);
      } else {
        await supabase.from('items').insert({
          category_slug: 'settings', title: 'guia_plr_pro', description: plr_guide,
          sort_order: 0, active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
      }
    }
    res.json({ message: 'Settings updated' });
  } catch (e: any) {
    if (e.message?.includes('does not exist')) {
      res.status(500).json({ error: 'La tabla settings no existe. Ejecuta el SQL de migracion.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
