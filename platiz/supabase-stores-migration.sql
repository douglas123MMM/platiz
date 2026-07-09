-- ============================================================
-- TIENDAS VIRTUALES - Cada usuario puede crear su catalogo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. user_stores: configuracion de la tienda de cada usuario
CREATE TABLE IF NOT EXISTS user_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL DEFAULT 'Mi Tienda',
    description TEXT DEFAULT '',
    logo_url TEXT,
    whatsapp TEXT,
    primary_color TEXT DEFAULT '#0A0A0A',
    accent_color TEXT DEFAULT '#25D366',
    text_color TEXT DEFAULT '#FFFFFF',
    card_color TEXT DEFAULT '#1A1A2E',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. store_products: productos de cada tienda
CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES user_stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_stores_user ON user_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stores_slug ON user_stores(slug);
CREATE INDEX IF NOT EXISTS idx_store_products_store ON store_products(store_id);

-- RLS
ALTER TABLE user_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_owner_all" ON user_stores FOR ALL USING (user_id = auth.uid());
CREATE POLICY "stores_public_read" ON user_stores FOR SELECT USING (is_active = true);

ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_store_owner" ON store_products FOR ALL USING (
    EXISTS (SELECT 1 FROM user_stores WHERE id = store_id AND user_id = auth.uid())
);
CREATE POLICY "products_public_read" ON store_products FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_stores WHERE id = store_id AND is_active = true)
);
