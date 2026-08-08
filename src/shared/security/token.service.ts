export interface TokenService {
  issueToken(user: { id: string; email: string; role: string; mustChangePassword?: boolean }): string;
}