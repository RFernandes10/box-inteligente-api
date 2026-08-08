import { PasswordHasher } from './password-hasher';
import bcrypt from 'bcrypt';

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string, rounds = 12): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}