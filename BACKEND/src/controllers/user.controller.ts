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
    const branchId = (req as any).branchId;
    const query: any = {};

    // Data Isolation Logic
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Global access: no branch filter unless selected
      if (branchId) {
        query.branchId = new mongoose.Types.ObjectId(branchId);
      }
    } else {
      // Branch-specific access
      if (!branchId) {
        return next(new AppError('Unauthorized: Branch context missing', 403));
      }
      query.branchId = new mongoose.Types.ObjectId(branchId);

      // Role-specific restrictions
      if (currentUser.role === UserRole.DOCTOR) {
        const doctorProfile = await Doctor.findOne({ user: currentUser.id });
        if (doctorProfile) {
          query.doctorId = doctorProfile._id;
        }
      }
    }
    
    console.log('Fetching patients with query:', JSON.stringify(query));
    
    const patientsData = await Patient.find(query).sort({ createdAt: -1 });

    console.log(`Fetched ${patientsData.length} patients from Patients collection`);

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
      data: { patients }
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const admins = await User.find({ 
      role: UserRole.ADMIN, 
      status: status as any
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: admins.length,
      data: { admins }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason } = z.object({
      status: z.enum(['pending', 'approved', 'rejected']),
      rejectionReason: z.string().optional()
    }).parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    const oldStatus = user.status;
    user.status = status;
    if (rejectionReason) user.rejectionReason = rejectionReason;

    // Admin Approval Logic: Automatically set up Organization and Clinic
    if (user.role === UserRole.ADMIN && oldStatus === 'pending' && status === 'approved') {
      const Organization = (await import('../models/Organization')).default;
      const Clinic = (await import('../models/Clinic')).default;

      // Only create if not already exists (safety for re-approval)
      let clinicId = user.clinic;

      if (!clinicId) {
        // 1. Create Organization
        const org = await Organization.create({
          name: user.clinicName || `${user.name}'s Organization`,
          owner: user._id as any,
          email: user.email,
          phone: user.phone || '0000000000'
        });

        // 2. Create Initial Clinic Branch
        const clinic = await Clinic.create({
          clinicName: user.clinicName || `${user.name}'s Clinic`,
          legalName: user.clinicName || `${user.name}'s Clinic`,
          ownerName: user.name,
          ownerPhone: user.phone || '0000000000',
          ownerEmail: user.email,
          owner: user._id as any,
          createdByAdminId: user._id as any,
          city: user.city || 'Unknown',
          state: user.state || 'Unknown',
          address: user.city || 'Main Street',
          pincode: '000000',
          phone: user.phone || '0000000000',
          email: user.email,
          openingTime: '09:00',
          closingTime: '21:00',
          registrationNumber: user.governmentIdNumber || `REG-${user._id.toString().slice(-6)}`,
          registrationProof: 'system-generated-proof',
          location: { type: 'Point', coordinates: [0, 0] },
          clinicStatus: 'approved' 
        });

        clinicId = clinic._id as any;
      }

      user.clinic = clinicId as any;
      user.branchId = clinicId as any;
      user.branchIds = [clinicId as any];
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const branchId = (req as any).branchId;
    let query: any = {
      role: { $nin: [UserRole.SUPER_ADMIN, UserRole.PATIENT] },
      status: 'approved'
    };

    // Data Isolation Logic
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Global Mode: No branch filter unless specifically selected
      if (branchId) {
        query.branchId = new mongoose.Types.ObjectId(branchId);
      }
    } else {
      // Branch-Specific Mode: Enforce current branch filtering
      if (!branchId) {
        return next(new AppError('Unauthorized: No branch context found', 403));
      }
      query.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // Additional Role-based filtering for internal hierarchy (optional, but keep for safety)
    if (currentUser.role === UserRole.ADMIN) {
      // Admin sees everyone in their branch except themselves? 
      // Usually they want to see all staff in the branch.
      // query._id = { $ne: new mongoose.Types.ObjectId(currentUser.id) };
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      // Receptionists only see doctors in their branch
      query.role = UserRole.DOCTOR;
    } else if (currentUser.role === UserRole.DOCTOR) {
      // Doctors only see themselves in staff list? Or others in same branch?
      // Let's assume they only see themselves for now or limited info.
      query._id = new mongoose.Types.ObjectId(currentUser.id);
    }

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
        $lookup: {
          from: 'clinics',
          localField: 'branchId',
          foreignField: '_id',
          as: 'branchInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'parentAdmin',
          foreignField: '_id',
          as: 'parentAdminInfo'
        }
      },
      {
        $addFields: {
          address: { $arrayElemAt: ['$doctorProfile.address', 0] },
          specialty: { $arrayElemAt: ['$doctorProfile.specialty', 0] },
          city: { $arrayElemAt: ['$doctorProfile.city', 0] },
          country: { $arrayElemAt: ['$doctorProfile.country', 0] },
          branchName: { 
            $ifNull: [
              { $arrayElemAt: ['$branchInfo.clinicName', 0] }, 
              '$clinicName'
            ] 
          },
          parentName: { $arrayElemAt: ['$parentAdminInfo.name', 0] }
        }
      },
      { $project: { password: 0, doctorProfile: 0, branchInfo: 0, parentAdminInfo: 0 } }
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
  clinicId: z.string().optional(),
});

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const validatedData = createStaffSchema.parse(req.body);

    // Permission Checks for creation
    if (currentUser.role === UserRole.RECEPTIONIST) {
      if (validatedData.role !== UserRole.DOCTOR) {
        throw new AppError('Receptionist can only create Doctors', 403);
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      throw new AppError('Doctors cannot create users', 403);
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
       // Super admin can create anyone
    }

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Determine Parents
    let parentAdmin: any = undefined;
    let parentReceptionist: any = undefined;

    if (currentUser.role === UserRole.ADMIN) {
      parentAdmin = currentUser.id;
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      const creator = await User.findById(currentUser.id);
      parentAdmin = creator?.parentAdmin;
      parentReceptionist = currentUser.id;
    }

    const branchId = (req as any).branchId;

    const user = await User.create({
      ...validatedData,
      isEmailVerified: true,
      clinic: currentUser.clinicId,
      branchId: validatedData.clinicId || (req as any).branchId || undefined,
      createdBy: currentUser.id,
      parentAdmin,
      parentReceptionist
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
        clinic: currentUser.clinicId,
        branchId: validatedData.clinicId || (req as any).branchId || undefined,
        createdBy: currentUser.id,
        parentAdmin,
        parentReceptionist
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
      if (user.role === UserRole.ADMIN && user.id !== currentUser.id) {
        throw new AppError('Admin cannot modify other Admins', 403);
      }
      if (user.createdBy?.toString() !== currentUser.id && user.id !== currentUser.id) {
        throw new AppError('Admin can only manage users they created', 403);
      }
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      if (user.role !== UserRole.DOCTOR && user.id !== currentUser.id) {
        throw new AppError('Receptionist can only manage Doctors or themselves', 403);
      }
      if (user.role === UserRole.DOCTOR && user.createdBy?.toString() !== currentUser.id) {
        throw new AppError('Receptionist can only manage Doctors they created', 403);
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      if (user.id !== currentUser.id) {
        throw new AppError('Doctors can only update their own profile', 403);
      }
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin can update anyone
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
      if (user.role === UserRole.ADMIN) {
        throw new AppError('Admin cannot delete other Admins', 403);
      }
      if (user.createdBy?.toString() !== requester.id) {
        throw new AppError('Admin can only delete users they created', 403);
      }
    } else if (requester.role === UserRole.RECEPTIONIST) {
      if (user.role !== UserRole.DOCTOR || user.createdBy?.toString() !== requester.id) {
        throw new AppError('Receptionist can only delete Doctors they created', 403);
      }
    } else if (requester.role === UserRole.DOCTOR) {
      throw new AppError('Doctors cannot delete users', 403);
    } else if (requester.role === UserRole.SUPER_ADMIN) {
      // Super admin can delete anyone
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
    if (currentUser.role === UserRole.ADMIN) {
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id), status: 'approved' } });
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id), status: 'approved' } });
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin sees all admins as root of hierarchies
      stages.push({ $match: { role: UserRole.ADMIN, status: 'approved' } });
    } else {
      throw new AppError('Only Admins, Receptionists and Super Admins can view hierarchy', 403);
    }

    // 2. Receptionist Lookup
    stages.push({
      $lookup: {
        from: 'users',
        let: { adminId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$role', UserRole.RECEPTIONIST] },
                  { $eq: ['$parentAdmin', '$$adminId'] },
                  { $eq: ['$status', 'approved'] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              let: { receptionistId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$role', UserRole.DOCTOR] },
                        { $eq: ['$parentReceptionist', '$$receptionistId'] },
                        { $eq: ['$status', 'approved'] }
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
        as: 'receptionists'
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
                  { $eq: ['$status', 'approved'] },
                  { $not: ['$parentReceptionist'] }
                ]
              }
            }
          },
          { $project: { password: 0, refreshToken: 0 } }
        ],
        as: 'doctors'
      }
    });
    
    // Lookup Branch Info for the root members (Admins/Receptionists)
    stages.push({
      $lookup: {
        from: 'clinics',
        localField: 'branchId',
        foreignField: '_id',
        as: 'branchInfo'
      }
    });

    // 4. Cleanup and Format
    stages.push({
      $addFields: {
        branchName: { 
          $ifNull: [
            { $arrayElemAt: ['$branchInfo.clinicName', 0] }, 
            '$clinicName'
          ] 
        }
      }
    });

    stages.push({
      $project: { password: 0, refreshToken: 0, branchInfo: 0 }
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
    const Patient = (await import('../models/Patient')).default;
    const patient = await Patient.findByIdAndUpdate(id, req.body, { new: true });

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
