import { Response, Request } from 'express';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7O1owhkBsPMCe4d-9lWLTTKTnIhnFHMygBK5RBz7leI8w_xmVNtEnhkMQH7naZOxEKroxvWQ-WpIx/pub?gid=816763313&single=true&output=csv';

interface Movie {
  id: number;
  category: string;
  name: string;
  image: string;
  link: string;
}

let cachedMovies: Movie[] = [];
let lastFetch = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

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
      const image = idxImg >= 0 ? String(r[idxImg] || '').trim() : '';
      const link = idxLink >= 0 ? String(r[idxLink] || '').trim() : '';
      const category = idxCat >= 0 ? String(r[idxCat] || '').trim() : '';

      if (!name && !image && !link) continue;
      movies.push({ id: i, category, name, image, link });
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
    res.json({ total: filtered.length, page, hasMore: start + limit < filtered.length, items: paged, categories: [...new Set(movies.map(m => m.category).filter(Boolean))].sort() });
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
