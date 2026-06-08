import { Request, Response, NextFunction } from 'express';
import * as clinicService from '../services/clinic.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { ClinicType } from '../models/Clinic';
import { geocodeAddress } from '../utils/geocoder';
import { AppError } from '../middlewares/error';
import User, { UserRole } from '../models/User';

import Clinic from '../models/Clinic';

export const getClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let creatorId: string | undefined;

    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN) {
      creatorId = currentUser.id;
    }

    const clinics = await clinicService.getAllClinics(req.query, creatorId);
    res.status(200).json({
      status: 'success',
      results: clinics.length,
      data: { clinics },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const clinics = await Clinic.find({ clinicStatus: status as any }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: clinics.length,
      data: { clinics }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinicStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason } = z.object({
      status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
      rejectionReason: z.string().optional()
    }).parse(req.body);

    const clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { 
        clinicStatus: status, 
        rejectionReason,
        verifiedBy: (req as any).user.id
      },
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return next(new AppError('No clinic found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { clinic }
    });
  } catch (error) {
    next(error);
  }
};

export const getClinic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clinic = await clinicService.getClinicById(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { clinic },
    });
  } catch (error) {
    next(error);
  }
};

const clinicSchema = z.object({
  clinicName: z.string().min(2, { message: "Clinic name must be at least 2 characters" }),
  legalName: z.string().optional(),
  clinicType: z.nativeEnum(ClinicType, { message: "Please select a valid clinic type" }),
  specialties: z.array(z.string()).min(1, { message: "At least one medical specialty must be selected" }),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  
  // Owner info
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().optional(),

  // Location
  address: z.string().min(1, { message: "Detailed address is required" }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  pincode: z.string().min(1, { message: "Pincode is required" }),
  country: z.string().default('India'),
  location: z.object({
    coordinates: z.array(z.number()).length(2), // [lng, lat]
  }).optional(),

  // Contact
  phone: z.string().min(1, { message: "Public phone number is required" }),
  alternatePhone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid public email address" }),

  // Timing
  openingTime: z.string().min(1, { message: "Opening time is required" }),
  closingTime: z.string().min(1, { message: "Closing time is required" }),
  workingDays: z.array(z.string()).default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
  emergencyAvailable: z.boolean().default(false),

  // Doctors
  doctors: z.array(z.string()).optional(),

  // Facilities & Services
  services: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),


  // Verification
  registrationNumber: z.string().min(1, { message: "Registration number is required" }),
  registrationProof: z.string().min(1, { message: "Registration proof document is required" }),
  addressProof: z.string().optional(),
  receptionAssistantMode: z.boolean().optional(),
});

export const createClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = clinicSchema.parse(req.body);
    if (!validatedData.legalName) {
      validatedData.legalName = validatedData.clinicName;
    }

    // Removed restriction: Admins can now register multiple clinics
    
    let coordinates = validatedData.location?.coordinates;

    if (!coordinates) {
      try {
        const geo = await geocodeAddress(
          validatedData.address,
          validatedData.city,
          validatedData.state
        );
        coordinates = [geo.lng, geo.lat];
      } catch (err) {
        console.error('Geocoding failed for clinic:', err);
        coordinates = [77.2090, 28.6139]; // Default Delhi coords
      }
    }

    const user = await User.findById(req.user!.id);
    const ownerName = user?.name || req.user!.name || 'Owner';
    const ownerPhone = user?.phone || validatedData.phone || '0000000000';
    const ownerEmail = user?.email || req.user!.email || validatedData.email;

    const clinic = await clinicService.createClinic({
      ...validatedData,
      ownerName,
      ownerPhone,
      ownerEmail,
      location: {
        type: 'Point',
        coordinates,
      },
      owner: req.user!.id as any,
      createdByAdminId: req.user!.id as any,
    } as any, req.user!.id);

    // Update the Admin user with the new clinic linkage
    if (req.user!.role === UserRole.ADMIN) {
      await User.findByIdAndUpdate(req.user!.id, {
        $addToSet: { branchIds: clinic._id },
        $set: { 
          branchId: clinic._id, 
          clinic: clinic._id 
        }
      });
    }

    res.status(201).json({
      status: 'success',
      data: { clinic },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({
      status: z.enum(['pending', 'approved', 'rejected'])
    }).parse(req.body);

    const clinic = await clinicService.updateClinicStatus(req.params.id as string, status);

    res.status(200).json({
      status: 'success',
      data: { clinic }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = clinicSchema.partial().parse(req.body);
    if (validatedData.clinicName && !validatedData.legalName) {
      validatedData.legalName = validatedData.clinicName;
    }
    const clinic = await clinicService.updateClinic(req.params.id as string, req.user!.id, validatedData as any);

    res.status(200).json({
      status: 'success',
      data: { clinic }
    });
  } catch (error) {
    next(error);
  }
};
export const deleteClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await clinicService.deleteClinic(req.params.id as string, req.user!.id, req.user!.role);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
