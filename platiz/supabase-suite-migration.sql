-- ============================================================
-- GLOBAL DORADO SUITE - Migracion de tablas
-- Adaptado al esquema existente (usa 'users' no 'profiles')
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. tenant_suite: espacios white-label de los afiliados
CREATE TABLE IF NOT EXISTS tenant_suite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    custom_domain TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0A0A0A',
    secondary_color TEXT DEFAULT '#D4AF37',
    accent_color TEXT DEFAULT '#FFFFFF',
    is_active BOOLEAN DEFAULT true,
    plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic','pro','enterprise','trial')),
    max_tools INTEGER DEFAULT 3,
    max_clients INTEGER DEFAULT 100,
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. tenant_tools: herramientas activas por tenant
CREATE TABLE IF NOT EXISTS tenant_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    tool_slug TEXT NOT NULL CHECK (tool_slug IN ('booking','crm','invoices','projects','chat_ia')),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, tool_slug)
);

-- 3. tenant_clients: clientes de cada tenant
CREATE TABLE IF NOT EXISTS tenant_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. tenant_services: servicios ofrecidos (para citas)
CREATE TABLE IF NOT EXISTS tenant_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. tenant_professionals: profesionales que atienden
CREATE TABLE IF NOT EXISTS tenant_professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. tenant_bookings: citas agendadas
CREATE TABLE IF NOT EXISTS tenant_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    client_id UUID REFERENCES tenant_clients(id) ON DELETE SET NULL,
    service_id UUID REFERENCES tenant_services(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES tenant_professionals(id) ON DELETE SET NULL,
    service TEXT NOT NULL,
    service_price DECIMAL(10,2),
    professional TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
    notes TEXT,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. tenant_invoices: facturas
CREATE TABLE IF NOT EXISTS tenant_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenant_suite(id) ON DELETE CASCADE,
    client_id UUID REFERENCES tenant_clients(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. suite_subscriptions: membresias a Suite
CREATE TABLE IF NOT EXISTS suite_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('basic','pro','enterprise','trial')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. suite_affiliate_commissions: comisiones por referidos a Suite
CREATE TABLE IF NOT EXISTS suite_affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL,
    referred_affiliate_id UUID NOT NULL,
    subscription_id UUID REFERENCES suite_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    percentage INTEGER DEFAULT 30,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','canceled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenant_suite_owner ON tenant_suite(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenant_suite_slug ON tenant_suite(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_tools_tenant ON tenant_tools(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_clients_tenant ON tenant_clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_services_tenant ON tenant_services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_professionals_tenant ON tenant_professionals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_bookings_tenant ON tenant_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_bookings_date ON tenant_bookings(date);
CREATE INDEX IF NOT EXISTS idx_tenant_bookings_status ON tenant_bookings(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invoices_tenant ON tenant_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suite_subscriptions_affiliate ON suite_subscriptions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_suite_commissions_affiliate ON suite_affiliate_commissions(affiliate_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- tenant_suite: solo el dueño puede ver/modificar
ALTER TABLE tenant_suite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_tenants_select_owner" ON tenant_suite FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "suite_tenants_insert_owner" ON tenant_suite FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "suite_tenants_update_owner" ON tenant_suite FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "suite_tenants_delete_owner" ON tenant_suite FOR DELETE USING (owner_id = auth.uid());
-- Permitir SELECT publico para landing pages (sin auth)
CREATE POLICY "suite_tenants_select_public" ON tenant_suite FOR SELECT USING (is_active = true);

-- tenant_tools
ALTER TABLE tenant_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_tools_tenant_owner" ON tenant_tools FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);
CREATE POLICY "suite_tools_select_public" ON tenant_tools FOR SELECT USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND is_active = true)
);

-- tenant_clients
ALTER TABLE tenant_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_clients_tenant_owner" ON tenant_clients FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);

-- tenant_services
ALTER TABLE tenant_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_services_tenant_owner" ON tenant_services FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);
CREATE POLICY "suite_services_select_public" ON tenant_services FOR SELECT USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND is_active = true)
);

-- tenant_professionals
ALTER TABLE tenant_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_professionals_tenant_owner" ON tenant_professionals FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);
CREATE POLICY "suite_professionals_select_public" ON tenant_professionals FOR SELECT USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND is_active = true)
);

-- tenant_bookings
ALTER TABLE tenant_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_bookings_tenant_owner" ON tenant_bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);
-- Permitir INSERT publico para agendar citas
CREATE POLICY "suite_bookings_insert_public" ON tenant_bookings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND is_active = true)
);

-- tenant_invoices
ALTER TABLE tenant_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_invoices_tenant_owner" ON tenant_invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM tenant_suite WHERE id = tenant_id AND owner_id = auth.uid())
);

-- suite_subscriptions
ALTER TABLE suite_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_subs_owner" ON suite_subscriptions FOR SELECT USING (affiliate_id = auth.uid());

-- suite_affiliate_commissions
ALTER TABLE suite_affiliate_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suite_commissions_owner" ON suite_affiliate_commissions FOR SELECT USING (affiliate_id = auth.uid());
