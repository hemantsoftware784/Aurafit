import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { admins } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  admin?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const adminKey = req.headers['x-admin-token'] as string;
  if (!adminKey) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // If admin token format is "admin_<id>_<timestamp>" or parsed
    const parts = adminKey.split('_');
    if (parts[0] === 'auraadmin' && parts[1]) {
      const adminId = parseInt(parts[1], 10);
      const found = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
      if (found.length > 0 && found[0].isActive) {
        req.admin = {
          id: found[0].id,
          email: found[0].email,
          name: found[0].name,
          role: found[0].role,
        };
        return next();
      }
    }
    return res.status(403).json({ error: 'Invalid or expired admin session' });
  } catch (err) {
    console.error('Admin auth check failed:', err);
    return res.status(403).json({ error: 'Admin authentication failed' });
  }
};
