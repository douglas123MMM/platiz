import { Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { uploadToSupabase, deleteFromSupabase } from '../utils/upload';

// Dashboard del afiliado
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // Perfil del usuario
    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, phone, display_name, whatsapp, telegram_link, avatar, credits, referral_code, payment_methods, instagram, tiktok, facebook, youtube, catalog_theme, created_at')
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
    const body = req.body;
    const updates: Record<string, any> = {};

    // Campos permitidos - solo actualizar si tienen valor (no vacios)
    const allowedFields = ['display_name','whatsapp','telegram_link','instagram','tiktok','facebook','youtube','catalog_theme'];
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') updates[field] = body[field];
    }

    // payment_methods: puede venir como string (FormData) u objeto (JSON)
    if (body.payment_methods !== undefined) {
      updates.payment_methods = typeof body.payment_methods === 'string' ? JSON.parse(body.payment_methods) : body.payment_methods;
    }

    // Foto
    if (req.file) updates.avatar = await uploadToSupabase(req.file);

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    await supabase.from('users').update(updates).eq('id', userId);
    res.json({ message: 'Perfil actualizado', avatar: updates.avatar });
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

// Landing pública - info del afiliado + contenido global editable
export async function getLanding(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, pageType } = req.params;
    const type = pageType || 'landing';

    const { data: user } = await supabase
      .from('users')
      .select('id, display_name, avatar, referral_code, whatsapp, telegram_link, payment_methods, instagram, tiktok, facebook, youtube, catalog_theme')
      .eq('referral_code', code).single();

    if (!user) {
      res.status(404).json({ error: 'Afiliado no encontrado' });
      return;
    }

    const { data: settings } = await supabase
      .from('settings')
      .select('landing_config')
      .maybeSingle();

    const config = settings?.landing_config || {};
    const pageConfig = config[type] || {};

    res.json({
      affiliate: {
        display_name: user.display_name || 'Global Dorado',
        avatar: user.avatar,
        whatsapp: user.whatsapp,
        telegram_link: user.telegram_link,
        payment_methods: user.payment_methods,
        instagram: user.instagram,
        tiktok: user.tiktok,
        facebook: user.facebook,
        youtube: user.youtube,
        catalog_theme: user.catalog_theme,
      },
      page: {
        type,
        title: pageConfig.title || 'Global Dorado',
        subtitle: pageConfig.subtitle || 'Transformamos Internet en Dinero',
        video_url: pageConfig.video_url || '',
        video_type: pageConfig.video_type || '',
        text: pageConfig.text || '',
        bullets: pageConfig.bullets || [],
        price: pageConfig.price || '',
        cta_text: pageConfig.cta_text || 'Quiero Registrarme',
        show_form: pageConfig.show_form !== false,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Catálogo público - servicios digitales + productos de la tienda
export async function getCatalog(_req: AuthRequest, res: Response): Promise<void> {
  try {
    // Items del catalogo original
    const { data: items } = await supabase
      .from('items')
      .select('id, category_slug, title, description, image_url, link, video_url, sort_order')
      .eq('active', 1)
      .in('category_slug', ['services', 'movies', 'ia'])
      .order('sort_order', { ascending: true });

    // Productos de la tienda activos
    const { data: store } = await supabase
      .from('store_products')
      .select('id, category, title, description, image_url, vendor_name, price, delivery_type, account_type, duration_days')
      .eq('active', true)
      .order('created_at', { ascending: false });

    // Mapear store_products al formato del catalogo
    const itemTitles = new Set((items || []).map((i: any) => i.title.toLowerCase().trim()));
    const storeItems = (store || [])
      .filter((p: any) => !itemTitles.has(p.title.toLowerCase().trim()))
      .map((p: any) => ({
        id: `store_${p.id}`,
        category_slug: (p.category || 'servicios').toLowerCase().replace(/\s+/g, '-'),
        title: p.title,
        description: p.description || '',
        image_url: p.image_url || '',
        link: '',
        video_url: '',
        sort_order: 0,
        price: parseFloat(p.price) || 0,
        delivery_type: p.delivery_type || 'manual',
        account_type: p.account_type || '',
        duration_days: p.duration_days || 0,
      }));

    const merged = [...(items || []), ...storeItems];
    res.json(merged);
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
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ id: newUser.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
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

// ADMIN: Configurar landing pages (contenido global)
export async function adminUpdateLandingConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pageType, config } = req.body;
    if (!pageType || !config) {
      res.status(400).json({ error: 'pageType y config requeridos' });
      return;
    }

    const { data: existing } = await supabase.from('settings').select('id, landing_config').maybeSingle();

    let currentConfig: Record<string, any> = {};
    if (existing?.landing_config) {
      currentConfig = typeof existing.landing_config === 'string' ? JSON.parse(existing.landing_config) : existing.landing_config;
    }

    const oldPageConfig = currentConfig[pageType] || {};
    const oldVideoUrl = oldPageConfig.video_url as string | undefined;

    currentConfig[pageType] = config;

    if (existing) {
      await supabase.from('settings').update({ landing_config: currentConfig }).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({ landing_config: currentConfig });
    }

    if (oldVideoUrl && config.video_url && oldVideoUrl !== config.video_url) {
      deleteFromSupabase(oldVideoUrl).catch(() => {});
    }

    res.json({ message: `Config de pagina "${pageType}" actualizada` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Cliente envia comprobante de pago (con foto opcional)
export async function submitPaymentProof(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { service, amount, payment_method, proof_message } = req.body;
    if (!service) { res.status(400).json({ error: 'Servicio requerido' }); return; }
    const insert: Record<string,any> = {
      user_id: req.user!.id, service, amount: amount || '', payment_method: payment_method || '', proof_message: proof_message || '', status: 'pending',
    };
    if (req.file) insert.proof_image = await uploadToSupabase(req.file);
    await supabase.from('payment_proofs').insert(insert);
    res.json({ message: 'Comprobante enviado. El admin lo revisara pronto.' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}

// Admin: listar comprobantes
export async function adminListProofs(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data } = await supabase.from('payment_proofs').select('*, user:user_id(username, email)').order('created_at', { ascending: false }).limit(200);
    res.json(data || []);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}

// Admin: cambiar estado
export async function adminUpdateProof(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await supabase.from('payment_proofs').update({ status: req.body.status }).eq('id', id);
    res.json({ message: 'Actualizado' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}

// Subir video de landing a Supabase Storage
export async function uploadLandingVideo(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se envio ningun archivo de video' });
      return;
    }
    const publicUrl = await uploadToSupabase(req.file);
    res.json({ url: publicUrl });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Proxy IPTV - evita bloqueo HTTP en paginas HTTPS
export async function iptvProxy(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: s } = await supabase.from('settings').select('iptv_m3u_url').maybeSingle();
    if (!s?.iptv_m3u_url) { res.status(404).json({ error: 'No configurado' }); return; }
    const r = await fetch(s.iptv_m3u_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(await r.text());
  } catch (e: any) { res.status(500).send(e.message); }
}
