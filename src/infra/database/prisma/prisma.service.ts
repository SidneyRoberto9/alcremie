import { PrismaClient } from '@prisma/client';
import { OnModuleInit, OnModuleDestroy, Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  constructor() {
    super({
      log: ['info', 'warn'],
    });
  }

  onModuleDestroy() {
    return this.$connect();
  }

  onModuleInit() {
    return this.$disconnect();
  }
}
