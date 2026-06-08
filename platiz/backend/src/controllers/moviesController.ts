import { Response, Request } from 'express';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7O1owhkBsPMCe4d-9lWLTTKTnIhnFHMygBK5RBz7leI8w_xmVNtEnhkMQH7naZOxEKroxvWQ-WpIx/pub?gid=816763313&single=true&output=csv';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

interface Movie {
  id: number;
  category: string;
  name: string;
  image: string;
  link: string;
  previewUrl: string;
  posterFallback: string;
}

let cachedMovies: Movie[] = [];
let lastFetch = 0;
const CACHE_TTL = 30 * 60 * 1000;

// TMDB key cache
let tmdbKey = '';
let tmdbKeyFetched = false;

function parseCSV(text: string): string[][] {
  if (!text) return [];
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows: string[][] = [];
  let cur: string[] = [];
  let val = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i + 1] === '"') { val += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { cur.push(val); val = ''; }
    else if ((c === '\n' || c === '\r') && !inQ) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      cur.push(val); rows.push(cur); cur = []; val = '';
    } else { val += c; }
  }
  if (val.length || cur.length) { cur.push(val); rows.push(cur); }
  return rows.filter(r => r.some(x => String(x || '').trim() !== ''));
}

function normalize(s: string): string {
  return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extractDriveId(url: string): string {
  const s = String(url || '');
  const m = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  const q = s.indexOf('id=');
  if (q !== -1) {
    const part = s.slice(q + 3);
    const amp = part.indexOf('&');
    return amp !== -1 ? part.slice(0, amp) : part;
  }
  return '';
}

function makePreviewUrl(url: string): string {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : '';
}

function buildImageUrl(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  // Already has a direct image URL
  if (s.startsWith('http') && !s.includes('drive.google.com')) return s;
  // Drive thumbnail
  if (s.includes('drive.google.com/thumbnail')) return s;
  // wsrv.nl proxy - keep as is
  if (s.includes('wsrv.nl')) return s;
  return s;
}

async function fetchTMDBPoster(name: string): Promise<string> {
  try {
    if (!tmdbKey) {
      if (!tmdbKeyFetched) {
        try {
          const { default: dotenv } = await import('dotenv');
          dotenv.config();
          const r = await fetch('https://platiz.vercel.app/api/settings');
          if (r.ok) {
            const d = await r.json();
            tmdbKey = d.tmdb_api_key || '';
          }
        } catch {}
        if (!tmdbKey) {
          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_ANON_KEY;
          if (supabaseUrl && supabaseKey) {
            try {
              const r = await fetch(`${supabaseUrl}/rest/v1/settings?select=tmdb_api_key`, {
                headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
              });
              if (r.ok) {
                const d = await r.json();
                tmdbKey = d[0]?.tmdb_api_key || '';
              }
            } catch {}
          }
        }
        tmdbKeyFetched = true;
      }
    }
    if (!tmdbKey) return '';

    const cleanName = name.replace(/^\d+\.\s*/, '').replace(/\s*\(.*$/, '').replace(/\s*Latino.*$/i, '').replace(/\s*Full HD.*$/i, '').replace(/\s*HD.*$/i, '').replace(/\s*4K.*$/i, '').replace(/\s*HDR.*$/i, '').replace(/\s*REMUX.*$/i, '').replace(/\s*\d{4}.*$/, '').replace(/\.mkv$/i, '').replace(/\.mp4$/i, '').trim();
    if (!cleanName || cleanName.length < 2) return '';

    const r = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&language=es&query=${encodeURIComponent(cleanName)}&page=1`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return '';
    const d = await r.json();
    if (d.results?.[0]?.poster_path) {
      return TMDB_IMG + d.results[0].poster_path;
    }
    return '';
  } catch {
    return '';
  }
}

async function fetchMovies(): Promise<Movie[]> {
  const now = Date.now();
  if (cachedMovies.length && now - lastFetch < CACHE_TTL) return cachedMovies;

  try {
    const res = await fetch(CSV_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return cachedMovies.length ? cachedMovies : [];
    const csvText = await res.text();
    const rows = parseCSV(csvText);
    if (rows.length < 2) return cachedMovies.length ? cachedMovies : [];

    const headers = rows[0].map(h => normalize(String(h || '')));
    const idxCat = headers.indexOf('categoria');
    const idxName = headers.indexOf('nombre');
    const idxImg = headers.indexOf('portada');
    const idxLink = headers.indexOf('link');

    const movies: Movie[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const name = idxName >= 0 ? String(r[idxName] || '').trim() : '';
      const image = buildImageUrl(idxImg >= 0 ? String(r[idxImg] || '').trim() : '');
      const link = idxLink >= 0 ? String(r[idxLink] || '').trim() : '';
      const category = idxCat >= 0 ? String(r[idxCat] || '').trim() : '';
      if (!name && !image && !link) continue;

      movies.push({
        id: i,
        category,
        name,
        image,
        link,
        previewUrl: makePreviewUrl(link),
        posterFallback: '',
      });
    }

    // Fetch TMDB posters for movies without valid images or with generic placeholders
    const genericId = '1b2mnLMdoipM2hnstIxlLf0Ne_1U0IwQy';
    const needPoster = movies.filter(m => {
      if (!m.image) return true;
      if (m.image.includes('google.com')) return true;
      if (m.image.includes(genericId)) return true;
      return false;
    });
    const batchSize = 20;
    for (let b = 0; b < Math.min(batchSize, needPoster.length); b++) {
      const m = needPoster[b];
      const poster = await fetchTMDBPoster(m.name);
      if (poster) {
        m.image = poster;
        m.posterFallback = poster;
      }
    }

    cachedMovies = movies;
    lastFetch = now;
    return movies;
  } catch {
    return cachedMovies.length ? cachedMovies : [];
  }
}

export async function getMovies(req: Request, res: Response): Promise<void> {
  try {
    const movies = await fetchMovies();
    const { q, cat } = req.query;
    let filtered = movies;
    if (cat && String(cat).trim()) {
      const catNorm = normalize(String(cat));
      filtered = filtered.filter(m => normalize(m.category) === catNorm);
    }
    if (q && String(q).trim()) {
      const qNorm = normalize(String(q));
      filtered = filtered.filter(m => normalize(m.name + ' ' + m.category).includes(qNorm));
    }
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50')) || 50));
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    res.json({
      total: filtered.length,
      page,
      hasMore: start + limit < filtered.length,
      items: paged.map(m => ({
        id: m.id,
        category: m.category,
        name: m.name,
        image: m.image || m.posterFallback || '',
        link: m.link,
        previewUrl: m.previewUrl,
      })),
      categories: [...new Set(movies.map(m => m.category).filter(Boolean))].sort(),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function refreshCache(_req: Request, res: Response): Promise<void> {
  cachedMovies = [];
  lastFetch = 0;
  const movies = await fetchMovies();
  res.json({ count: movies.length, message: 'Cache refrescada' });
}
