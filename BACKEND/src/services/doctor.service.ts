import mongoose from 'mongoose';
import Doctor, { IDoctor } from '../models/Doctor';
import { AppError } from '../middlewares/error';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL = 3600000; // 1 hour cache TTL (stale limit)
const REFRESH_THRESHOLD = 30000; // 30 seconds fresh threshold

const invalidateCache = () => {
  queryCache.clear();
  console.log('[doctor.service] Query cache invalidated');
};

const SYMPTOM_TO_SPECIALTY: { [key: string]: string } = {
  'chest pain': 'Cardiologist',
  'breathlessness': 'Cardiologist',
  'heart': 'Cardiologist',
  'tooth': 'Dentist',
  'cavity': 'Dentist',
  'toothache': 'Dentist',
  'skin': 'Dermatologist',
  'rash': 'Dermatologist',
  'acne': 'Dermatologist',
  'brain': 'Neurologist',
  'headache': 'Neurologist',
  'migraine': 'Neurologist',
  'paralysis': 'Neurologist',
  'bone': 'Orthopedic',
  'fracture': 'Orthopedic',
  'joint pain': 'Orthopedic',
  'back pain': 'Orthopedic',
  'pregnancy': 'Gynecologist',
  'period': 'Gynecologist',
  'women health': 'Gynecologist',
  'child': 'Pediatrician',
  'kid': 'Pediatrician',
  'baby': 'Pediatrician',
  'fever': 'Pediatrician',
  'cough': 'Pediatrician',
};

const runDoctorsQuery = async (query: any, creatorId?: string, branchId?: string) => {
  const {
    specialty,
    name,
    lat,
    lng,
    radius = 5000,
    district,
    state,
    gender,
    maxFee,
    minExperience,
    minRating,
    videoConsultation,
    emergencyConsultation,
    availableToday,
    sort,
  } = query;
  const pipeline: any[] = [];

  // 1. GeoNear must be first if coordinates are provided
  if (lat && lng) {
    const geoNearStage: any = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        maxDistance: parseInt(radius),  // radius in metres (e.g. 5000 = 5 km)
        spherical: true,
        // Pre-filter to verified doctors only inside $geoNear for performance
        query: { status: 'verified' },
      },
    };
    pipeline.push(geoNearStage);
  }

  // 2. Pre-Match Stage: Filter by Doctor-specific fields before performing expensive lookups
  const preMatch: any = {};
  
  // Status Filtering
  if (query.status && query.status !== 'all') {
    preMatch.status = query.status;
  } else if (!creatorId && query.isDashboard !== true && query.isDashboard !== 'true') {
    // Public view only shows verified doctors
    preMatch.status = 'verified';
  }

  if (specialty && specialty !== 'All') {
    preMatch.specialty = { $regex: specialty, $options: 'i' };
  }
  if (district) {
    preMatch.district = { $regex: district, $options: 'i' };
  }
  if (state) {
    preMatch.state = { $regex: state, $options: 'i' };
  }

  // Doctor-level advanced filters
  if (maxFee) {
    preMatch.consultationFee = { $lte: Number(maxFee) };
  }
  if (minExperience) {
    preMatch.experience = { $gte: Number(minExperience) };
  }
  if (minRating) {
    preMatch.rating = { $gte: Number(minRating) };
  }
  if (videoConsultation === 'true' || videoConsultation === true) {
    preMatch.videoConsultation = true;
  }
  if (emergencyConsultation === 'true' || emergencyConsultation === true) {
    preMatch.emergencyConsultation = true;
  }
  if (availableToday === 'true' || availableToday === true) {
    // Availability days are stored as abbreviated names: Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayDayName = daysOfWeek[new Date().getDay()];
    preMatch['availability.day'] = todayDayName;
  }

  if (Object.keys(preMatch).length > 0) {
    pipeline.push({ $match: preMatch });
  }

  // 3. Lookup user to allow matching by name and gender
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    },
  });
  pipeline.push({ $unwind: '$user' });

  // 3.1 Lookup clinic by branchId and clinic using simple indexed lookups
  pipeline.push({
    $lookup: {
      from: 'clinics',
      localField: 'branchId',
      foreignField: '_id',
      as: 'branch_info',
    },
  });
  pipeline.push({
    $lookup: {
      from: 'clinics',
      localField: 'clinic',
      foreignField: '_id',
      as: 'clinic_info',
    },
  });

  // 4. Post-Match Stage: Filter by joined fields (user, clinic, etc.)
  const postMatch: any = {};
  
  if (gender && gender !== 'all') {
    postMatch['user.gender'] = gender;
  }

  if (name) {
    const lowercaseName = name.toLowerCase().trim();
    let mappedSpecialty = '';
    for (const [symptom, spec] of Object.entries(SYMPTOM_TO_SPECIALTY)) {
      if (lowercaseName.includes(symptom)) {
        mappedSpecialty = spec;
        break;
      }
    }

    const orConditions: any[] = [
      { 'user.name': { $regex: name, $options: 'i' } },
      { specialty: { $regex: name, $options: 'i' } },
      { 'clinic_info.name': { $regex: name, $options: 'i' } },
      { 'branch_info.name': { $regex: name, $options: 'i' } }
    ];

    if (mappedSpecialty) {
      orConditions.push({ specialty: { $regex: mappedSpecialty, $options: 'i' } });
    }

    postMatch.$or = orConditions;
  }

  if (Object.keys(postMatch).length > 0) {
    pipeline.push({ $match: postMatch });
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
    const branchStr = branchId.toString();
    let branchObj;
    try {
      branchObj = new mongoose.Types.ObjectId(branchStr);
    } catch (e) {
      branchObj = null;
    }

    const branchMatch: any = {
      $or: [
        { branchId: branchStr },
        { clinic: branchStr },
        { clinics: branchStr }
      ]
    };

    if (branchObj) {
      branchMatch.$or.push(
        { branchId: branchObj },
        { clinic: branchObj },
        { clinics: branchObj }
      );
    }

    pipeline.push({ $match: branchMatch });
  }

  // 3.5 Sorting Stage
  if (sort) {
    const sortStage: any = {};
    if (sort === 'rating') {
      sortStage.rating = -1;
    } else if (sort === 'experience') {
      sortStage.experience = -1;
    } else if (sort === 'fee_asc') {
      sortStage.consultationFee = 1;
    } else if (sort === 'fee_desc') {
      sortStage.consultationFee = -1;
    } else if (sort === 'earliest') {
      // Default fallback for earliest, or sort by rating
      sortStage.rating = -1;
    }
    
    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }
  }

  // 5. Project to match expected output format
  pipeline.push({
    $project: {
      'user.password': 0,
      'user.refreshToken': 0,
    }
  });

  console.time('[getAllDoctors] DB Query Time');
  let doctors = await Doctor.aggregate(pipeline);
  console.timeEnd('[getAllDoctors] DB Query Time');

  // FALLBACK LOGIC: If no doctors found in the specific district, search for others in the same state
  if (doctors.length === 0 && (district || (lat && lng))) {
    const fallbackPipeline: any[] = [];
    
    // If we had lat/lng, search with a much larger radius (500 km) as fallback
    if (lat && lng) {
      fallbackPipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: 500000,  // 500 km fallback radius
          spherical: true,
          query: { status: 'verified' },
        }
      });
    }

    fallbackPipeline.push({
      $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' }
    });
    fallbackPipeline.push({ $unwind: '$user' });

    const fallbackMatch: any = { status: 'verified' };
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

    console.time('[getAllDoctors] Fallback Query Time');
    doctors = await Doctor.aggregate(fallbackPipeline);
    console.timeEnd('[getAllDoctors] Fallback Query Time');

    // MULTI-STAGE FALLBACK: If still 0 doctors found (e.g. no doctors in the selected state),
    // show any verified doctors globally (without state constraint)
    if (doctors.length === 0) {
      const globalFallbackPipeline: any[] = [];
      if (lat && lng) {
        globalFallbackPipeline.push({
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            distanceField: 'distance',
            spherical: true,
          }
        });
      }
      
      globalFallbackPipeline.push({
        $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' }
      });
      globalFallbackPipeline.push({ $unwind: '$user' });

      const globalMatch: any = { status: 'verified' };
      if (specialty) globalMatch.specialty = { $regex: specialty, $options: 'i' };
      if (name) {
        globalMatch.$or = [
          { 'user.name': { $regex: name, $options: 'i' } },
          { specialty: { $regex: name, $options: 'i' } }
        ];
      }

      globalFallbackPipeline.push({ $match: globalMatch });
      globalFallbackPipeline.push({ $limit: 10 });
      globalFallbackPipeline.push({ $addFields: { isFallback: true } });
      globalFallbackPipeline.push({ $project: { 'user.password': 0, 'user.refreshToken': 0 } });

      console.time('[getAllDoctors] Global Fallback Query Time');
      doctors = await Doctor.aggregate(globalFallbackPipeline);
      console.timeEnd('[getAllDoctors] Global Fallback Query Time');
    }
  }

  return doctors;
};

export const getAllDoctors = async (query: any, creatorId?: string, branchId?: string) => {
  const cacheKey = JSON.stringify({ query, creatorId, branchId });
  const now = Date.now();
  const cached = queryCache.get(cacheKey);
  
  if (cached) {
    // If the cache is fresh (less than 30 seconds old), return it immediately
    if (now - cached.timestamp < REFRESH_THRESHOLD) {
      console.log('[getAllDoctors] Returning fresh cached results for key:', cacheKey);
      return cached.data;
    }
    
    // If it's stale (between 30 seconds and 1 hour), return the stale data immediately,
    // and fetch from the database in the background to refresh the cache.
    if (now - cached.timestamp < CACHE_TTL) {
      console.log('[getAllDoctors] Returning stale cached results and triggering background refresh for key:', cacheKey);
      runDoctorsQuery(query, creatorId, branchId).then((freshDoctors) => {
        queryCache.set(cacheKey, { data: freshDoctors, timestamp: Date.now() });
      }).catch((err) => {
        console.error('[getAllDoctors] Background refresh failed:', err);
      });
      return cached.data;
    }
  }

  console.log('[getAllDoctors] Cache miss, running query synchronously for key:', cacheKey);
  const doctors = await runDoctorsQuery(query, creatorId, branchId);
  queryCache.set(cacheKey, { data: doctors, timestamp: Date.now() });
  return doctors;
};

export const getDoctorById = async (idOrSlug: string) => {
  const isId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
  const doctor = await Doctor.findOne(query)
    .populate('user', 'name email avatar phone')
    .populate('clinic')
    .populate('branchId');
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
  if (!doctor.clinic && doctor.branchId) {
    doctor.clinic = doctor.branchId as any;
  }
  return doctor;
};

export const createDoctorProfile = async (data: Partial<IDoctor>) => {
  invalidateCache();
  return await Doctor.create(data);
};

export const updateDoctorProfile = async (id: string, userId: string, data: Partial<IDoctor>) => {
  invalidateCache();
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
  invalidateCache();
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
  invalidateCache();
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

  if (branchId) {
    const Clinic = mongoose.model('Clinic');
    await Clinic.findByIdAndUpdate(branchId, {
      $addToSet: { doctors: doctor._id }
    });
  }

  return { user, doctor };
};
export const getDoctorByUserId = async (userId: string) => {
  const doctor = await Doctor.findOne({ user: userId })
    .populate('user', 'name email avatar')
    .populate('clinic')
    .populate('branchId');
  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }
  if (!doctor.clinic && doctor.branchId) {
    doctor.clinic = doctor.branchId as any;
  }
  return doctor;
};

export const updateDoctorStatus = async (id: string, status: 'submitted' | 'verified' | 'rejected', verifiedBy: string, rejectionReason?: string) => {
  invalidateCache();
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { 
      status, 
      isVerified: status === 'verified',
      verifiedBy,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
  return doctor;
};