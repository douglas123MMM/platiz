import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
} catch {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

export async function initializeDatabase(): Promise<void> {
  if (!supabaseUrl) {
    console.warn('⚠️ SUPABASE_URL not set. Set it in backend/.env for database access.');
    return;
  }
  const { error } = await supabase.from('categories').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
  console.log('✓ Connected to Supabase');
}

export default { supabase, initializeDatabase };
