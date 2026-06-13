import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'MISSING_JWT_SECRET';

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  header.split(';').forEach(c => {
    const idx = c.indexOf('=');
    if (idx > 0) cookies[c.substring(0, idx).trim()] = decodeURIComponent(c.substring(idx + 1).trim());
  });
  return cookies;
}

export interface AuthRequest extends Request {
  user?: { id: string; username: string; email: string; phone?: string; role: string; status: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies.token;
  const finalToken = token || cookieToken;
  if (!finalToken) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(finalToken, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export function requireApproved(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin' && req.user?.status !== 'approved') {
    res.status(403).json({ error: 'Account not approved yet' });
    return;
  }
  next();
}
