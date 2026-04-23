import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { z } from 'zod';

export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let query: any = { role: UserRole.PATIENT };

    if (currentUser.role === UserRole.ADMIN) {
      query.parentAdmin = currentUser.id;
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      query.parentSubAdmin = currentUser.id;
    }

    const patients = await User.find(query).select('-password');
    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: { patients },
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let query: any = {
      role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.DOCTOR] }
    };

    // Data Isolation & Hierarchy
    if (currentUser.role === UserRole.ADMIN) {
      // Admin only sees users where they are the parentAdmin
      query.parentAdmin = currentUser.id;
      // Exclude themselves from the "staff" list if desired, but here we show all under them
      query._id = { $ne: currentUser.id };
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      // Sub Admin only sees Doctors they manage
      query.role = UserRole.DOCTOR;
      query.parentSubAdmin = currentUser.id;
    } else if (currentUser.role === UserRole.DOCTOR) {
      query._id = currentUser.id;
    }
    // SUPER_ADMIN sees all (no extra query filters)

    const staff = await User.find(query).select('-password');

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
    const currentUser = (req as any).user;
    const validatedData = createStaffSchema.parse(req.body);
    
    // Permission Checks for creation
    if (currentUser.role === UserRole.ADMIN) {
      if (validatedData.role === UserRole.SUPER_ADMIN) {
        throw new AppError('Admin cannot create Super Admin', 403);
      }
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      if (validatedData.role !== UserRole.DOCTOR) {
        throw new AppError('Sub Admin can only create Doctors', 403);
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      throw new AppError('Doctors cannot create users', 403);
    }

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Determine Parents
    let parentAdmin: any = undefined;
    let parentSubAdmin: any = undefined;

    if (currentUser.role === UserRole.ADMIN) {
      parentAdmin = currentUser.id;
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      const creator = await User.findById(currentUser.id);
      parentAdmin = creator?.parentAdmin;
      parentSubAdmin = currentUser.id;
    }

    const user = await User.create({
      ...validatedData,
      isEmailVerified: true,
      createdBy: currentUser.id,
      parentAdmin,
      parentSubAdmin
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
    const currentUser = (req as any).user;
    const validatedData = updateStaffSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Permission Checks for update
    if (currentUser.role === UserRole.ADMIN) {
      if (user.role === UserRole.SUPER_ADMIN) {
        throw new AppError('Admin cannot modify Super Admin', 403);
      }
      if (user.role === UserRole.ADMIN && user.id !== currentUser.id) {
        throw new AppError('Admin cannot modify other Admins', 403);
      }
      if (user.createdBy?.toString() !== currentUser.id && user.id !== currentUser.id) {
        throw new AppError('Admin can only manage users they created', 403);
      }
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      if (user.role !== UserRole.DOCTOR && user.id !== currentUser.id) {
        throw new AppError('Sub Admin can only manage Doctors or themselves', 403);
      }
      if (user.role === UserRole.DOCTOR && user.createdBy?.toString() !== currentUser.id) {
        throw new AppError('Sub Admin can only manage Doctors they created', 403);
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      if (user.id !== currentUser.id) {
        throw new AppError('Doctors can only update their own profile', 403);
      }
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

    const requester = (req as any).user;
    if (id === requester.id) {
      throw new AppError('You cannot delete your own account', 403);
    }

    // Permission Checks for deletion
    if (requester.role === UserRole.ADMIN) {
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
        throw new AppError('Admin cannot delete Super Admin or other Admins', 403);
      }
      if (user.createdBy?.toString() !== requester.id) {
        throw new AppError('Admin can only delete users they created', 403);
      }
    } else if (requester.role === UserRole.SUB_ADMIN) {
      if (user.role !== UserRole.DOCTOR || user.createdBy?.toString() !== requester.id) {
        throw new AppError('Sub Admin can only delete Doctors they created', 403);
      }
    } else if (requester.role === UserRole.DOCTOR) {
      throw new AppError('Doctors cannot delete users', 403);
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

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const patient = await User.findById(id).select('-password');
    
    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new AppError('Patient not found', 404);
    }

    // Fetch appointments for this patient
    const Appointment = (await import('../models/Appointment')).default;
    const appointments = await Appointment.find({ patient: id as any })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .populate('clinic')
      .sort('-date');

    res.status(200).json({
      status: 'success',
      data: { 
        patient,
        appointments
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHierarchy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    
    // Aggregation stages
    const stages: any[] = [];

    // 1. Initial Match
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      stages.push({ $match: { role: UserRole.ADMIN } });
    } else if (currentUser.role === UserRole.ADMIN) {
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id) } });
    } else {
      throw new AppError('Only Admins and Super Admins can view hierarchy', 403);
    }

    // 2. Sub-Admin Lookup
    stages.push({
      $lookup: {
        from: 'users',
        let: { adminId: '$_id' },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$role', UserRole.SUB_ADMIN] },
                  { $eq: ['$parentAdmin', '$$adminId'] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              let: { subAdminId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$role', UserRole.DOCTOR] },
                        { $eq: ['$parentSubAdmin', '$$subAdminId'] }
                      ]
                    }
                  }
                },
                { $project: { password: 0, refreshToken: 0 } }
              ],
              as: 'doctors'
            }
          },
          { $project: { password: 0, refreshToken: 0 } }
        ],
        as: 'subAdmins'
      }
    });

    // 3. Direct Doctors Lookup
    stages.push({
      $lookup: {
        from: 'users',
        let: { adminId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$role', UserRole.DOCTOR] },
                  { $eq: ['$parentAdmin', '$$adminId'] },
                  { $not: ['$parentSubAdmin'] }
                ]
              }
            }
          },
          { $project: { password: 0, refreshToken: 0 } }
        ],
        as: 'doctors'
      }
    });

    // 4. Cleanup
    stages.push({
      $project: { password: 0, refreshToken: 0 }
    });

    const hierarchy = await User.aggregate(stages);

    res.status(200).json({
      status: 'success',
      data: { hierarchy },
    });
  } catch (error) {
    next(error);
  }
};
