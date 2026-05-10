import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['patient', 'doctor']).optional(),
  phone: z.string().optional(),
});

const registerAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string(),
  governmentIdType: z.enum(['Aadhar', 'PAN', 'Passport']),
  governmentIdNumber: z.string(),
  idProofDocument: z.string().optional(),
  clinicName: z.string(),
  city: z.string(),
  state: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
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
    const result = await authService.registerUser(validatedData as any);
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
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phoneNumber,
      governmentIdType: validatedData.governmentIdType as any,
      governmentIdNumber: validatedData.governmentIdNumber,
      idProofDocument: validatedData.idProofDocument,
      clinicName: validatedData.clinicName,
      city: validatedData.city,
      state: validatedData.state,
      role: 'admin' as any,
      status: 'pending' as any
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
