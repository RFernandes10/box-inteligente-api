import { AuthUser, RefreshTokenRecord } from './auth.types';

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  createRefreshToken(data: { token: string; userId: string; expiresAt: Date }): Promise<void>;
  findRefreshToken(token: string): Promise<RefreshTokenRecord | null>;
  findRefreshTokenWithUser(token: string): Promise<RefreshTokenRecord & { user: AuthUser } | null>;
  deleteRefreshTokenById(id: string): Promise<void>;
  revokeRefreshTokensByUserId(userId: string): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}