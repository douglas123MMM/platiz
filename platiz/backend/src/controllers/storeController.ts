import { Request, Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

const CATEGORIES = ['Todos','Streaming','IA','Creatividad','Diseno Grafico','Edicion de Videos','Herramientas','Antivirus','Oficina','Licencia','Monedas de Juegos','Redes Sociales'];

export async function getStoreCategories(_req: AuthRequest, res: Response): Promise<void> {
  try {
    res.json(CATEGORIES);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStoreProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    let query = supabase
      .from('store_products')
      .select('id, category, title, description, terms, purchase_instructions, price, image_url, support_number, delivery_type, account_type, duration_days, stock, renewable, vendor_name, created_at, updated_at, variants')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'Todos') {
      query = query.eq('category', category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStoreProductById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_products').select('*').eq('id', req.params.id).single();
    if (error || !data) { res.status(404).json({ error: 'Producto no encontrado' }); return; }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      const { data: purchase } = await supabase.from('store_purchases').select('id').eq('product_id', req.params.id).eq('user_id', req.user?.id).maybeSingle();
      if (!purchase) {
        const { delivery_email, delivery_password, ...safe } = data;
        res.json(safe);
        return;
      }
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, title, description, terms, purchase_instructions, price, image_url, support_number, delivery_email, delivery_password, stock, account_type, duration_days, delivery_type, renewable, vendor_name } = req.body;

    if (!category || !title || price === undefined) {
      res.status(400).json({ error: 'Categoria, titulo y precio son obligatorios' });
      return;
    }

    const { data, error } = await supabase.from('store_products').insert([{
      category, title,
      description: description || '',
      terms: terms || '',
      purchase_instructions: purchase_instructions || '',
      price: parseFloat(price) || 0,
      image_url: image_url || '',
      support_number: support_number || '',
      delivery_email: delivery_email || '',
      delivery_password: delivery_password || '',
      stock: parseInt(stock) || 0,
      account_type: account_type || 'permanente',
      duration_days: parseInt(duration_days) || 0,
      delivery_type: delivery_type || 'manual',
      renewable: renewable || false,
      vendor_name: vendor_name || ''
    }]).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const updates: Record<string, unknown> = {};
    const stringFields = ['category', 'title', 'description', 'terms', 'purchase_instructions', 'image_url', 'support_number', 'delivery_email', 'delivery_password', 'account_type', 'delivery_type', 'vendor_name'];
    const numberFields = ['price', 'stock', 'duration_days'];
    const booleanFields = ['renewable', 'active'];

    stringFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    numberFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = parseFloat(req.body[f]) || 0; });
    booleanFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = Boolean(req.body[f]); });

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('store_products').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStoreProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { error } = await supabase.from('store_products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAdminProducts(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function purchaseProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { product_id } = req.body;
    if (!product_id) { res.status(400).json({ error: 'product_id es requerido' }); return; }

    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

    const { data: product, error: productError } = await supabase.from('store_products').select('*').eq('id', product_id).single();
    if (productError || !product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }

    const { data: user, error: userError } = await supabase.from('users').select('credits').eq('id', userId).single();
    if (userError || !user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    const userCredits = user.credits || 0;
    const price = parseFloat(product.price) || 0;

    if (price <= 0) {
      res.status(400).json({ error: 'Este producto no esta disponible para compra' });
      return;
    }

    if (userCredits < price) {
      res.status(400).json({ error: 'Saldo insuficiente' });
      return;
    }

    const newBalance = userCredits - price;

    const expiresAt = product.duration_days > 0
      ? new Date(Date.now() + product.duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabase.from('users').update({ credits: newBalance }).eq('id', userId);

    if (product.stock > 0) {
      await supabase.from('store_products').update({ stock: product.stock - 1 }).eq('id', product_id);
    }

    const { data: purchase } = await supabase.from('store_purchases').insert([{
      user_id: userId,
      product_id,
      product_title: product.title,
      amount: price,
      status: 'completed',
      expires_at: expiresAt
    }]).select('id').single();

    await supabase.from('store_transactions').insert([{
      user_id: userId,
      type: 'purchase',
      amount: price,
      description: `Compra: ${product.title}`,
      status: 'completed'
    }]);

    const purchaseId = purchase?.id ? `GD-${purchase.id.substring(0, 8).toUpperCase()}` : null;

    res.json({
      success: true,
      purchase_id: purchaseId,
      product_title: product.title,
      amount: price,
      new_balance: newBalance,
      delivery_email: product.delivery_email || '',
      delivery_password: product.delivery_password || ''
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPurchaseHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

    const { data, error } = await supabase.from('store_purchases').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    const enriched = await Promise.all((data || []).map(async (p) => {
      const { data: product } = await supabase.from('store_products').select('delivery_email, delivery_password').eq('id', p.product_id).maybeSingle();
      const isActive = !p.expires_at || new Date(p.expires_at) > new Date();
      const daysLeft = p.expires_at ? Math.ceil((new Date(p.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      return {
        ...p,
        purchase_id: p.id ? 'GD-' + p.id.substring(0, 8).toUpperCase() : null,
        delivery_email: product?.delivery_email || '',
        delivery_password: product?.delivery_password || '',
        status_display: p.expires_at ? (isActive ? 'Activo' : 'Vencido') : 'Permanente',
        days_left: daysLeft,
        expiring_soon: daysLeft !== null && daysLeft <= 5 && daysLeft > 0
      };
    }));
    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllPurchases(req: AuthRequest, res: Response): Promise<void> {
  try {
    const search = req.query.search as string;
    let query = supabase.from('store_purchases').select('*').order('created_at', { ascending: false });

    if (search) {
      // Buscar por ID de compra o titulo
      const isUuid = search.match(/^[0-9a-f-]{36}$/i);
      const isShortId = search.match(/^GD-/i);
      if (isUuid) {
        query = query.eq('id', search);
      } else if (isShortId) {
        // Buscar por los primeros 8 chars del UUID
        const shortId = search.replace('GD-', '');
        query = query.ilike('id', `${shortId}%`);
      } else {
        query = query.ilike('product_title', `%${search}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    let enriched = await Promise.all((data || []).map(async (p) => {
      const { data: user } = await supabase.from('users').select('username, email, phone').eq('id', p.user_id).maybeSingle();
      const { data: product } = await supabase.from('store_products').select('delivery_email, delivery_password').eq('id', p.product_id).maybeSingle();
      const isActive = !p.expires_at || new Date(p.expires_at) > new Date();
      return { ...p, purchase_id: p.id ? 'GD-' + p.id.substring(0, 8).toUpperCase() : null, user: user || null, delivery_email: product?.delivery_email || '', delivery_password: product?.delivery_password || '', status_display: p.expires_at ? (isActive ? 'Activo' : 'Vencido') : 'Permanente' };
    }));

    // Si se busca por usuario/email, filtrar del lado del cliente
    if (search && !search.match(/^[0-9a-f-]{36}$/i) && !search.match(/^GD-/i)) {
      enriched = enriched.filter(p => {
        const u = p.user;
        if (!u) return false;
        return (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
               (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
               (u.phone || '').includes(search);
      });
    }

    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTransactions(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_transactions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const enriched = await Promise.all((data || []).map(async (tx) => {
      const { data: user } = await supabase.from('users').select('username, email, phone').eq('id', tx.user_id).maybeSingle();
      return { ...tx, user: user || { username: 'N/A', email: 'N/A', phone: 'N/A' } };
    }));
    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

    const { data, error } = await supabase.from('store_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createRecharge(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { amount, reference, image } = req.body;
    if (!amount || amount < 1) {
      res.status(400).json({ error: 'Monto minimo: $1 USDT' });
      return;
    }
    if (!reference || String(reference).trim().length < 3) {
      res.status(400).json({ error: 'Ingresa una referencia del pago (min 3 caracteres)' });
      return;
    }

    const { data: settings } = await supabase.from('settings').select('binance_pay_id, binance_pay_email').maybeSingle();
    const binanceId = settings?.binance_pay_id || process.env.BINANCE_PAY_ID || '355976674';
    const binanceEmail = settings?.binance_pay_email || process.env.BINANCE_PAY_EMAIL || 'jcespinoza2011@gmail.com';

    const { data: tx, error } = await supabase.from('store_transactions').insert({
      user_id: req.user?.id,
      type: 'recharge',
      amount,
      description: `Ref: ${String(reference).trim()} | Binance ID: ${binanceId}`,
      status: 'pending',
      proof_image: image || null,
    }).select().single();

    if (error) throw error;

    res.json({
      success: true,
      transaction_id: tx.id,
      amount,
      message: 'Recarga enviada para revision. Se acreditara cuando el admin la apruebe.',
      binance_id: binanceId,
      binance_email: binanceEmail,
      proof_image: tx.proof_image || null,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingRecharges(req: AuthRequest, res: Response): Promise<void> {
  try {
    const statusFilter = req.query.status as string || 'pending';
    let query = supabase.from('store_transactions')
      .select('*')
      .eq('type', 'recharge')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    const enriched = await Promise.all((data || []).map(async (tx) => {
      const { data: user } = await supabase.from('users')
        .select('username, email, phone')
        .eq('id', tx.user_id)
        .maybeSingle();
      return { ...tx, user: user || { username: 'N/A', email: 'N/A', phone: 'N/A' } };
    }));

    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveRecharge(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: tx, error } = await supabase.from('store_transactions')
      .select('*').eq('id', id).eq('status', 'pending').maybeSingle();

    if (error || !tx) {
      res.status(404).json({ error: 'Recarga no encontrada o ya procesada' });
      return;
    }

    const finalStatus = status === 'rejected' ? 'rejected' : 'completed';
    const descriptionSuffix = finalStatus === 'completed' ? ' [APROBADA]' : ' [RECHAZADA]';

    await supabase.from('store_transactions')
      .update({ status: finalStatus, description: `${tx.description}${descriptionSuffix}` })
      .eq('id', id);

    let newCredits: number | null = null;
    if (finalStatus === 'completed') {
      const { data: user } = await supabase.from('users').select('credits').eq('id', tx.user_id).maybeSingle();
      const currentCredits = parseFloat(user?.credits || '0');
      const amount = parseFloat(String(tx.amount));
      newCredits = currentCredits + amount;
      await supabase.from('users').update({ credits: newCredits }).eq('id', tx.user_id);
    }

    res.json({ success: true, new_balance: newCredits, status: finalStatus });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBinancePaymentInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data: settings } = await supabase.from('settings').select('binance_pay_id, binance_pay_email, binance_pay_qr').maybeSingle();
    const binanceId = settings?.binance_pay_id || process.env.BINANCE_PAY_ID || '355976674';
    const binanceEmail = settings?.binance_pay_email || process.env.BINANCE_PAY_EMAIL || 'jcespinoza2011@gmail.com';
    const binanceQr = settings?.binance_pay_qr || process.env.BINANCE_PAY_QR || '';
    res.json({ binance_id: binanceId, binance_email: binanceEmail, binance_qr: binanceQr });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function renewPurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { purchase_id } = req.body;
    const userId = req.user?.id;

    const { data: purchase } = await supabase.from('store_purchases')
      .select('*, store_products(*)')
      .eq('id', purchase_id).eq('user_id', userId).maybeSingle();

    if (!purchase) { res.status(404).json({ error: 'Compra no encontrada' }); return; }

    const price = parseFloat(purchase.store_products?.price || '0');
    const { data: user } = await supabase.from('users').select('credits').eq('id', userId).maybeSingle();
    const credits = parseFloat(user?.credits || '0');

    if (credits < price) { res.status(400).json({ error: 'Saldo insuficiente' }); return; }

    const newBalance = credits - price;
    await supabase.from('users').update({ credits: newBalance }).eq('id', userId);

    const durationDays = purchase.store_products?.duration_days || 30;
    const newExpiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('store_purchases').update({ expires_at: newExpiry }).eq('id', purchase_id);

    await supabase.from('store_transactions').insert({
      user_id: userId, type: 'purchase', amount: price,
      description: `Renovacion: ${purchase.product_title}`, status: 'completed'
    });

    res.json({ success: true, new_balance: newBalance, new_expiry: newExpiry });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
