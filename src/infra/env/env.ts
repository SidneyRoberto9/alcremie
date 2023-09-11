import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_SECRET_KEY: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3333),
});

export type Env = z.infer<typeof envSchema>;
