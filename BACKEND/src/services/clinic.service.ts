import Clinic, { IClinic } from '../models/Clinic';
import { AppError } from '../middlewares/error';

export const getAllClinics = async (query: any, creatorId?: string) => {
  const { lat, lng, radius = 5000, clinicName } = query;
  const filter: any = {};

  // Status Filtering
  if (query.status && query.status !== 'all') {
    filter.clinicStatus = { $regex: `^${query.status}$`, $options: 'i' };
  } else if (!creatorId && !query.isDashboard) {
    // If no status provided, not a creator, AND not a dashboard request, default to approved for public visibility
    filter.clinicStatus = 'approved';
  }

  if (clinicName) {
    filter.clinicName = { $regex: clinicName, $options: 'i' };
  }

  if (lat && lng && !query.isDashboard) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius),
      },
    };
  }
  const User = (await import('../models/User')).default;
  const mongoose = require('mongoose');

  if (creatorId) {
    const user = await User.findById(creatorId);
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    
    // Combine all possible associations
    const userBranchIds = [
      ...(user?.branchIds || []),
      ...(user?.branchId ? [user.branchId] : []),
      ...(user?.clinic ? [user.clinic] : []),
      ...( (user as any)?.clinics || [])
    ].map(id => id.toString());

    filter.$or = [
      { owner: creatorObjectId },
      { createdBy: creatorObjectId },
      { createdByAdminId: creatorObjectId },
      { parentAdmin: creatorObjectId },
      { parentReceptionist: creatorObjectId },
      { _id: { $in: userBranchIds.map(id => new mongoose.Types.ObjectId(id)) } }
    ];
    
    console.log('Admin Clinic Filter:', JSON.stringify(filter, null, 2));
  }


  // Use Aggregation to get counts
  const clinics = await Clinic.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        let: { clinicId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$branchId', '$$clinicId'] },
                  { $in: ['$$clinicId', { $ifNull: ['$branchIds', []] }] }
                ]
              }
            }
          }
        ],
        as: 'staff'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerInfo'
      }
    },
    {
      $addFields: {
        adminCount: {
          $size: {
            $filter: {
              input: '$staff',
              as: 's',
              cond: { $eq: ['$$s.role', 'admin'] }
            }
          }
        },
        doctorCount: {
          $size: {
            $filter: {
              input: '$staff',
              as: 's',
              cond: { $eq: ['$$s.role', 'doctor'] }
            }
          }
        },
        receptionistCount: {
          $size: {
            $filter: {
              input: '$staff',
              as: 's',
              cond: { $eq: ['$$s.role', 'receptionist'] }
            }
          }
        },
        owner: { $arrayElemAt: ['$ownerInfo', 0] }
      }
    },
    {
      $project: {
        staff: 0,
        ownerInfo: 0,
        'owner.password': 0,
        'owner.refreshToken': 0
      }
    }
  ]);

  return clinics;
};


export const getClinicById = async (idOrSlug: string) => {
  const mongoose = require('mongoose');
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);

  const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
  const clinic = await Clinic.findOne(query).populate('owner', 'name email');

  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }

  // Fetch all doctors that are linked to this clinic
  const Doctor = (await import('../models/Doctor')).default;
  const doctors = await Doctor.find({
    $or: [
      { _id: { $in: clinic.doctors || [] } },
      { clinic: clinic._id },
      { clinics: clinic._id },
      { branchId: clinic._id }
    ],
    status: { $in: ['verified', 'submitted'] }
  }).populate('user', 'name avatar');

  // Convert to object and add doctors
  const clinicObj = clinic.toObject() as any;
  clinicObj.name = clinicObj.clinicName; // Compatibility for frontend
  clinicObj.doctors = doctors;

  return clinicObj;
};

export const createClinic = async (data: Partial<IClinic>, creatorId?: string) => {
  let parentAdmin: any = undefined;
  let parentReceptionist: any = undefined;

  if (creatorId) {
    const User = (await import('../models/User')).default;
    const creator = await User.findById(creatorId);
    if (creator) {
      if (creator.role === 'admin') {
        parentAdmin = creator._id;
      } else if (creator.role === 'receptionist') {
        parentAdmin = creator.parentAdmin;
        parentReceptionist = creator._id;
      } else if (creator.role === 'doctor') {
        parentAdmin = creator.parentAdmin;
        parentReceptionist = creator.parentReceptionist;
      }
    }
  }

  const clinic = await Clinic.create({
    ...data,
    createdBy: creatorId,
    parentAdmin,
    parentReceptionist
  } as any);

  if (data.doctors && data.doctors.length > 0) {
    const Doctor = (await import('../models/Doctor')).default;
    await Doctor.updateMany(
      { _id: { $in: data.doctors } },
      { $set: { clinic: clinic._id }, $addToSet: { clinics: clinic._id } }
    );
  }

  return clinic;
};

export const updateClinic = async (id: string, ownerId: string, data: Partial<IClinic>) => {
  const clinic = await Clinic.findOneAndUpdate({ _id: id, owner: ownerId }, data, {
    new: true,
    runValidators: true,
  });

  if (!clinic) {
    throw new AppError('Clinic not found or you are not authorized', 404);
  }

  if (data.doctors !== undefined) {
    const Doctor = (await import('../models/Doctor')).default;
    await Doctor.updateMany(
      { clinic: clinic._id, _id: { $nin: data.doctors } },
      { $unset: { clinic: 1 } }
    );
    await Doctor.updateMany(
      { clinics: clinic._id, _id: { $nin: data.doctors } },
      { $pull: { clinics: clinic._id } }
    );

    if (data.doctors.length > 0) {
      await Doctor.updateMany(
        { _id: { $in: data.doctors } },
        { $set: { clinic: clinic._id }, $addToSet: { clinics: clinic._id } }
      );
    }
  }

  return clinic;
};

export const updateClinicStatus = async (id: string, status: string) => {
  const clinic = await Clinic.findByIdAndUpdate(
    id,
    { clinicStatus: status },
    { new: true, runValidators: true }
  );

  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }

  return clinic;
};

export const deleteClinic = async (id: string, requesterId: string, role: string) => {
  const clinic = await Clinic.findById(id);
  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }

  // Permission Check
  if (role !== 'super_admin' && clinic.owner.toString() !== requesterId) {
    throw new AppError('You are not authorized to delete this clinic', 403);
  }

  // Remove clinic reference from doctors
  const Doctor = (await import('../models/Doctor')).default;
  await Doctor.updateMany(
    { $or: [{ clinic: id }, { clinics: id }, { branchId: id }] },
    { $unset: { clinic: 1, branchId: 1 }, $pull: { clinics: id } }
  );

  // Remove clinic reference from users
  const User = (await import('../models/User')).default;
  await User.updateMany(
    { $or: [{ branchId: id }, { branchIds: id }] },
    { $unset: { branchId: 1 }, $pull: { branchIds: id } }
  );

  await Clinic.findByIdAndDelete(id);
  return true;
};

