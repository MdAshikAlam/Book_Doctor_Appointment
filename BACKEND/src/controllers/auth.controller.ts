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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData as any);

    res.status(201).json({
      status: 'success',
      data: result,
    });
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

    res.status(201).json({
      status: 'success',
      data: result,
    });
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

    res.status(200).json({
      status: 'success',
      data: result,
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

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
