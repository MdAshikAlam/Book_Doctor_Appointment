import Clinic, { IClinic } from '../models/Clinic';
import { AppError } from '../middlewares/error';

export const getAllClinics = async (query: any, creatorId?: string) => {
  const { lat, lng, radius = 5000, name } = query;
  const filter: any = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

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

export const getClinicById = async (idOrSlug: string) => {
  const mongoose = require('mongoose');
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);
  
  const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
  const clinic = await Clinic.findOne(query)
    .populate('owner', 'name email')
    .populate({
      path: 'doctors',
      populate: { path: 'user', select: 'name avatar specialty' }
    });

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

  const clinic = await Clinic.create({ 
    ...data, 
    createdBy: creatorId,
    parentAdmin,
    parentSubAdmin 
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
    { verificationStatus: status },
    { new: true, runValidators: true }
  );

  if (!clinic) {
    throw new AppError('Clinic not found', 404);
  }

  return clinic;
};
