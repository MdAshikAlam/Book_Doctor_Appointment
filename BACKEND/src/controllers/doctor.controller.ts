import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as doctorService from '../services/doctor.service';
import { AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/error';
import { z } from 'zod';
import { UserRole } from '../models/User';
import { geocodeAddress } from '../utils/geocoder';

export const getDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let creatorId: string | undefined;

    // Filter by creator if not Super Admin and in dashboard context
    // Assuming we use this for the dashboard list
    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN) {
      creatorId = currentUser.id;
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
  experience: z.number(),
  qualifications: z.array(z.string()),
  bio: z.string().optional(),
  consultationFee: z.number(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
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
        validatedData.profileData.city,
        validatedData.profileData.country
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
      if (!p.location && (p.address || p.city || p.country)) {
          const { lat, lng } = await geocodeAddress(
            p.address || d.address,
            p.city || d.city,
            p.country || d.country
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
