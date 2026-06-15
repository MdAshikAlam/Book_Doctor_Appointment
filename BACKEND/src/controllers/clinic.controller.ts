import { Request, Response, NextFunction } from 'express';
import * as clinicService from '../services/clinic.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import { ClinicType } from '../models/Clinic';
import { geocodeAddress } from '../utils/geocoder';
import { AppError } from '../middlewares/error';
import User, { UserRole } from '../models/User';

import Clinic from '../models/Clinic';
import Doctor from '../models/Doctor';

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
          validatedData.state,
          validatedData.pincode
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

    // Auto-geocode address if location is not provided but address fields are changed
    if (!validatedData.location && (validatedData.address || validatedData.city || validatedData.state || validatedData.pincode)) {
      try {
        const existingClinic = await Clinic.findById(req.params.id);
        if (existingClinic) {
          const geo = await geocodeAddress(
            validatedData.address || existingClinic.address,
            validatedData.city || existingClinic.city,
            validatedData.state || existingClinic.state,
            validatedData.pincode || existingClinic.pincode
          );
          validatedData.location = {
            coordinates: [geo.lng, geo.lat]
          };
        }
      } catch (err) {
        console.error('Geocoding failed during clinic update:', err);
      }
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

export const getClinicHierarchyTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admins = await User.find({ role: UserRole.ADMIN, status: { $ne: 'deleted' } }).select('name email phone status createdAt');
    const clinics = await Clinic.find({ isDeleted: false }).select('clinicName owner clinicStatus address city state phone email doctors');
    
    // Find all doctors and populate their user details
    const doctors = await Doctor.find().populate('user', 'name email phone status avatar');
    
    // Find all receptionists
    const receptionists = await User.find({ role: UserRole.RECEPTIONIST, status: { $ne: 'deleted' } }).select('name email phone status branchId parentAdmin');

    // Build the tree
    const tree = admins.map(admin => {
      // Find clinics belonging to this admin
      const adminClinics = clinics.filter(clinic => clinic.owner && clinic.owner.toString() === admin._id.toString());
      
      const clinicsWithStaff = adminClinics.map(clinic => {
        // Find doctors associated with this clinic
        const clinicDoctors = doctors.filter(doc => 
          (doc.branchId && doc.branchId.toString() === clinic._id.toString()) || 
          (doc.clinic && doc.clinic.toString() === clinic._id.toString()) ||
          (clinic.doctors && clinic.doctors.some((dId: any) => dId.toString() === doc._id.toString()))
        );

        // Find receptionists associated with this clinic
        const clinicReceptionists = receptionists.filter(recep => 
          recep.branchId && recep.branchId.toString() === clinic._id.toString()
        );

        return {
          _id: clinic._id,
          clinicName: clinic.clinicName,
          clinicStatus: clinic.clinicStatus,
          address: clinic.address,
          city: clinic.city,
          state: clinic.state,
          phone: clinic.phone,
          email: clinic.email,
          doctors: clinicDoctors.map(doc => ({
            _id: doc._id,
            name: (doc.user as any)?.name || 'Unknown Doctor',
            email: (doc.user as any)?.email || '',
            phone: (doc.user as any)?.phone || '',
            specialty: doc.specialty,
            status: doc.status,
            avatar: (doc.user as any)?.avatar || null
          })),
          receptionists: clinicReceptionists.map(recep => ({
            _id: recep._id,
            name: recep.name,
            email: recep.email,
            phone: recep.phone || '',
            status: recep.status
          }))
        };
      });

      return {
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone || '',
          status: admin.status,
          createdAt: (admin as any).createdAt
        },
        clinics: clinicsWithStaff
      };
    });

    // Handle Unassigned Clinics
    const unassignedClinics = clinics.filter(clinic => 
      !clinic.owner || !admins.some(admin => admin._id.toString() === clinic.owner.toString())
    );

    const unassignedClinicsWithStaff = unassignedClinics.map(clinic => {
      const clinicDoctors = doctors.filter(doc => 
        (doc.branchId && doc.branchId.toString() === clinic._id.toString()) || 
        (doc.clinic && doc.clinic.toString() === clinic._id.toString())
      );
      const clinicReceptionists = receptionists.filter(recep => 
        recep.branchId && recep.branchId.toString() === clinic._id.toString()
      );

      return {
        _id: clinic._id,
        clinicName: clinic.clinicName,
        clinicStatus: clinic.clinicStatus,
        address: clinic.address,
        city: clinic.city,
        state: clinic.state,
        phone: clinic.phone,
        email: clinic.email,
        doctors: clinicDoctors.map(doc => ({
          _id: doc._id,
          name: (doc.user as any)?.name || 'Unknown Doctor',
          email: (doc.user as any)?.email || '',
          phone: (doc.user as any)?.phone || '',
          specialty: doc.specialty,
          status: doc.status,
          avatar: (doc.user as any)?.avatar || null
        })),
        receptionists: clinicReceptionists.map(recep => ({
          _id: recep._id,
          name: recep.name,
          email: recep.email,
          phone: recep.phone || '',
          status: recep.status
        }))
      };
    });

    res.status(200).json({
      status: 'success',
      data: { 
        tree,
        unassignedClinics: unassignedClinicsWithStaff
      }
    });
  } catch (error) {
    next(error);
  }
};

