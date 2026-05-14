import ActivityLog from '../models/ActivityLog';
import { Request } from 'express';

export const logActivity = async (
  req: Request,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string
) => {
  try {
    const user = (req as any).user;
    if (!user) return;

    await ActivityLog.create({
      user: user.id,
      action,
      entityType,
      entityId,
      details,
      ipAddress: String(req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''),
      userAgent: req.headers['user-agent'] as string
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
