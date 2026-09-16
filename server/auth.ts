import crypto from 'crypto';
import express from 'express';
import { dbService, DbUser } from './db';

// Standard 32-byte secret for JWT HMAC signing
const JWT_SECRET = process.env.JWT_SECRET || 'soultalk_secure_jwt_secret_key_2026_sanctuary_auth';

export interface TokenPayload {
  userId: string;
  email: string;
  isGuest: boolean;
  iat: number;
  exp: number;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function generateJwtToken(user: { id: string; email: string; is_guest?: number | boolean }): string {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    isGuest: Boolean(user.is_guest),
    iat: now,
    exp: now + 60 * 60 * 24 * 30 // 30 days session
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends express.Request {
  user?: DbUser;
}

export async function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please provide a valid Bearer token.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyJwtToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({
      error: 'Invalid or expired session. Please log in again.',
      code: 'TOKEN_INVALID'
    });
  }

  try {
    const user = await dbService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User account not found. Please re-authenticate.',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(500).json({
      error: `Database authentication error: ${err.message}`,
      code: 'DB_ERROR'
    });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = verifyJwtToken(token);
    if (payload && payload.userId) {
      try {
        const user = await dbService.getUserById(payload.userId);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (err) {
        // Fall through to guest
      }
    }
  }

  // If no auth token or invalid, check if guest session or provision temporary isolated user
  next();
}
