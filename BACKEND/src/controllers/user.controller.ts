import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { z } from 'zod';

export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const Patient = (await import('../models/Patient')).default;
    const Doctor = (await import('../models/Doctor')).default;
    let doctorIds: mongoose.Types.ObjectId[] = [];

    // 1. Determine allowed doctors for this user
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) {
      const allDoctors = await Doctor.find().select('_id');
      doctorIds = allDoctors.map(d => d._id as mongoose.Types.ObjectId);
    } else if (currentUser.role === UserRole.DOCTOR) {
      const doctorProfile = await Doctor.findOne({ user: currentUser.id });
      if (doctorProfile) doctorIds = [doctorProfile._id as mongoose.Types.ObjectId];
    } else {
      // Sub-Admins only see their own doctors
      const doctorProfiles = await Doctor.find({
        parentSubAdmin: currentUser.id
      }).select('_id');
      doctorIds = doctorProfiles.map(d => d._id as mongoose.Types.ObjectId);
    }

    // 2. Fetch from Patients collection
    const query: any = {};
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      query.doctorId = { $in: doctorIds };
    }
    
    console.log('Fetching patients with query:', JSON.stringify(query));
    
    const patientsData = await Patient.find(query).sort({ createdAt: -1 });

    console.log(`Fetched ${patientsData.length} patients from Patients collection for doctors:`, doctorIds);

    // Map to the format expected by the frontend if necessary
    const patients = patientsData.map(p => {
      const obj = p.toObject();
      return {
        ...obj,
        name: obj.patientName || 'Unknown Patient',
        fullName: obj.patientName || 'Unknown Patient',
        email: obj.email || '',
        phone: obj.phone || '',
        patientStatus: obj.patientStatus || 'Active'
      };
    });

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
      query.parentAdmin = new mongoose.Types.ObjectId(currentUser.id);
      // Exclude themselves from the "staff" list if desired, but here we show all under them
      query._id = { $ne: new mongoose.Types.ObjectId(currentUser.id) };
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      // Sub Admin only sees Doctors of their parent Admin
      const userDoc = await User.findById(currentUser.id);
      query.role = UserRole.DOCTOR;
      query.parentAdmin = userDoc?.parentAdmin || new mongoose.Types.ObjectId(currentUser.id);
    } else if (currentUser.role === UserRole.DOCTOR) {
      query._id = currentUser.id;
    }
    // SUPER_ADMIN sees all (no extra query filters)

    const staff = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: 'user',
          as: 'doctorProfile'
        }
      },
      {
        $addFields: {
          address: { $arrayElemAt: ['$doctorProfile.address', 0] },
          specialty: { $arrayElemAt: ['$doctorProfile.specialty', 0] },
          city: { $arrayElemAt: ['$doctorProfile.city', 0] },
          country: { $arrayElemAt: ['$doctorProfile.country', 0] }
        }
      },
      { $project: { password: 0, doctorProfile: 0 } }
    ]);

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

    // If role is doctor, create a default Doctor profile so they appear in Doctors list
    if (validatedData.role === UserRole.DOCTOR) {
      const Doctor = (await import('../models/Doctor')).default;
      await Doctor.create({
        user: user._id,
        specialty: 'General',
        experience: 0,
        consultationFee: 0,
        location: {
          type: 'Point',
          coordinates: [0, 0] // Default location
        },
        createdBy: currentUser.id,
        parentAdmin,
        parentSubAdmin
      });
    }

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

    if (user.role === UserRole.DOCTOR) {
      const Doctor = (await import('../models/Doctor')).default;
      await Doctor.findOneAndDelete({ user: id });
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

    // Fetch upcoming/pending appointments for this patient
    const Appointment = (await import('../models/Appointment')).default;
    const activeAppointments = await Appointment.find({ patient: id as any })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .populate('clinic')
      .sort('-date');

    // Fetch past completed visits from Patients collection
    const Patient = (await import('../models/Patient')).default;
    const pastVisits = await Patient.find({ patientId: id as any })
      .sort('-date');

    // Combine them for a full history
    const history = [
      ...activeAppointments.map(a => ({ ...a.toObject(), type: 'appointment' })),
      ...pastVisits.map(p => ({ ...p.toObject(), type: 'visit', status: 'completed' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      status: 'success',
      data: {
        patient,
        appointments: history
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
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id) } });
    } else {
      throw new AppError('Only Admins, Sub-Admins and Super Admins can view hierarchy', 403);
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

export const updatePatientStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { patientStatus } = req.body;
    const Patient = (await import('../models/Patient')).default;

    const patient = await Patient.findByIdAndUpdate(id, { patientStatus }, { new: true });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { patient },
    });
  } catch (error) {
    next(error);
  }
};
