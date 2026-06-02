import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

function detectVideoType(url: string): { type: string; platform: string } {
  if (!url) return { type: 'unknown', platform: 'unknown' };
  const u = url.toLowerCase();
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) return { type: 'youtube', platform: 'YouTube' };
  if (u.includes('vimeo.com/')) return { type: 'vimeo', platform: 'Vimeo' };
  if (u.includes('twitch.tv/')) return { type: 'twitch', platform: 'Twitch' };
  if (u.includes('drive.google.com/file/d/')) return { type: 'gdrive', platform: 'Google Drive' };
  if (u.endsWith('.m3u8') || u.includes('.m3u8')) return { type: 'm3u8', platform: 'M3U8 Stream' };
  if (u.includes('buymeacoffee.com/') || u.includes('buyinet.com/')) return { type: 'iframe', platform: 'BuyMeACoffee' };
  return { type: 'iframe', platform: 'Embed' };
}

export async function getAllStreams(req: AuthRequest, res: Response): Promise<void> {
  try {
    const isAdmin = req.user?.role === 'admin';
    let query = supabase.from('streams').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (!isAdmin) query = query.eq('active', 1);
    const { data } = await query;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStream(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data } = await supabase.from('streams').select('*').eq('id', id).maybeSingle();
    if (!data) { res.status(404).json({ error: 'Stream not found' }); return; }
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createStream(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, thumbnail_url, video_url, show_on_landing } = req.body;
    if (!title || !video_url) {
      res.status(400).json({ error: 'Title and video URL are required' });
      return;
    }
    const { type, platform } = detectVideoType(video_url);
    const insertData: Record<string, any> = { title, description, thumbnail_url, video_url, video_type: type, platform };
    if (show_on_landing !== undefined) insertData.show_on_landing = show_on_landing === true || show_on_landing === 'true' || show_on_landing === 1 ? 1 : 0;
    const { data, error } = await supabase.from('streams').insert(insertData).select('id').single();
    if (error) throw error;
    res.status(201).json({ message: 'Stream created', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStream(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('streams').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Stream not found' }); return; }

    const { title, description, thumbnail_url, video_url, show_on_landing } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (show_on_landing !== undefined) updates.show_on_landing = show_on_landing === true || show_on_landing === 'true' || show_on_landing === 1 ? 1 : 0;
    if (video_url !== undefined) {
      updates.video_url = video_url;
      const { type, platform } = detectVideoType(video_url);
      updates.video_type = type;
      updates.platform = platform;
    }
    await supabase.from('streams').update(updates).eq('id', id);
    res.json({ message: 'Stream updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStream(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('streams').select('id').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Stream not found' }); return; }
    await supabase.from('streams').delete().eq('id', id);
    res.json({ message: 'Stream deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function toggleStreamActive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('streams').select('active').eq('id', id).maybeSingle();
    if (!existing) { res.status(404).json({ error: 'Stream not found' }); return; }
    const newActive = existing.active ? 0 : 1;
    await supabase.from('streams').update({ active: newActive, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ message: `Stream ${newActive ? 'activated' : 'deactivated'}`, active: newActive });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function globalSearch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') { res.json({ users: [], items: [], streams: [] }); return; }
    const term = `%${String(q).trim()}%`;

    const [usersRes, itemsRes, streamsRes] = await Promise.all([
      supabase.from('users').select('id, username, email, phone, role, status, created_at').or(`username.ilike.${term},email.ilike.${term},phone.ilike.${term}`).limit(10),
      supabase.from('items').select('*, categories!inner(name, icon)').eq('active', 1).or(`title.ilike.${term},description.ilike.${term}`).limit(10),
      supabase.from('streams').select('*').eq('active', 1).or(`title.ilike.${term},description.ilike.${term}`).limit(10),
    ]);

    const items = (itemsRes.data || []).map((item: any) => ({
      ...item,
      category_name: item.categories?.name,
      category_icon: item.categories?.icon,
    }));

    res.json({ users: usersRes.data || [], items, streams: streamsRes.data || [] });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function runMigrations(_req: AuthRequest, res: Response): Promise<void> {
  const pgHost = process.env.PG_HOST;
  const pgPass = process.env.PG_PASSWORD;
  if (!pgHost || !pgPass) { res.status(500).json({ ok: false, error: 'DB config not set' }); return; }
  try {
    const { Client } = require('pg');
    const client = new Client({ host: pgHost, port: 5432, database: 'postgres', user: 'postgres', password: pgPass, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
    await client.connect();
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;');
    await client.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;');
    await client.end();
    res.json({ message: 'Migraciones ejecutadas correctamente' });
  } catch (e: any) {
    res.status(500).json({ error: 'Error ejecutando migraciones', details: e.message });
  }
}
