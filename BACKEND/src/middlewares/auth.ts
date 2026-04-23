import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';
import { verifyAccessToken } from '../utils/auth';
import User, { UserRole } from '../models/User';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyAccessToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = {
      id: currentUser._id.toString(),
      role: currentUser.role as UserRole,
    };
    next();
  } catch (error: any) {
    logger.error('Auth Middleware Error:', error);
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(new AppError('Invalid token. Please log in again.', 401));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const checkAdminOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requester = req.user;
    const targetId = req.params.id;

    if (!requester) return next(new AppError('Unauthorized', 401));

    // Super Admin has full access
    if (requester.role === UserRole.SUPER_ADMIN) return next();

    const targetUser = await User.findById(targetId);
    if (!targetUser) return next(new AppError('User not found', 404));

    // Admin Ownership Check
    if (requester.role === UserRole.ADMIN) {
      // Admin can only access users where they are the parentAdmin
      // OR themselves
      if (targetUser.parentAdmin?.toString() === requester.id || targetUser._id.toString() === requester.id) {
        return next();
      }
    }

    // Sub Admin Ownership Check
    if (requester.role === UserRole.SUB_ADMIN) {
      // Sub Admin can only access doctors they manage (where they are parentSubAdmin)
      // OR themselves
      if (targetUser.parentSubAdmin?.toString() === requester.id || targetUser._id.toString() === requester.id) {
        return next();
      }
    }

    return next(new AppError('You do not have permission to access this user', 403));
  } catch (error) {
    next(error);
  }
};
