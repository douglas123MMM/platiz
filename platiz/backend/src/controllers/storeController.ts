import { Request, Response } from 'express';
import { supabase } from '../models/database';
import { AuthRequest } from '../middleware/auth';
import { createOrder, queryOrder } from '../utils/binancePay';

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
    const { amount } = req.body;
    if (!amount || amount < 1) {
      res.status(400).json({ error: 'Monto minimo: $1 USDT' });
      return;
    }

    const merchantTradeNo = `REC${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    try {
      const order = await createOrder({
        merchantTradeNo,
        totalFee: amount,
        currency: 'USDT',
        productName: 'Recarga Global Dorado',
        productDetail: `Recarga de saldo $${amount} USDT`,
      });

      if (order.status === 'SUCCESS' && order.data) {
        await supabase.from('store_transactions').insert({
          user_id: req.user?.id,
          type: 'recharge',
          amount,
          description: `Recarga USDT - ${merchantTradeNo}`,
          status: 'pending',
        });

        res.json({
          success: true,
          prepay_id: order.data.prepayId,
          qrcode_url: order.data.qrcodeLink || order.data.qrCode || '',
          checkout_url: order.data.checkoutUrl || order.data.universalUrl || '',
          amount,
          message: 'Escanea el QR con Binance para pagar',
        });
        return;
      }
    } catch (e) {
      console.error('Binance createOrder error:', e);
    }

    const { data: tx } = await supabase.from('store_transactions').insert({
      user_id: req.user?.id,
      type: 'recharge',
      amount,
      description: `Recarga USDT manual - ${merchantTradeNo}`,
      status: 'pending',
    }).select().single();

    res.json({
      success: true,
      manual: true,
      transaction_id: tx?.id,
      amount,
      message: 'Recarga registrada manualmente. Un admin la aprobara.',
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function checkRechargeStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { prepay_id } = req.params;
    
    const result = await queryOrder(prepay_id);
    
    if (result.status === 'SUCCESS' && result.data) {
      const bizStatus = result.data.bizStatus || result.data.status;
      
      if (bizStatus === 'PAY_SUCCESS' || bizStatus === 'PAID') {
        const { data: existingTx } = await supabase.from('store_transactions')
          .select('*')
          .ilike('description', `%${prepay_id}%`)
          .eq('status', 'completed')
          .maybeSingle();

        if (existingTx) {
          res.json({ status: 'completed', message: 'Ya acreditado' });
          return;
        }

        const { data: pendingTx } = await supabase.from('store_transactions')
          .select('*')
          .ilike('description', `%${prepay_id}%`)
          .eq('status', 'pending')
          .maybeSingle();

        if (pendingTx) {
          await supabase.from('store_transactions').update({ status: 'completed' }).eq('id', pendingTx.id);

          const { data: user } = await supabase.from('users').select('credits').eq('id', pendingTx.user_id).maybeSingle();
          const currentCredits = parseFloat(user?.credits || '0');
          const newCredits = currentCredits + parseFloat(String(pendingTx.amount));
          await supabase.from('users').update({ credits: newCredits }).eq('id', pendingTx.user_id);

          res.json({ 
            status: 'completed', 
            message: 'Pago confirmado. Saldo acreditado.',
            new_balance: newCredits,
            amount: pendingTx.amount,
          });
          return;
        }
      }
      
      if (bizStatus === 'PAY_CLOSED' || bizStatus === 'EXPIRED' || bizStatus === 'FAILED') {
        res.json({ status: 'expired', message: 'Pago expirado o rechazado' });
        return;
      }
    }

    res.json({ status: 'pending', message: 'Esperando pago...' });
  } catch {
    res.json({ status: 'pending', message: 'Verificando...' });
  }
}

export async function getPendingRecharges(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('store_transactions').select('*').eq('type', 'recharge').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveRecharge(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['completed', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Estado invalido. Usa "completed" o "rejected".' });
      return;
    }

    const { data: transaction, error: fetchError } = await supabase.from('store_transactions').select('*').eq('id', id).single();
    if (fetchError || !transaction) { res.status(404).json({ error: 'Transaccion no encontrada' }); return; }

    const { data, error } = await supabase.from('store_transactions').update({ status }).eq('id', id).select().single();
    if (error) throw error;

    if (status === 'completed') {
      const { data: user, error: userError } = await supabase.from('users').select('credits').eq('id', transaction.user_id).single();
      if (!userError && user) {
        const currentCredits = user.credits || 0;
        await supabase.from('users').update({ credits: currentCredits + parseFloat(transaction.amount) }).eq('id', transaction.user_id);
      }
    }

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function queryBinanceOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { prepayId } = req.params;
    const order = await queryOrder(prepayId);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error querying Binance order' });
  }
}

export async function getBinancePaymentInfo(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const { data, error } = await supabase.from('settings').select('binance, whatsapp').single();
    if (error || !data) {
      res.json({ binance_id: '', binance_email: 'jcespinoza2011@gmail.com', binance_qr: '' });
      return;
    }

    res.json({
      binance_id: data.binance || '',
      binance_email: data.binance || 'jcespinoza2011@gmail.com',
      binance_qr: data.binance || ''
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function binanceWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { bizType, bizId, bizStatus, data } = req.body;

    if (bizStatus !== 'PAY_SUCCESS') {
      res.json({ returnCode: 'SUCCESS', returnMessage: 'Ignored' });
      return;
    }

    const prepayId = data?.merchantTradeNo || bizId;

    const { data: tx } = await supabase.from('store_transactions')
      .select('*')
      .ilike('description', `%${prepayId}%`)
      .eq('status', 'pending')
      .maybeSingle();

    if (!tx) {
      res.json({ returnCode: 'SUCCESS', returnMessage: 'No pending transaction found' });
      return;
    }

    await supabase.from('store_transactions').update({
      status: 'completed',
      description: `${tx.description} - Webhook confirmed`
    }).eq('id', tx.id);

    const { data: user } = await supabase.from('users').select('credits').eq('id', tx.user_id).maybeSingle();
    const currentCredits = parseFloat(user?.credits || '0');
    const newCredits = currentCredits + parseFloat(String(tx.amount));
    await supabase.from('users').update({ credits: newCredits }).eq('id', tx.user_id);

    res.json({ returnCode: 'SUCCESS', returnMessage: 'Payment confirmed' });
  } catch {
    res.json({ returnCode: 'FAIL', returnMessage: 'Error processing' });
  }
}
