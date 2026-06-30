import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface LoginInput {
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  async login({ email, password }: LoginInput): Promise<TokenResponse> {
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.active) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador.', 403, 'USER_INACTIVE');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      env.JWT_SECRET,
      { subject: user.id, expiresIn: env.JWT_EXPIRES_IN } as any
    );

    const refreshToken = uuidv4();
    const refreshTokenExpiresIn = parseInt(env.JWT_REFRESH_EXPIRES_IN) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresIn);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Refresh token inválido', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expirado', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    const user = storedToken.user;

    if (!user.active) {
      throw new AppError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = jwt.sign(
      { email: user.email, role: user.role },
      env.JWT_SECRET,
      { subject: user.id, expiresIn: env.JWT_EXPIRES_IN } as any
    );

    const newRefreshToken = uuidv4();
    const refreshTokenExpiresIn = parseInt(env.JWT_REFRESH_EXPIRES_IN) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresIn);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
  }
}

export const authService = new AuthService();
