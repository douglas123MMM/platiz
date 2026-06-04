import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email and password are required' });
      return;
    }
    if (!phone) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const { data: existing } = await supabase.from('users').select('id').or(`email.eq.${email},username.eq.${username}`).maybeSingle();
    if (existing) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData: Record<string, any> = { username, email, password: hashedPassword, role: 'client', status: 'pending' };
    if (phone) userData.phone = phone;

    const { data, error } = await supabase.from('users').insert(userData).select('id').single();

    if (error) {
      if (error.message.includes('phone')) {
        delete userData.phone;
        const { data: d2, error: e2 } = await supabase.from('users').insert(userData).select('id').single();
        if (e2) throw e2;
        res.status(201).json({ message: 'Registration successful. Wait for admin approval.', id: d2.id });
        return;
      }
      throw error;
    }
    res.status(201).json({ message: 'Registration successful. Wait for admin approval.', id: data.id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.status === 'pending') { res.status(403).json({ error: 'Account pending approval' }); return; }
    if (user.status === 'rejected') { res.status(403).json({ error: 'Account rejected' }); return; }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, phone: user.phone, role: user.role, status: user.status },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, phone: user.phone || null, role: user.role, status: user.status, avatar: user.avatar } });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: user, error } = await supabase.from('users').select('id, username, email, phone, role, status, avatar, created_at').eq('id', req.user?.id).maybeSingle();
    if (error && error.message.includes('phone')) {
      const { data: u2 } = await supabase.from('users').select('id, username, email, role, status, avatar, created_at').eq('id', req.user?.id).maybeSingle();
      if (!u2) { res.status(404).json({ error: 'User not found' }); return; }
      res.json({ ...u2, phone: null });
      return;
    }
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search } = req.query;
    let query = supabase.from('users').select('id, username, email, phone, role, status, avatar, created_at').order('created_at', { ascending: false });
    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      query = query.or(`username.ilike.${term},email.ilike.${term}`);
    }
    const { data: users, error } = await query;
    if (error && error.message.includes('phone')) {
      const { data: u2 } = await supabase.from('users').select('id, username, email, role, status, avatar, created_at').order('created_at', { ascending: false });
      res.json(u2 || []);
      return;
    }
    res.json(users || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    await supabase.from('users').update({ status }).eq('id', id);
    res.json({ message: 'User status updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function adminResetPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    await supabase.from('users').update({ password: hashed }).eq('id', id);
    res.json({ message: 'Password updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
