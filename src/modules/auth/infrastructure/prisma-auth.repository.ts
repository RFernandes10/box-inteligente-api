import { prisma } from '../../../config/database';
import { AuthRepository } from '../domain/auth.repository';
import { AuthUser, RefreshTokenRecord } from '../domain/auth.types';

export class PrismaAuthRepository implements AuthRepository {
  async findUserByEmail(email: string): Promise<AuthUser | null> {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async createRefreshToken(data: { token: string; userId: string; expiresAt: Date }): Promise<void> {
    await prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async findRefreshTokenWithUser(token: string): Promise<RefreshTokenRecord & { user: AuthUser } | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    }) as Promise<RefreshTokenRecord & { user: AuthUser } | null>;
  }

  async deleteRefreshTokenById(id: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { id } });
  }

  async revokeRefreshTokensByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
  }
}