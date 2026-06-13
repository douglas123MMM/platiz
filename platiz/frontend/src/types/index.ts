export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'admin' | 'client';
  status: 'pending' | 'approved' | 'rejected';
  avatar?: string;
  movies_access?: boolean;
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
