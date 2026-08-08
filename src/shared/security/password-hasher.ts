export interface PasswordHasher {
  hash(password: string, rounds?: number): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}