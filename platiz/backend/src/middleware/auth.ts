import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'platiz_super_secret_key';

export interface AuthRequest extends Request {
  user?: { id: string; username: string; email: string; phone?: string; role: string; status: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
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
