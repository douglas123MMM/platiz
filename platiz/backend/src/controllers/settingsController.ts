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
    const settings = data || { whatsapp: '', telegram: '', binance: '', pagomovil: '', whatsapp_group: '' };
    const { data: guideItems } = await supabase.from('items').select('title,description').eq('category_slug', 'settings').in('title', ['guia_plr_pro', 'guia_services', 'guia_telegram', 'bcv_rate']);
    const guias: Record<string, string> = {};
    let bcv_rate = '';
    if (guideItems) guideItems.forEach((g: any) => {
      if (g.title === 'bcv_rate') bcv_rate = g.description || '';
      else guias[g.title] = g.description || '';
    });
    res.json({ ...settings, bcv_rate, guias });
  } catch {
    res.json({ whatsapp: '', telegram: '', guias: {} });
  }
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { whatsapp, telegram, binance, pagomovil, whatsapp_group, bcv_rate, iptv_m3u_url, binance_pay_id, binance_pay_email, binance_pay_qr, guias } = req.body;
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    const updateData: any = { whatsapp, telegram, updated_at: new Date().toISOString() };
    if (iptv_m3u_url !== undefined) updateData.iptv_m3u_url = iptv_m3u_url;
    if (binance !== undefined) updateData.binance = binance;
    if (pagomovil !== undefined) updateData.pagomovil = pagomovil;
    if (whatsapp_group !== undefined) updateData.whatsapp_group = whatsapp_group;
    if (binance_pay_id !== undefined) updateData.binance_pay_id = binance_pay_id;
    if (binance_pay_email !== undefined) updateData.binance_pay_email = binance_pay_email;
    if (binance_pay_qr !== undefined) updateData.binance_pay_qr = binance_pay_qr;
    if (existing) {
      await supabase.from('settings').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ id: 1, ...updateData }).select('id').single();
    }
    if (bcv_rate !== undefined) {
      const { data: rateItem } = await supabase.from('items').select('id').eq('category_slug', 'settings').eq('title', 'bcv_rate').maybeSingle();
      if (rateItem) {
        await supabase.from('items').update({ description: bcv_rate, updated_at: new Date().toISOString() }).eq('id', rateItem.id);
      } else {
        await supabase.from('items').insert({
          category_slug: 'settings', title: 'bcv_rate', description: bcv_rate,
          sort_order: 0, active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        });
      }
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

export async function uploadBinanceQR(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: 'Invalid image format. Use base64 data URL.' });
      return;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `binance_qr_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('public')
      .upload(`payments/${filename}`, buffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) {
      console.error('Storage error, using base64 fallback:', error.message);
      const imageUrl = `data:image/${ext};base64,${base64Data}`;

      await supabase.from('settings').upsert({
        id: 1,
        binance_pay_qr: imageUrl,
        updated_at: new Date().toISOString(),
      });

      res.json({ success: true, url: imageUrl });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(`payments/${filename}`);

    const imageUrl = urlData?.publicUrl || '';

    const { data: existingSettings } = await supabase.from('settings').select('id').limit(1).maybeSingle();
    if (existingSettings) {
      await supabase.from('settings').update({ binance_pay_qr: imageUrl }).eq('id', existingSettings.id);
    } else {
      await supabase.from('settings').insert({ binance_pay_qr: imageUrl });
    }

    res.json({ success: true, url: imageUrl });
  } catch (e: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
