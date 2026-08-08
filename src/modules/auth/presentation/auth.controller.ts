import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../application/auth.service';
import { AppError } from '../../../shared/errors/AppError';
import { successResponse } from '../../../shared/utils/response';
import { clearAuthCookies, setAuthCookies } from '../../../shared/utils/cookies';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  readonly login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      setAuthCookies(res, result.tokens);
      return successResponse(res, result.tokens, 'Login realizado com sucesso');
    } catch (err) {
      next(err);
    }
  };

  readonly refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.box_refresh || req.body.refreshToken;
      if (!refreshToken) {
        throw new AppError('Refresh token ausente', 401, 'REFRESH_TOKEN_MISSING');
      }
      const tokens = await this.authService.refresh(refreshToken);
      setAuthCookies(res, tokens);
      return successResponse(res, tokens, 'Token atualizado');
    } catch (err) {
      next(err);
    }
  };

  readonly changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('Não autorizado', 401, 'UNAUTHORIZED');
      }
      const { currentPassword, newPassword } = req.body;
      const tokens = await this.authService.changePassword(req.user.id, currentPassword, newPassword);
      setAuthCookies(res, tokens);
      return successResponse(res, tokens, 'Senha alterada com sucesso');
    } catch (err) {
      next(err);
    }
  };

  readonly logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.box_refresh || req.body.refreshToken;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      clearAuthCookies(res);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}