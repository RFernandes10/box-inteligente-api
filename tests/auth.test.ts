import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-token'),
    verify: vi.fn(),
  },
}));

import { AuthService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/config/database';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    vi.clearAllMocks();
  });

  it('deve autenticar com credenciais válidas', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash: '$2b$12$hashedpassword',
      role: 'ADMIN',
      active: true,
      deletedAt: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: '1', token: 'refresh' } as never);

    const result = await service.login({ email: 'admin@test.com', password: 'Admin@123' });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('admin@test.com');
  });

  it('deve rejeitar senha incorreta', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@test.com',
      passwordHash: '$2b$12$hashedpassword',
      role: 'ADMIN',
      active: true,
      deletedAt: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({ email: 'admin@test.com', password: 'wrongpassword' })
    ).rejects.toThrow('Email ou senha incorretos');
  });

  it('deve rejeitar email inexistente', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      service.login({ email: 'nonexistent@test.com', password: 'password' })
    ).rejects.toThrow('Email ou senha incorretos');
  });

  it('deve bloquear usuário inativo', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@test.com',
      passwordHash: '$2b$12$hashedpassword',
      role: 'ADMIN',
      active: false,
      deletedAt: null,
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    await expect(
      service.login({ email: 'admin@test.com', password: 'Admin@123' })
    ).rejects.toThrow('Usuário inativo');
  });
});
