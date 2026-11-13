import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator.js';

import type { AuthenticatedUser } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {

    // 1. Get the roles required by the route
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // 2. If no role is required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Get the current HTTP request
    const request = context.switchToHttp().getRequest();

    // 4. Get the authenticated user
    const user = request.user as AuthenticatedUser | undefined;

    // 5. Check whether the user has an allowed role
    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}