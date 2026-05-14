import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';
import { verifyAccessToken } from '../utils/auth';
import User, { UserRole } from '../models/User';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    branchId?: string | undefined;
    branchIds?: string[] | undefined;
    clinicId?: string | undefined;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Debug logging
    console.log('Incoming Cookies:', req.cookies);
    console.log('Authorization Header:', req.headers.authorization);
    console.log('Raw Cookie Header:', req.headers.cookie);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/accessToken=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const decoded = verifyAccessToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 1. Check User Status
    const loginAllowedStatus = ['active', 'approved'];
    if (!loginAllowedStatus.includes(currentUser.status || '')) {
      let message = 'Your account is currently inactive.';
      if (currentUser.status === 'suspended') message = 'Your account has been suspended. Please contact support.';
      if (currentUser.status === 'deleted') message = 'This account has been deleted.';
      if (currentUser.status === 'pending') message = 'Your account is pending approval.';
      if (currentUser.status === 'rejected') message = 'Your application was rejected.';
      
      return next(new AppError(message, 403));
    }

    // 2. Check if user changed password or logged out after the token was issued
    if (currentUser.lastLogoutAt && decoded.iat) {
      const changedTimestamp = Math.floor(currentUser.lastLogoutAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('User recently logged out or session expired. Please log in again.', 401));
      }
    }

    req.user = {
      id: currentUser._id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role as UserRole,
      branchId: currentUser.branchId?.toString(),
      branchIds: (currentUser as any).branchIds?.map((id: any) => id.toString()),
      clinicId: currentUser.clinic?.toString(),
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

export const optionalProtect = async (
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
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    req.user = {
      id: currentUser._id.toString(),
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role as UserRole,
      branchId: currentUser.branchId?.toString(),
      branchIds: (currentUser as any).branchIds?.map((id: any) => id.toString()),
      clinicId: currentUser.clinic?.toString(),
    };
    next();
  } catch (error: any) {
    // If token is invalid or expired, just proceed without user
    next();
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

    const targetUser = await User.findById(targetId);
    if (!targetUser) return next(new AppError('User not found', 404));

    // Super Admin has full access
    if (requester.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Admin Ownership Check
    if (requester.role === UserRole.ADMIN) {
      // Admin can only access users where they are the parentAdmin
      // OR themselves
      if (targetUser.parentAdmin?.toString() === requester.id || targetUser._id.toString() === requester.id) {
        return next();
      }
    }

    // Receptionist Ownership Check
    if (requester.role === UserRole.RECEPTIONIST) {
      // Receptionist can only access doctors they manage (where they are parentReceptionist)
      // OR themselves
      if (targetUser.parentReceptionist?.toString() === requester.id || targetUser._id.toString() === requester.id) {
        return next();
      }
    }

    return next(new AppError('You do not have permission to access this user', 403));
  } catch (error) {
    next(error);
  }
};

export const checkDoctorOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requester = req.user;
    const doctorId = req.params.id;

    if (!requester) return next(new AppError('Unauthorized', 401));

    const Doctor = mongoose.model('Doctor');
    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) return next(new AppError('Doctor not found', 404));

    const targetUser = (doctor as any).user;
    if (!targetUser) return next(new AppError('User profile not found for this doctor', 404));

    // Super Admin has full access
    if (requester.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Admin Ownership Check
    if (requester.role === UserRole.ADMIN) {
      if (targetUser.parentAdmin?.toString() === requester.id) {
        return next();
      }
    }

    // Receptionist Ownership Check
    if (requester.role === UserRole.RECEPTIONIST) {
      if (targetUser.parentReceptionist?.toString() === requester.id) {
        return next();
      }
    }

    // Doctor Check: Can manage their own profile
    if (requester.role === UserRole.DOCTOR) {
      if (targetUser._id.toString() === requester.id) {
        return next();
      }
    }

    return next(new AppError('You do not have permission to manage this doctor', 403));
  } catch (error) {
    next(error);
  }
};
