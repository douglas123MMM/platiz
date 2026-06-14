import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../models/database';

const IMG_ALLOWED = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const VIDEO_ALLOWED = /\.(mp4|webm|mov|mkv|avi|m4v)$/i;

const storage = multer.memoryStorage();

const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (IMG_ALLOWED.test(path.extname(file.originalname))) cb(null, true);
  else cb(new Error('Only images (jpg, png, gif, webp, svg) are allowed'));
};

const videoFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (VIDEO_ALLOWED.test(path.extname(file.originalname))) cb(null, true);
  else cb(new Error('Only videos (mp4, webm, mov, mkv, avi, m4v) are allowed'));
};

export const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadVideo = multer({ storage, fileFilter: videoFilter, limits: { fileSize: 200 * 1024 * 1024 } });

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
