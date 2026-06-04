import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

// Dashboard del afiliado
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // Perfil del usuario
    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, phone, display_name, whatsapp, telegram_link, avatar, credits, referral_code, created_at')
      .eq('id', userId).single();

    // Referidos
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, status, created_at, activated_at, referred_user:referred_user_id(id, username, email, phone, created_at)')
      .eq('affiliate_id', userId)
      .order('created_at', { ascending: false });

    // Conteos
    const total = referrals?.length || 0;
    const pendientes = referrals?.filter((r: any) => r.status === 'pending').length || 0;
    const activos = referrals?.filter((r: any) => r.status === 'active').length || 0;

    res.json({
      profile: user,
      referrals: referrals || [],
      stats: { total, pendientes, activos },
      links: {
        landing: `/landing/${user?.referral_code}`,
        catalog: `/catalogo/${user?.referral_code}`,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Actualizar perfil de afiliado
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { display_name, whatsapp, telegram_link } = req.body;

    const updates: Record<string, any> = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp;
    if (telegram_link !== undefined) updates.telegram_link = telegram_link;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    await supabase.from('users').update(updates).eq('id', userId);
    res.json({ message: 'Perfil actualizado' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Aprobar un referido (consume 1 crédito)
export async function approveReferral(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { referralId } = req.params;

    // Verificar créditos del afiliado
    const { data: user } = await supabase
      .from('users').select('credits').eq('id', userId).single();

    if (!user || user.credits <= 0) {
      res.status(400).json({ error: 'No tienes créditos. Compra más licencias al administrador.' });
      return;
    }

    // Verificar que el referido existe y es del afiliado
    const { data: referral } = await supabase
      .from('referrals').select('*').eq('id', referralId).eq('affiliate_id', userId).eq('status', 'pending').single();

    if (!referral) {
      res.status(404).json({ error: 'Referido no encontrado o ya activado' });
      return;
    }

    // Descontar crédito, activar referido, aprobar usuario
    const { error: deductError } = await supabase
      .from('users').update({ credits: user.credits - 1 }).eq('id', userId);
    if (deductError) throw deductError;

    const { error: refError } = await supabase
      .from('referrals').update({ status: 'active', activated_at: new Date().toISOString() }).eq('id', referralId);
    if (refError) throw refError;

    // Aprobar al usuario referido
    await supabase.from('users').update({ status: 'approved' }).eq('id', referral.referred_user_id);

    res.json({ message: 'Afiliado activado exitosamente', credits_remaining: user.credits - 1 });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Landing pública - info del afiliado + video global
export async function getLanding(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    const { data: user } = await supabase
      .from('users')
      .select('display_name, avatar, referral_code')
      .eq('referral_code', code).single();

    if (!user) {
      res.status(404).json({ error: 'Afiliado no encontrado' });
      return;
    }

    // Video global de landing
    const { data: settings } = await supabase
      .from('settings')
      .select('landing_video_url, landing_video_type')
      .maybeSingle();

    res.json({
      affiliate: user,
      video: settings,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Catálogo público - items + perfil del afiliado
export async function getCatalog(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: items } = await supabase
      .from('items')
      .select('id, category_slug, title, description, image_url, link, video_url, sort_order')
      .eq('active', 1)
      .order('sort_order', { ascending: true });

    res.json(items || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Registro vía enlace de afiliado
export async function registerWithReferral(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, email, password, phone, referral_code } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Campos requeridos: username, email, password' });
      return;
    }

    // Verificar si el código de referido es válido
    let referredBy: string | null = null;
    if (referral_code) {
      const { data: affiliate } = await supabase
        .from('users').select('id').eq('referral_code', referral_code).single();
      if (!affiliate) {
        res.status(400).json({ error: 'Código de referido inválido' });
        return;
      }
      referredBy = affiliate.id;
    }

    // Registrar usuario
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newReferralCode = Math.random().toString(36).substring(2, 12);

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'client',
        status: 'pending',
        referral_code: newReferralCode,
        referred_by: referredBy,
      })
      .select('id, username, email, referral_code')
      .single();

    if (userError) {
      if (userError.message?.includes('duplicate') || userError.code === '23505') {
        res.status(409).json({ error: 'El usuario o email ya existe' });
        return;
      }
      throw userError;
    }

    // Si fue referido, crear registro
    if (referredBy) {
      await supabase.from('referrals').insert({
        affiliate_id: referredBy,
        referred_user_id: newUser.id,
        status: 'pending',
      });
    }

    // Generar JWT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'platiz_secret_2024';
    const token = jwt.sign({ id: newUser.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'client',
        status: 'pending',
      },
      token,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// ADMIN: Lista de afiliados con créditos
export async function adminListAffiliates(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, username, email, phone, credits, referral_code, display_name, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// ADMIN: Añadir/editar créditos de un usuario
export async function adminUpdateCredits(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { credits } = req.body;

    if (credits === undefined || credits < 0) {
      res.status(400).json({ error: 'Cantidad de créditos inválida' });
      return;
    }

    await supabase.from('users').update({ credits }).eq('id', userId);
    res.json({ message: 'Créditos actualizados' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// ADMIN: Historial de referidos y activaciones
export async function adminReferralHistory(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase
      .from('referrals')
      .select('id, status, created_at, activated_at, affiliate:affiliate_id(username, email), referred_user:referred_user_id(username, email)')
      .order('created_at', { ascending: false })
      .limit(500);

    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// ADMIN: Configurar video global de landing
export async function adminUpdateLandingVideo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { landing_video_url, landing_video_type } = req.body;

    const { data: existing } = await supabase.from('settings').select('id').maybeSingle();
    if (existing) {
      await supabase.from('settings').update({ landing_video_url, landing_video_type }).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ landing_video_url, landing_video_type });
    }

    res.json({ message: 'Video de landing actualizado' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
