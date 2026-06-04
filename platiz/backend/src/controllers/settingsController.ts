import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error && error.message.includes('does not exist')) {
      res.json({ whatsapp: '', telegram: '', guias: {} });
      return;
    }
    const settings = data || { whatsapp: '', telegram: '' };
    const { data: guideItems } = await supabase.from('items').select('title,description').eq('category_slug', 'settings').in('title', ['guia_plr_pro', 'guia_services', 'guia_telegram']);
    const guias: Record<string, string> = {};
    if (guideItems) guideItems.forEach((g: any) => { guias[g.title] = g.description || ''; });
    res.json({ ...settings, guias });
  } catch {
    res.json({ whatsapp: '', telegram: '', guias: {} });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whatsapp, telegram, bcv_rate, guias } = req.body;
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    if (existing) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (whatsapp !== undefined) updates.whatsapp = whatsapp;
      if (telegram !== undefined) updates.telegram = telegram;
      if (bcv_rate !== undefined) updates.bcv_rate = bcv_rate;
      await supabase.from('settings').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ id: 1, whatsapp, telegram, bcv_rate }).select('id').single();
    }
    if (guias && typeof guias === 'object') {
      for (const [key, text] of Object.entries(guias)) {
        const { data: item } = await supabase.from('items').select('id').eq('category_slug', 'settings').eq('title', key).maybeSingle();
        if (item) {
          await supabase.from('items').update({ description: text, updated_at: new Date().toISOString() }).eq('id', item.id);
        } else {
          await supabase.from('items').insert({
            category_slug: 'settings', title: key, description: text,
            sort_order: 0, active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          });
        }
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
