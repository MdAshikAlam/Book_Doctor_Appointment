import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as otpService from '../services/otp.service';
import { z } from 'zod';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';
import { AppError } from '../middlewares/error';
import { verifyGoogleToken } from '../utils/google';


const registerSchema = z.object({
  name: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['patient', 'doctor']).optional(),
  phone: z.string().optional(),
  authProvider: z.string().optional(),
});

const registerAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string(), // accepting phone or email
  password: z.string(),
  isDashboard: z.boolean().optional(),
});

const sendTokenResponse = (result: any, statusCode: number, res: Response) => {
  const { user, accessToken, refreshToken } = result;

  const cookieOptions: any = {
    httpOnly: true,
    secure: false, // Local dev
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    data: { user, accessToken, refreshToken },
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const name = validatedData.fullName || validatedData.name || 'User';
    const result = await authService.registerUser({
      ...validatedData,
      name,
      fullName: name
    } as any);
    sendTokenResponse(result, 201, res);
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerAdminSchema.parse(req.body);
    const result = await authService.registerUser({
      name: validatedData.fullName,
      fullName: validatedData.fullName,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phoneNumber,
      role: 'admin' as any,
      status: 'approved' as any
    } as any);

    sendTokenResponse(result, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(
      validatedData.email, 
      validatedData.password, 
      validatedData.isDashboard
    );

    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by authMiddleware
    res.status(200).json({
      status: 'success',
      data: { user: (req as any).user },
    });
  } catch (error) {
    next(error);
  }
};
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token as string, password);

    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    
    // Check if account already verified but password is not set
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && user.emailVerified && !user.passwordSet) {
      return res.status(200).json({
        status: 'already_verified',
        message: 'Email already verified.',
        data: {
          fullName: user.fullName || user.name || '',
          phoneNumber: user.phone || '',
          clinicName: user.clinicName || '',
          city: user.city || '',
          state: user.state || ''
        }
      });
    }

    const result = await otpService.sendOTP(email);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, fullName } = z.object({
      email: z.string().email(),
      otp: z.string().length(6),
      fullName: z.string().optional()
    }).parse(req.body);
    
    const result = await otpService.verifyOTP(email, otp, fullName);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, isDashboard } = z.object({
      token: z.string(),
      isDashboard: z.boolean().optional()
    }).parse(req.body);

    // Secure Token Verification flow
    const verifiedProfile = await verifyGoogleToken(token);
    const googleAuthData: {
      email: string;
      fullName: string;
      googleId: string;
      profilePicture?: string;
      isDashboard?: boolean;
    } = {
      email: verifiedProfile.email,
      fullName: verifiedProfile.fullName,
      googleId: verifiedProfile.googleId,
    };
    
    if (verifiedProfile.profilePicture) {
      googleAuthData.profilePicture = verifiedProfile.profilePicture;
    }
    if (isDashboard !== undefined) {
      googleAuthData.isDashboard = isDashboard;
    }

    const result = await authService.googleAuth(googleAuthData);

    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
};


export const forgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.forgotPasswordOtp(email);
    res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = z.object({
      email: z.string().email(),
      otp: z.string().length(6),
      password: z.string().min(8)
    }).parse(req.body);

    const result = await authService.resetPasswordOtp(email, otp, password);
    sendTokenResponse(result, 200, res);
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(8)
    }).parse(req.body);

    const emailVal = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailVal });
    
    if (!user) {
      throw new AppError('Account not found.', 404);
    }
    if (!user.emailVerified) {
      throw new AppError('Please verify your email address.', 400);
    }
    if (user.passwordSet) {
      throw new AppError('Password already set. Please login.', 400);
    }

    user.password = password;
    user.passwordSet = true;
    user.status = 'active'; // Account becomes active once password is set
    await user.save();

    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    // Send cookie and token response
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: userObj,
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};
