export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'admin' | 'client';
  status: 'pending' | 'approved' | 'rejected';
  avatar?: string;
  movies_access?: boolean;
  credits?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface ContentItem {
  id: string;
  category_slug: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  video_url?: string;
  video_type?: string;
  platform?: string;
  tag?: string;
  featured?: number;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  active: number;
  sort_order: number;
  created_at: string;
}

export interface AIProvider {
  id: string;
  name: string;
  api_url: string;
  api_key?: string;
  model?: string;
  active: number;
  created_at: string;
}

export interface Stream {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url: string;
  video_type?: string;
  platform?: string;
  show_on_landing?: number;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  role?: string;
  photo_url?: string;
  link?: string;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  provider_id?: string;
  provider_name?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversation_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Membership {
  id: string;
  service: string;
  account_email: string;
  account_password: string;
  profile: string;
  client_name: string;
  client_phone: string;
  purchase_date: string;
  expiry_date: string;
  status: 'active' | 'inactive';
  cost: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// GLOBAL DORADO SUITE
// ============================================================

export interface TenantSuite {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  subdomain: string;
  custom_domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_active: boolean;
  plan_type: 'basic' | 'pro' | 'enterprise' | 'trial';
  max_tools: number;
  max_clients: number;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantTool {
  id: string;
  tenant_id: string;
  tool_slug: 'booking' | 'crm' | 'invoices' | 'projects' | 'chat_ia';
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantClient {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TenantService {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price?: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantProfessional {
  id: string;
  tenant_id: string;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantBooking {
  id: string;
  tenant_id: string;
  client_id?: string;
  service_id?: string;
  professional_id?: string;
  service: string;
  service_price?: number;
  professional?: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantInvoice {
  id: string;
  tenant_id: string;
  client_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SuiteSubscription {
  id: string;
  affiliate_id: string;
  stripe_subscription_id?: string;
  plan: 'basic' | 'pro' | 'enterprise' | 'trial';
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  amount: number;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SuiteAffiliateCommission {
  id: string;
  affiliate_id: string;
  referred_affiliate_id: string;
  subscription_id?: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'canceled';
  created_at: string;
}

export interface SuiteDashboardStats {
  active_tenants: number;
  total_tenants: number;
  total_clients: number;
  bookings_this_month: number;
  revenue_this_month: number;
}
