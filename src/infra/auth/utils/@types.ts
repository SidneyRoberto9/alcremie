import { z } from 'zod';

import { Optional } from '@prisma/client/runtime/library';
import { UserProps } from '@/domain/alcremie/enterprise/entities/user';

export type SignUser = Optional<UserProps, 'favorites' | 'createdAt'>;

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(['DEFAULT', 'ADMIN']),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
