import type { UserRole } from '../../user/enums/user-role.enum.js';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: UserRole;
}
