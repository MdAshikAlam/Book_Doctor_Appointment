import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { z } from 'zod';
import { logActivity } from '../utils/activityLogger';

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

    // Admin Approval logic handled by super admin manual review
    // Clinic/Organization creation is now done manually by the Admin after login

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
      status: { $in: ['active', 'approved', 'suspended', 'inactive'] }
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
    const user = await User.findById(id).select('+password +refreshToken +passwordResetToken +passwordResetExpires');
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

    const deletedEmail = user.email;
    const TrashBin = (await import('../models/TrashBin')).default;

    // 1. If it's an Admin, we need to gather all related data
    if (user.role === UserRole.ADMIN) {
      // Find all Clinics owned by this admin
      const Clinic = (await import('../models/Clinic')).default;
      const clinics = await Clinic.find({ owner: id });
      for (const clinic of clinics) {
        await TrashBin.create({
          originalId: clinic._id,
          collectionName: 'clinics',
          data: clinic.toObject(),
          deletedBy: requester.id,
          adminId: id as any
        });
        await Clinic.findByIdAndDelete(clinic._id);
      }

      // Find all Staff members belonging to this admin
      const staffMembers = await User.find({ parentAdmin: id as any }).select('+password +refreshToken +passwordResetToken +passwordResetExpires');
      for (const staff of staffMembers) {
        // Find if they have a doctor profile
        if (staff.role === UserRole.DOCTOR) {
          const Doctor = (await import('../models/Doctor')).default;
          const doctorProfile = await Doctor.findOne({ user: staff._id });
          if (doctorProfile) {
            await TrashBin.create({
              originalId: doctorProfile._id,
              collectionName: 'doctors',
              data: doctorProfile.toObject(),
              deletedBy: requester.id,
              adminId: id as any
            });
            await Doctor.findByIdAndDelete(doctorProfile._id);
          }
        }
        
        await TrashBin.create({
          originalId: staff._id,
          collectionName: 'users',
          data: staff.toObject(),
          deletedBy: requester.id,
          adminId: id as any
        });
        await User.findByIdAndDelete(staff._id);
      }
    } else if (user.role === UserRole.DOCTOR) {
      // If single doctor deleted, move profile too
      const Doctor = (await import('../models/Doctor')).default;
      const doctorProfile = await Doctor.findOne({ user: id });
      if (doctorProfile) {
        await TrashBin.create({
          originalId: doctorProfile._id,
          collectionName: 'doctors',
          data: doctorProfile.toObject(),
          deletedBy: requester.id,
          adminId: (user.parentAdmin || id) as any
        });
        await Doctor.findByIdAndDelete(doctorProfile._id);
      }
    }

    // Move the primary user to trash
    await TrashBin.create({
      originalId: user._id,
      collectionName: 'users',
      data: user.toObject(),
      deletedBy: requester.id,
      adminId: (user.role === UserRole.ADMIN ? user._id : user.parentAdmin || user._id) as any
    });

    await User.findByIdAndDelete(id);

    await logActivity(req, 'DELETE_USER', 'User', id as any, `User ${deletedEmail} and related data moved to trash`);

    res.status(200).json({
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
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id), status: { $in: ['active', 'approved'] } } });
    } else if (currentUser.role === UserRole.RECEPTIONIST) {
      stages.push({ $match: { _id: new mongoose.Types.ObjectId(currentUser.id), status: { $in: ['active', 'approved'] } } });
    } else if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin sees all admins as root of hierarchies
      stages.push({ $match: { role: UserRole.ADMIN, status: { $in: ['active', 'approved', 'suspended', 'inactive'] } } });
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
                  { $in: ['$status', ['active', 'approved', 'suspended', 'inactive']] }
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
                        { $in: ['$status', ['active', 'approved', 'suspended', 'inactive']] }
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
                  { $in: ['$status', ['active', 'approved', 'suspended', 'inactive']] },
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

// --- Super Admin Management Features ---

export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    user.status = 'suspended';
    user.lastLogoutAt = new Date(); // Invalidate current JWTs
    (user as any).refreshToken = undefined; // Remove refresh token
    await user.save();

    await logActivity(req, 'SUSPEND_USER', 'User', user.id, `User ${user.email} suspended`);

    res.status(200).json({
      status: 'success',
      message: 'User suspended successfully and logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

export const reactivateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    user.status = 'active';
    await user.save();

    await logActivity(req, 'REACTIVATE_USER', 'User', user.id, `User ${user.email} reactivated`);

    res.status(200).json({
      status: 'success',
      message: 'User reactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = z.object({
      password: z.string().min(8)
    }).parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    user.password = password;
    user.lastLogoutAt = new Date(); // Invalidate current JWTs
    (user as any).refreshToken = undefined; // Logout from all devices
    await user.save();

    await logActivity(req, 'RESET_PASSWORD', 'User', user.id, `Password reset for user ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully and user logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
};

export const transferAdminData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fromAdminId, toAdminId } = z.object({
      fromAdminId: z.string(),
      toAdminId: z.string()
    }).parse(req.body);

    const fromAdmin = await User.findById(fromAdminId);
    const toAdmin = await User.findById(toAdminId);

    if (!fromAdmin || !toAdmin) {
      throw new AppError('One or both admins not found', 404);
    }

    // 1. Transfer Clinics ownership
    const Clinic = (await import('../models/Clinic')).default;
    await Clinic.updateMany(
      { owner: fromAdminId },
      { owner: toAdminId as any, createdByAdminId: toAdminId as any }
    );

    // 2. Transfer Staff hierarchy
    await User.updateMany(
      { parentAdmin: fromAdminId as any },
      { parentAdmin: toAdminId as any }
    );

    // 3. Transfer Doctors (profile collection)
    const Doctor = (await import('../models/Doctor')).default;
    await Doctor.updateMany(
      { parentAdmin: fromAdminId as any },
      { parentAdmin: toAdminId as any }
    );

    res.status(200).json({
      status: 'success',
      message: 'Data ownership and hierarchy transferred successfully'
    });

    await logActivity(req, 'TRANSFER_DATA', 'User', fromAdminId, `Data transferred from ${fromAdmin.email} to ${toAdmin.email}`);
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ActivityLog = (await import('../models/ActivityLog')).default;
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrashBin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const TrashBin = (await import('../models/TrashBin')).default;
    const items = await TrashBin.find()
      .populate('deletedBy', 'name email role')
      .sort({ deletedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: { items }
    });
  } catch (error) {
    next(error);
  }
};

export const restoreFromTrash = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { adminId } = req.params;
    const TrashBin = (await import('../models/TrashBin')).default;
    
    // Find all items in trash belonging to this admin (including the admin itself)
    const items = await TrashBin.find({ adminId: adminId as string });

    if (items.length === 0) {
      throw new AppError('No items found in trash for this administrator', 404);
    }

    for (const item of items) {
      // Map collection names to correct Mongoose model names
      let modelName = '';
      if (item.collectionName === 'users') modelName = 'User';
      else if (item.collectionName === 'clinics') modelName = 'Clinic';
      else if (item.collectionName === 'doctors') modelName = 'Doctor';
      else continue;

      const Model = mongoose.model(modelName);
      
      // Use insertMany to bypass hooks (prevent re-hashing password)
      await Model.insertMany([item.data], { session });
      
      // Remove from trash
      await TrashBin.findByIdAndDelete(item._id).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    await logActivity(req, 'RESTORE_DATA', 'User', adminId as any, `Data restored for admin ${adminId}`);

    res.status(200).json({
      status: 'success',
      message: 'Data restored successfully from trash'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
