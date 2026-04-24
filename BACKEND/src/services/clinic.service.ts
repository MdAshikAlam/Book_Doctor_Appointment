import Clinic, { IClinic } from '../models/Clinic';
import { AppError } from '../middlewares/error';

export const getAllClinics = async (query: any, creatorId?: string) => {
  const { lat, lng, radius = 5000 } = query;
  const filter: any = {};

  if (lat && lng) {
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
  if (creatorId) {
    const mongoose = require('mongoose');
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    filter.$or = [
      { owner: creatorObjectId },
      { createdBy: creatorObjectId },
      { parentAdmin: creatorObjectId },
      { parentSubAdmin: creatorObjectId }
    ];
  }

  return await Clinic.find(filter).populate('owner', 'name email');
};

export const getClinicById = async (id: string) => {
  const clinic = await Clinic.findById(id).populate('owner', 'name email');
  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }
  return clinic;
};

export const createClinic = async (data: Partial<IClinic>, creatorId?: string) => {
  let parentAdmin: any = undefined;
  let parentSubAdmin: any = undefined;

  if (creatorId) {
    const User = (await import('../models/User')).default;
    const creator = await User.findById(creatorId);
    if (creator) {
      if (creator.role === 'admin') {
        parentAdmin = creator._id;
      } else if (creator.role === 'sub_admin') {
        parentAdmin = creator.parentAdmin;
        parentSubAdmin = creator._id;
      } else if (creator.role === 'doctor') {
        parentAdmin = creator.parentAdmin;
        parentSubAdmin = creator.parentSubAdmin;
      }
    }
  }

  return await Clinic.create({ 
    ...data, 
    createdBy: creatorId,
    parentAdmin,
    parentSubAdmin 
  } as any);
};

export const updateClinic = async (id: string, ownerId: string, data: Partial<IClinic>) => {
  const clinic = await Clinic.findOneAndUpdate({ _id: id, owner: ownerId }, data, {
    new: true,
    runValidators: true,
  });

  if (!clinic) {
    throw new AppError('Clinic not found or you are not authorized', 404);
  }
  return clinic;
};
