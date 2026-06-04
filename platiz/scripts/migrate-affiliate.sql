-- ============================================================
-- SISTEMA DE AFILIADOS - Migración
-- Pega esto en SQL Editor de Supabase y ejecuta (RUN)
-- ============================================================

-- 1. Agregar columnas a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link TEXT;

-- Generar códigos de referido para usuarios existentes
UPDATE users SET referral_code = SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 10) WHERE referral_code IS NULL;

-- 2. Tabla de referidos (tracking)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  UNIQUE(referred_user_id)
);

-- 3. Config de landing pages (JSON)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_config JSONB DEFAULT '{}';

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
