import { Reflector } from '@nestjs/core';
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { PrismaUserRepository } from '@/infra/database/prisma/repository/prisma-user.repository';
import { UserRepository } from '@/domain/alcremie/application/repositories/user.repository';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
  ) {}

  matchRoles(roles: string[], userRole: string): boolean {
    return roles.some((role) => role === userRole);
  }

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user.role;

    return this.matchRoles(roles, userRole);
  }
}
