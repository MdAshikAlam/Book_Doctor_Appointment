import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { z } from 'zod';

export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await User.find({
      role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.DOCTOR] }
    }).select('-password');

    res.status(200).json({
      status: 'success',
      results: staff.length,
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
};

const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
});

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createStaffSchema.parse(req.body);
    
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create({
      ...validatedData,
      isEmailVerified: true
    } as any);

    const u = user as any;
    res.status(201).json({
      status: 'success',
      data: { user: { id: u._id, name: u.name, email: u.email, role: u.role } },
    });
  } catch (error) {
    next(error);
  }
};

const updateStaffSchema = createStaffSchema.partial();

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateStaffSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    Object.assign(user, validatedData);
    await user.save();

    const u = user as any;
    res.status(200).json({
      status: 'success',
      data: { user: { id: u._id, name: u.name, email: u.email, role: u.role } },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    await User.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
