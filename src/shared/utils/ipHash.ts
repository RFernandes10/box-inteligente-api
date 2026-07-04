import crypto from 'crypto';
import { env } from '../../config/env';

export function hashIP(ip: string): string {
  if (!ip) return '';
  return crypto
    .createHash('sha256')
    .update(ip + env.IP_HASH_SALT)
    .digest('hex');
}
