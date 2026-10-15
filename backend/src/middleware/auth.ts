import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models/User';
import { HttpError } from './errorhandler';

// tell typescript that req.user can exist
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Please login first');
  }

  const token = header.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  try {
    const data = jwt.verify(token, secret) as { id: string; role: Role };
    req.user = { id: data.id, role: data.role };
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

// allow only some roles, like requireRole('brand')
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'You are not allowed to do this');
    }
    next();
  };
}