import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

export async function getSettings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle();
    if (error && error.message.includes('does not exist')) {
      res.json({ whatsapp: '', telegram: '' });
      return;
    }
    res.json(data || { whatsapp: '', telegram: '' });
  } catch {
    res.json({ whatsapp: '', telegram: '' });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whatsapp, telegram } = req.body;
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    if (existing) {
      await supabase.from('settings').update({ whatsapp, telegram, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ id: 1, whatsapp, telegram }).select('id').single();
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
