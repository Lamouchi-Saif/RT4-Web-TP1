

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: string;
}
