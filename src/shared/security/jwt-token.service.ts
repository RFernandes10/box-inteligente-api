import { TokenService } from './token.service';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export class JwtTokenService implements TokenService {
  issueToken(user: { id: string; email: string; role: string; mustChangePassword?: boolean }): string {
    return jwt.sign(
      { email: user.email, role: user.role, pwd: user.mustChangePassword === true },
      env.JWT_SECRET,
      { subject: user.id, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }
}