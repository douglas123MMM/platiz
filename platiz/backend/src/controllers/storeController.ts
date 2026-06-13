import { Request, Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';

const CATEGORIES = ['Todos','Streaming','Creatividad','Diseno Grafico','Edicion de Videos','Herramientas','Antivirus','Oficina','Licencia','Monedas de Juegos','Redes Sociales'];

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
      .select('id, category, title, description, terms, price, image_url, support_number, delivery_type, account_type, duration_days, stock, renewable, vendor_name, created_at')
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
    const { category, title, description, terms, price, image_url, support_number, delivery_email, delivery_password, stock, account_type, duration_days, delivery_type, renewable, vendor_name } = req.body;

    if (!category || !title || price === undefined) {
      res.status(400).json({ error: 'Categoria, titulo y precio son obligatorios' });
      return;
    }

    const { data, error } = await supabase.from('store_products').insert([{
      category, title,
      description: description || '',
      terms: terms || '',
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
    const stringFields = ['category', 'title', 'description', 'terms', 'image_url', 'support_number', 'delivery_email', 'delivery_password', 'account_type', 'delivery_type', 'vendor_name'];
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

    if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
      res.status(400).json({ error: 'Producto agotado' });
      return;
    }

    const { data: user, error: userError } = await supabase.from('users').select('credits').eq('id', userId).single();
    if (userError || !user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    const userCredits = user.credits || 0;
    const price = parseFloat(product.price) || 0;

    if (userCredits < price) {
      res.status(400).json({ error: 'Saldo insuficiente' });
      return;
    }

    const newBalance = userCredits - price;

    await supabase.from('users').update({ credits: newBalance }).eq('id', userId);

    if (product.stock > 0) {
      await supabase.from('store_products').update({ stock: product.stock - 1 }).eq('id', product_id);
    }

    await supabase.from('store_purchases').insert([{
      user_id: userId,
      product_id,
      product_title: product.title,
      amount: price,
      status: 'completed'
    }]);

    await supabase.from('store_transactions').insert([{
      user_id: userId,
      type: 'purchase',
      amount: price,
      description: `Compra: ${product.title}`,
      status: 'completed'
    }]);

    res.json({
      success: true,
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
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTransactions(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_transactions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
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
    const { amount, reference } = req.body;
    if (!amount || amount < 1) {
      res.status(400).json({ error: 'Monto minimo: $1 USDT' });
      return;
    }
    if (!reference || String(reference).trim().length < 3) {
      res.status(400).json({ error: 'Ingresa una referencia del pago (min 3 caracteres)' });
      return;
    }

    const binanceId = process.env.BINANCE_PAY_ID || '355976674';
    const binanceEmail = process.env.BINANCE_PAY_EMAIL || 'jcespinoza2011@gmail.com';

    const { data: tx, error } = await supabase.from('store_transactions').insert({
      user_id: req.user?.id,
      type: 'recharge',
      amount,
      description: `Ref: ${String(reference).trim()} | Binance ID: ${binanceId}`,
      status: 'pending',
    }).select().single();

    if (error) throw error;

    res.json({
      success: true,
      transaction_id: tx.id,
      amount,
      message: 'Recarga enviada para revision. Se acreditara cuando el admin la apruebe.',
      binance_id: binanceId,
      binance_email: binanceEmail,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPendingRecharges(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_transactions')
      .select('*')
      .eq('type', 'recharge')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all((data || []).map(async (tx) => {
      const { data: user } = await supabase.from('users')
        .select('username, email')
        .eq('id', tx.user_id)
        .maybeSingle();
      return { ...tx, user: user || { username: 'N/A', email: 'N/A' } };
    }));

    res.json(enriched);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveRecharge(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const { data: tx, error } = await supabase.from('store_transactions')
      .select('*').eq('id', id).eq('status', 'pending').maybeSingle();

    if (error || !tx) {
      res.status(404).json({ error: 'Recarga no encontrada o ya procesada' });
      return;
    }

    await supabase.from('store_transactions')
      .update({ status: 'completed', description: `${tx.description} [APROBADA]` })
      .eq('id', id);

    const { data: user } = await supabase.from('users').select('credits').eq('id', tx.user_id).maybeSingle();
    const currentCredits = parseFloat(user?.credits || '0');
    const amount = parseFloat(String(tx.amount));
    const newCredits = currentCredits + amount;
    await supabase.from('users').update({ credits: newCredits }).eq('id', tx.user_id);

    res.json({ success: true, new_balance: newCredits, amount, username: user?.username || tx.user_id });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getBinancePaymentInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const binanceId = process.env.BINANCE_PAY_ID || '355976674';
    const binanceEmail = process.env.BINANCE_PAY_EMAIL || 'jcespinoza2011@gmail.com';
    res.json({ binance_id: binanceId, binance_email: binanceEmail });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
