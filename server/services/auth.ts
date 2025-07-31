import crypto from 'crypto';
import { storage } from '../storage';
import { User } from '@shared/schema';

// Generate SHA-256 hash for verification
export function generateCertificateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export interface AuthService {
  createMagicLink(email: string): Promise<string>;
  verifyMagicLink(token: string): Promise<User | null>;
  generateCertificateId(): string;
  hashPassword(password: string): string;
  verifyPassword(password: string, hash: string): boolean;
}

export class AuthServiceImpl implements AuthService {
  async createMagicLink(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await storage.createMagicLink({
      email,
      token,
      expiresAt,
      used: false,
    });
    
    return token;
  }

  async verifyMagicLink(token: string): Promise<User | null> {
    const magicLink = await storage.getMagicLink(token);
    
    if (!magicLink || magicLink.used || magicLink.expiresAt < new Date()) {
      return null;
    }
    
    // Mark as used
    await storage.useMagicLink(token);
    
    // Find or create user
    let user = await storage.getUserByEmail(magicLink.email);
    if (!user) {
      user = await storage.createUser({
        email: magicLink.email,
        name: magicLink.email.split('@')[0], // Default name from email
        role: 'graduate',
      });
    }
    
    return user;
  }

  generateCertificateId(): string {
    const prefix = 'WS';
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
}

export const authService = new AuthServiceImpl();
