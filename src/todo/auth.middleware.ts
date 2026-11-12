
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['auth-user'];
    const secret = process.env.JWT_SECRET;
    console.log('JWT_SECRET chargé :', !!secret);

    if (typeof token !== 'string' || !secret) {
      res.status(401).json({
        message: 'You cannot access this resource',
      });
      return;
    }
console.log('Header reçu :', typeof token);
    try {
      const decoded = jwt.verify(token, secret);

      if (
        typeof decoded === 'string' ||
        decoded.userId === undefined ||
        decoded.userId === null
      ) {
        res.status(401).json({
          message: 'You cannot access this resource',
        });
        return;
      }

      (req as AuthenticatedRequest).userId = String(decoded.userId);
      next();
    } catch {
      res.status(401).json({
        message: 'You cannot access this resource',
      });
    }
  }
}
