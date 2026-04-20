import mongoose from 'mongoose';
import Doctor, { IDoctor } from '../models/Doctor';
import { AppError } from '../middlewares/error';

export const getAllDoctors = async (query: any) => {
  const { specialty, name, lat, lng, radius = 5000, city, country } = query;
  const pipeline: any[] = [];

  // 1. GeoNear must be first if coordinates are provided
  if (lat && lng) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        maxDistance: parseInt(radius),
        spherical: true,
      },
    });
  }

  // 2. Lookup user early to allow matching by name
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    },
  });
  pipeline.push({ $unwind: '$user' });

  // 3. Build Match Stage
  const match: any = {};
  if (specialty) {
    match.specialty = { $regex: specialty, $options: 'i' };
  }
  if (city) {
    match.city = { $regex: city, $options: 'i' };
  }
  if (country) {
    match.country = { $regex: country, $options: 'i' };
  }
  if (name) {
    // Search by doctor name OR specialty (now smarter for global search)
    match.$or = [
      { 'user.name': { $regex: name, $options: 'i' } },
      { specialty: { $regex: name, $options: 'i' } }
    ];
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // 4. Project to match expected output format
  pipeline.push({
    $project: {
      'user.password': 0,
      'user.refreshToken': 0,
    }
  });

  return await Doctor.aggregate(pipeline);
};

export const getDoctorById = async (id: string) => {
  const doctor = await Doctor.findById(id).populate('user', 'name email avatar').populate('clinic');
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
  return doctor;
};

export const createDoctorProfile = async (data: Partial<IDoctor>) => {
  return await Doctor.create(data);
};

export const updateDoctorProfile = async (id: string, userId: string, data: Partial<IDoctor>) => {
  const doctor = await Doctor.findOneAndUpdate({ _id: id, user: userId }, data, {
    new: true,
    runValidators: true,
  });
  
  if (!doctor) {
    throw new AppError('Doctor not found or you are not authorized', 404);
  }
  return doctor;
};
export const deleteDoctorProfile = async (id: string) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  // Delete associated user
  await mongoose.model('User').findByIdAndDelete(doctor.user);
  
  // Delete doctor profile
  return await Doctor.findByIdAndDelete(id);
};

export const createDoctorWithUser = async (userData: any, profileData: any) => {
  const User = mongoose.model('User');
  
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create({
    ...userData,
    role: 'doctor',
  });

  const doctor = await Doctor.create({
    ...profileData,
    user: user._id,
  });

  return { user, doctor };
};
