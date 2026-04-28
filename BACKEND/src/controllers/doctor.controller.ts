import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as doctorService from '../services/doctor.service';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/error';
import { z } from 'zod';
import { UserRole } from '../models/User';
import { geocodeAddress } from '../utils/geocoder';
import Doctor from '../models/Doctor';

export const getDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let creatorId: string | undefined;

    // Filter by creator if not Super Admin and in dashboard context
    // Assuming we use this for the dashboard list
    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.role === UserRole.SUB_ADMIN) {
        // Sub-Admins see all doctors of their parent Admin
        const User = mongoose.model('User');
        const userDoc = await User.findById(currentUser.id);
        creatorId = userDoc?.parentAdmin?.toString() || currentUser.id;
      } else {
        creatorId = currentUser.id;
      }
    }

    const doctors = await doctorService.getAllDoctors(req.query, creatorId);
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: { doctors },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { doctor },
    });
  } catch (error) {
    next(error);
  }
};

const doctorProfileSchema = z.object({
  specialty: z.string(),
  subSpecialization: z.string().optional(),
  experience: z.number(),
  qualifications: z.array(z.string()),
  licenseNumber: z.string(),
  medicalCouncil: z.string(),
  bio: z.string().optional(),
  consultationFee: z.number(),
  address: z.string(),
  district: z.string(),
  state: z.string(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2),
  }).optional(),
});

export const createMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = doctorProfileSchema.parse(req.body);
    const doctor = await doctorService.createDoctorProfile({
      ...validatedData,
      user: req.user!.id as any,
    } as any);

    res.status(201).json({
      status: 'success',
      data: { doctor },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await doctorService.deleteDoctorProfile(req.params.id as string);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const adminDoctorCreateSchema = z.object({
  userData: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().optional(), // Date string from frontend
    avatar: z.string().optional(),
  }),
  profileData: doctorProfileSchema,
});

export const adminCreateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = adminDoctorCreateSchema.parse(req.body);
    
    // Auto-geocode address if location is not provided
    if (!validatedData.profileData.location) {
      const { lat, lng } = await geocodeAddress(
        validatedData.profileData.address,
        validatedData.profileData.district,
        validatedData.profileData.state
      );
      validatedData.profileData.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }

    const result = await doctorService.createDoctorWithUser(
      validatedData.userData,
      validatedData.profileData,
      (req as any).user.id
    );

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const adminDoctorUpdateSchema = z.object({
  userData: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().optional(),
    avatar: z.string().optional(),
  }).optional(),
  profileData: doctorProfileSchema.partial().optional(),
});

export const adminUpdateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validatedData = adminDoctorUpdateSchema.parse(req.body);

    const doctor = await doctorService.getDoctorById(id);
    const userId = (doctor.user as any)._id;

    // 1. Update User Data if provided
    if (validatedData.userData) {
      const User = mongoose.model('User');
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      Object.assign(user, validatedData.userData);
      await user.save();
    }

    // 2. Update Profile Data if provided
    if (validatedData.profileData) {
      // Re-geocode if address components changed and location not provided
      const p = validatedData.profileData;
      const d = doctor as any;
      if (!p.location && (p.address || p.district || p.state)) {
          const { lat, lng } = await geocodeAddress(
            p.address || d.address,
            p.district || d.district,
            p.state || d.state
          );
          p.location = {
            type: 'Point',
            coordinates: [lng, lat]
          };
      }
      Object.assign(doctor, validatedData.profileData);
      await doctor.save();
    }

    const updatedDoctor = await doctorService.getDoctorById(id);

    res.status(200).json({
      status: 'success',
      data: { doctor: updatedDoctor },
    });
  } catch (error) {
    next(error);
  }
};
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctor = await doctorService.getDoctorByUserId(req.user!.id as string);
    res.status(200).json({
      status: 'success',
      data: { doctor },
    });
  } catch (error) {
    next(error);
  }
};

const generateAvailabilitySchema = z.object({
  days: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional()
});

export const generateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validatedData = generateAvailabilitySchema.parse(req.body);
    const doctor = await doctorService.getDoctorById(id);
    
    const { days, startTime, endTime, duration, breakStart, breakEnd } = validatedData;
    
    const generateSlots = (start: string, end: string, dur: number, bStart?: string, bEnd?: string) => {
      const slots: string[] = [];
      const parseTime = (time: string) => {
        const parts = time.split(':');
        const h = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10);
        return h * 60 + m;
      };
      
      let current = parseTime(start);
      const endMins = parseTime(end);
      const breakS = bStart ? parseTime(bStart) : -1;
      const breakE = bEnd ? parseTime(bEnd) : -1;

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60).toString().padStart(2, '0');
        const m = (mins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      while (current + dur <= endMins) {
        const slotEnd = current + dur;
        const isBreak = breakS !== -1 && breakE !== -1 && ((current >= breakS && current < breakE) || (slotEnd > breakS && slotEnd <= breakE) || (current <= breakS && slotEnd >= breakE));
        
        if (!isBreak) {
          slots.push(`${formatTime(current)} - ${formatTime(slotEnd)}`);
        }
        current = slotEnd;
      }
      return slots;
    };

    const slots = generateSlots(startTime, endTime, duration, breakStart, breakEnd);
    
    const newAvailability = [...(doctor.availability || [])];
    
    for (const day of days) {
      const existingIdx = newAvailability.findIndex(a => a.day === day);
      if (existingIdx !== -1 && newAvailability[existingIdx]) {
        newAvailability[existingIdx]!.slots = slots;
      } else {
        newAvailability.push({ day, slots });
      }
    }
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { availability: newAvailability },
      { new: true }
    );
    
    if (!updatedDoctor) {
      return next(new AppError('Doctor not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { availability: updatedDoctor.availability }
    });
  } catch (error) {
    next(error);
  }
};

export const addLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return next(new AppError('Please provide leave start and end dates', 400));
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          leaves: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason
          }
        }
      },
      { new: true }
    );

    if (!updatedDoctor) {
      return next(new AppError('Doctor not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { leaves: updatedDoctor.leaves }
    });
  } catch (error) {
    next(error);
  }
};
