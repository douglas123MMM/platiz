import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../models/database';

export const tmdbLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many TMDB requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function getTMDBKey(): Promise<string> {
  try {
    const { data } = await supabase.from('settings').select('tmdb_api_key').single();
    if (data?.tmdb_api_key) return data.tmdb_api_key;
  } catch {}
  return process.env.TMDB_API_KEY || '';
}

export async function proxyTMDB(req: Request, res: Response): Promise<void> {
  try {
    const apiKey = await getTMDBKey();
    if (!apiKey) {
      res.status(500).json({ error: 'TMDB API key not configured' });
      return;
    }

    const tmdbPath = (req.params[0] || req.path).replace(/^\/+/, '');

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'api_key' && value !== undefined) {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();

    const tmdbUrl = `https://api.themoviedb.org/3/${tmdbPath}?api_key=${apiKey}${qs ? '&' + qs : ''}`;

    const response = await fetch(tmdbUrl, {
      headers: { 'User-Agent': 'Platiz/1.0', Accept: 'application/json' },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
