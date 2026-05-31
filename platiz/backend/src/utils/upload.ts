import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../models/database';

const ALLOWED = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED.test(path.extname(file.originalname))) cb(null, true);
  else cb(new Error('Only images (jpg, png, gif, webp, svg) are allowed'));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname);
  const fileName = `${uuidv4()}${ext}`;
  const filePath = `public/${fileName}`;

  const { data } = await supabase.storage
    .from('uploads')
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (!data) throw new Error('Upload to Supabase failed');

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrl;
}
