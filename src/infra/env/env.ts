import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3333),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),

  DATABASE_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_SECRET_KEY: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  HUGGING_FACE_API: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
