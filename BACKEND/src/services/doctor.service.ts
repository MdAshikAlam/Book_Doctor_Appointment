import mongoose from 'mongoose';
import Doctor, { IDoctor } from '../models/Doctor';
import { AppError } from '../middlewares/error';

export const getAllDoctors = async (query: any, creatorId?: string, branchId?: string) => {
  const { specialty, name, lat, lng, radius = 5000, district, state } = query;
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

  // 2.1 Lookup clinic to allow matching by clinic name
  pipeline.push({
    $lookup: {
      from: 'clinics',
      localField: 'clinic',
      foreignField: '_id',
      as: 'clinic_info',
    },
  });
  // Note: We don't unwind clinic_info yet to avoid losing doctors without a primary clinic
  // But we can match against the array

  // 3. Build Match Stage
  const match: any = {};
  if (specialty) {
    match.specialty = { $regex: specialty, $options: 'i' };
  }
  if (district) {
    match.district = { $regex: district, $options: 'i' };
  }
  if (state) {
    match.state = { $regex: state, $options: 'i' };
  }
  if (name) {
    // Search by doctor name OR specialty OR clinic name
    match.$or = [
      { 'user.name': { $regex: name, $options: 'i' } },
      { specialty: { $regex: name, $options: 'i' } },
      { 'clinic_info.name': { $regex: name, $options: 'i' } }
    ];
  }
  if (creatorId) {
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    pipeline.push({
      $match: {
        $or: [
          { 'user._id': creatorObjectId },
          { 'parentAdmin': creatorObjectId },
          { 'parentReceptionist': creatorObjectId },
          { 'createdBy': creatorObjectId }
        ]
      }
    });
  }

  if (branchId) {
    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    match.branchId = branchObjectId;
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

  let doctors = await Doctor.aggregate(pipeline);

  // FALLBACK LOGIC: If no doctors found in the specific district, search for others in the same state
  if (doctors.length === 0 && (district || (lat && lng))) {
    const fallbackPipeline: any[] = [];
    
    // If we had lat/lng, maybe search with a much larger radius or just general state
    if (lat && lng) {
      fallbackPipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          spherical: true,
          // No maxDistance here to find "nearest" anywhere
        }
      });
    }

    fallbackPipeline.push({
      $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' }
    });
    fallbackPipeline.push({ $unwind: '$user' });

    const fallbackMatch: any = {};
    if (specialty) fallbackMatch.specialty = { $regex: specialty, $options: 'i' };
    if (name) {
      fallbackMatch.$or = [
        { 'user.name': { $regex: name, $options: 'i' } },
        { specialty: { $regex: name, $options: 'i' } }
      ];
    }
    
    // If district was specified, we specifically want doctors NOT in that district but in the same state
    if (district && state) {
      fallbackMatch.state = state;
      fallbackMatch.district = { $ne: district };
    }

    if (Object.keys(fallbackMatch).length > 0) {
      fallbackPipeline.push({ $match: fallbackMatch });
    }

    fallbackPipeline.push({ $limit: 10 }); // Limit fallback results
    fallbackPipeline.push({
      $addFields: { isFallback: true }
    });
    
    fallbackPipeline.push({
      $project: { 'user.password': 0, 'user.refreshToken': 0 }
    });

    doctors = await Doctor.aggregate(fallbackPipeline);
  }

  return doctors;
};

export const getDoctorById = async (idOrSlug: string) => {
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
  const doctor = await Doctor.findOne(query).populate('user', 'name email avatar phone').populate('clinic');
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

export const createDoctorWithUser = async (userData: any, profileData: any, creatorId?: string, branchId?: string) => {
  const User = mongoose.model('User');
  
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Determine Parents for hierarchy
  let parentAdmin: any = undefined;
  let parentReceptionist: any = undefined;

  if (creatorId) {
    const creator = await User.findById(creatorId);
    if (creator) {
      if (creator.role === 'admin') {
        parentAdmin = creator._id;
      } else if (creator.role === 'receptionist') {
        parentAdmin = creator.parentAdmin;
        parentReceptionist = creator._id;
      }
    }
  }

  const user = await User.create({
    ...userData,
    role: 'doctor',
    createdBy: creatorId,
    parentAdmin,
    parentReceptionist,
    branchId: branchId || undefined
  } as any);

  let slugBase = userData.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  let slug = `dr-${slugBase}`;
  let counter = 1;
  while (await Doctor.findOne({ slug })) {
    slug = `dr-${slugBase}-${counter}`;
    counter++;
  }

  const doctor = await Doctor.create({
    ...profileData,
    user: user._id,
    slug,
    createdBy: creatorId,
    parentAdmin,
    parentReceptionist,
    branchId: branchId || undefined
  } as any);

  return { user, doctor };
};
export const getDoctorByUserId = async (userId: string) => {
  const doctor = await Doctor.findOne({ user: userId }).populate('user', 'name email avatar').populate('clinic');
  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }
  return doctor;
};
