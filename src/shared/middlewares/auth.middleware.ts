import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';
import { ACCESS_COOKIE } from '../utils/cookies';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  pwd?: boolean;
}

declare global {
  // Augmentação de tipo do Express exige namespace
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        pwd?: boolean;
      };
    }
  }
}

const AUTH_BYPASS_PATHS = new Set(['/login', '/refresh', '/logout', '/change-password']);

function isAuthBypass(req: Request): boolean {
  return req.baseUrl === '/api/auth' && AUTH_BYPASS_PATHS.has(req.path);
}

function isMutationRequest(req: Request): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;

  const token = authHeader ? authHeader.split(' ')[1] : cookieToken;

  if (!token) {
    throw new AppError('Token não fornecido', 401, 'TOKEN_MISSING');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      pwd: decoded.pwd === true,
    };

    if (decoded.pwd === true && isMutationRequest(req) && !isAuthBypass(req)) {
      throw new AppError('É necessário alterar a senha padrão antes de prosseguir', 403, 'PASSWORD_CHANGE_REQUIRED');
    }

    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Token inválido ou expirado', 401, 'TOKEN_INVALID');
  }
}