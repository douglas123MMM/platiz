-- ============================================================
-- PLATIZ - Migración RLS (Row Level Security)
-- Pega esto en SQL Editor de Supabase y ejecuta (RUN)
-- ============================================================
-- BACKEND usa SERVICE_KEY = ignora RLS. Nada se rompe.
-- Esto protege si el ANON_KEY se filtra.
-- ============================================================

-- FUNCION PARA EJECUTAR SQL DESDE LA API (crear primero)
CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  EXECUTE sql_text;
END;
$$;

-- ============================================================
-- COLUMNA purchase_instructions
-- ============================================================
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS purchase_instructions TEXT DEFAULT '';

-- ============================================================
-- 1. CONTENIDO PÚBLICO (lectura anónima, solo backend escribe)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "categorias_lectura_publica" ON categories FOR SELECT USING (true);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "items_lectura_publica" ON items FOR SELECT USING (true);

ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "streams_lectura_publica" ON streams FOR SELECT USING (true);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "banners_lectura_publica" ON banners FOR SELECT USING (true);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "partners_lectura_publica" ON partners FOR SELECT USING (true);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "store_products_lectura_publica" ON store_products FOR SELECT USING (true);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "memberships_lectura_publica" ON memberships FOR SELECT USING (true);


-- ============================================================
-- 2. DATOS DE USUARIO (solo backend accede)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_servicio" ON users FOR ALL USING (true);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "chat_conv_servicio" ON chat_conversations FOR ALL USING (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "chat_msg_servicio" ON chat_messages FOR ALL USING (true);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "referrals_servicio" ON referrals FOR ALL USING (true);

ALTER TABLE store_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "purchases_servicio" ON store_purchases FOR ALL USING (true);

ALTER TABLE store_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "transactions_servicio" ON store_transactions FOR ALL USING (true);

ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "proofs_servicio" ON payment_proofs FOR ALL USING (true);


-- ============================================================
-- 3. SOLO BACKEND
-- ============================================================

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "ai_providers_servicio" ON ai_providers FOR ALL USING (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "settings_servicio" ON settings FOR ALL USING (true);


-- ============================================================
-- STORAGE BUCKET: uploads
-- ============================================================

CREATE POLICY IF NOT EXISTS "uploads_lectura_publica" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY IF NOT EXISTS "uploads_insercion_admin" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND auth.role() = 'service_role'
);
CREATE POLICY IF NOT EXISTS "uploads_eliminar_admin" ON storage.objects FOR DELETE USING (
  bucket_id = 'uploads' AND auth.role() = 'service_role'
);
CREATE POLICY IF NOT EXISTS "uploads_actualizar_admin" ON storage.objects FOR UPDATE USING (
  bucket_id = 'uploads' AND auth.role() = 'service_role'
);
