import { Request, Response, NextFunction } from 'express';
import * as clinicService from '../services/clinic.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { ClinicType } from '../models/Clinic';
import { geocodeAddress } from '../utils/geocoder';

export const getClinics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    let creatorId: string | undefined;

    if (currentUser && currentUser.role !== 'super_admin') {
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
  name: z.string().min(2),
  clinicType: z.nativeEnum(ClinicType),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  
  // Location
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  district: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().default('India'),
  location: z.object({
    coordinates: z.array(z.number()).length(2), // [lng, lat]
  }).optional(),

  // Contact
  phone: z.string(),
  alternatePhone: z.string().optional(),
  email: z.string().email(),

  // Timing
  openingTime: z.string(),
  closingTime: z.string(),
  workingDays: z.array(z.string()).default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
  emergencyAvailable: z.boolean().default(false),

  // Doctors
  doctors: z.array(z.string()).optional(),

  // Facilities & Services
  services: z.array(z.string()).optional(),
  facilities: z.array(z.string()).optional(),

  // Fees
  registrationFee: z.number().optional(),

  // Verification
  registrationNumber: z.string(),
  registrationCertificate: z.string().optional(),
});

export const createClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = clinicSchema.parse(req.body);
    
    let coordinates = validatedData.location?.coordinates;

    if (!coordinates) {
      try {
        const geo = await geocodeAddress(
          validatedData.addressLine1,
          validatedData.district,
          validatedData.state
        );
        coordinates = [geo.lng, geo.lat];
      } catch (err) {
        console.error('Geocoding failed for clinic:', err);
        coordinates = [77.2090, 28.6139]; // Default Delhi coords
      }
    }

    const clinic = await clinicService.createClinic({
      ...validatedData,
      location: {
        type: 'Point',
        coordinates,
      },
      owner: req.user!.id as any,
    } as any, req.user!.id);

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
      status: z.enum(['Pending', 'Approved', 'Rejected'])
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
    const clinic = await clinicService.updateClinic(req.params.id as string, req.user!.id, validatedData as any);

    res.status(200).json({
      status: 'success',
      data: { clinic }
    });
  } catch (error) {
    next(error);
  }
};
