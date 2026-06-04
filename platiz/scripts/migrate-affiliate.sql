-- ============================================================
-- SISTEMA DE AFILIADOS - Migración
-- Ejecutar en SQL Editor de Supabase
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

-- 2. Tabla de referidos (tracking de quién refirió a quién)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  UNIQUE(referred_user_id)
);

-- 3. Tabla settings: agregar columna para video de landing
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_video_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS landing_video_type TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
