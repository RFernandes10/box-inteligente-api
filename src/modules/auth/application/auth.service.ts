import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env';
import { AppError } from '../../../shared/errors/AppError';
import { PasswordHasher } from '../../../shared/security/password-hasher';
import { TokenService } from '../../../shared/security/token.service';
import { AuthRepository } from '../domain/auth.repository';
import { LoginInput, AuthUser, TokenResponse } from '../domain/auth.types';

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  private toPublicUser(user: AuthUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  }

  private buildTokensForUser(user: AuthUser, mustChangePassword = user.mustChangePassword): TokenResponse {
    const accessToken = this.tokenService.issueToken({
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword,
    });
    const refreshToken = uuidv4();
    const refreshTokenExpiresIn = parseInt(env.JWT_REFRESH_EXPIRES_IN) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresIn);

    return { accessToken, refreshToken, user: { ...this.toPublicUser({ ...user, mustChangePassword }) } };
  }

  async login({ email, password }: LoginInput): Promise<{ tokens: TokenResponse; refreshTokenExpiresAt: Date }> {
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.active) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador.', 403, 'USER_INACTIVE');
    }

    const passwordMatch = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.buildTokensForUser(user);
    await this.persistRefreshToken(tokens.refreshToken, user.id);
    return { tokens, refreshTokenExpiresAt: this.computeRefreshExpiresAt() };
  }

  private computeRefreshExpiresAt(): Date {
    const expiresAt = new Date();
    const days = parseInt(env.JWT_REFRESH_EXPIRES_IN) || 30;
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private async persistRefreshToken(token: string, userId: string): Promise<void> {
    await this.repository.createRefreshToken({ token, userId, expiresAt: this.computeRefreshExpiresAt() });
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const storedToken = await this.repository.findRefreshTokenWithUser(refreshToken);

    if (!storedToken) {
      throw new AppError('Refresh token inválido', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (new Date() > storedToken.expiresAt) {
      await this.repository.deleteRefreshTokenById(storedToken.id);
      throw new AppError('Refresh token expirado', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    const user = storedToken.user;

    if (!user.active) {
      throw new AppError('Usuário inativo', 403, 'USER_INACTIVE');
    }

    await this.repository.deleteRefreshTokenById(storedToken.id);

    const tokens = this.buildTokensForUser(user);
    await this.persistRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<TokenResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    const passwordMatch = await this.passwordHasher.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const newHash = await this.passwordHasher.hash(newPassword);
    await this.repository.updatePassword(userId, newHash);
    await this.repository.revokeRefreshTokensByUserId(userId);

    const tokens = this.buildTokensForUser(user, false);
    await this.persistRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await this.repository.findRefreshToken(refreshToken);
    if (storedToken) {
      await this.repository.deleteRefreshTokenById(storedToken.id);
    }
  }
}