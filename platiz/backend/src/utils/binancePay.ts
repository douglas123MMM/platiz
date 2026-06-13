import crypto from 'crypto';

const BINANCE_API = 'https://bpay.binanceapi.com';
const API_KEY = process.env.BINANCE_PAY_KEY || '';
const SECRET_KEY = process.env.BINANCE_PAY_SECRET || '';

function sign(payload: Record<string, any>): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = JSON.stringify(payload);
  const signaturePayload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = crypto.createHmac('sha512', SECRET_KEY).update(signaturePayload).digest('hex').toUpperCase();
  return signature;
}

function getHeaders(payload: Record<string, any>): Record<string, string> {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = JSON.stringify(payload);
  const signaturePayload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = crypto.createHmac('sha512', SECRET_KEY).update(signaturePayload).digest('hex').toUpperCase();
  return {
    'Content-Type': 'application/json',
    'BinancePay-Timestamp': String(timestamp),
    'BinancePay-Nonce': nonce,
    'BinancePay-Certificate-SN': API_KEY,
    'BinancePay-Signature': signature,
  };
}

export interface CreateOrderParams {
  merchantTradeNo: string;
  totalFee: number;
  currency: string;
  productName: string;
  productDetail: string;
  returnUrl?: string;
}

export async function createOrder(params: CreateOrderParams) {
  const payload = {
    env: { terminalType: 'WEB' },
    merchantTradeNo: params.merchantTradeNo,
    orderAmount: params.totalFee,
    currency: params.currency || 'USDT',
    goods: {
      goodsType: '01',
      goodsCategory: '1000',
      referenceGoodsId: params.merchantTradeNo,
      goodsName: params.productName,
      goodsDetail: params.productDetail,
    },
    returnUrl: params.returnUrl || '',
  };
  
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('Binance Pay API keys not configured');
  }
  
  const headers = getHeaders(payload);
  const response = await fetch(`${BINANCE_API}/binancepay/openapi/v3/order`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function queryOrder(prepayId: string) {
  const payload = { prepayId };
  const headers = getHeaders(payload);
  const response = await fetch(`${BINANCE_API}/binancepay/openapi/v2/order/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return response.json();
}

export function verifyWebhookSignature(timestamp: string, nonce: string, body: string, expectedSignature: string): boolean {
  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = crypto.createHmac('sha512', SECRET_KEY).update(payload).digest('hex').toUpperCase();
  return signature === expectedSignature;
}
