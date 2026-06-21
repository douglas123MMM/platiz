import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

export async function uploadVideoToStorage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'mp4';
  const fileName = `landing_video_${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`public/${fileName}`, file, { contentType: file.type || 'video/mp4' });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(`public/${fileName}`);
  return urlData.publicUrl;
}

export async function deleteVideoFromStorage(url: string): Promise<void> {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/storage/v1/object/public/uploads/');
    if (parts.length > 1) {
      await supabase.storage.from('uploads').remove([decodeURIComponent(parts[1])]);
    }
  } catch {}
}
