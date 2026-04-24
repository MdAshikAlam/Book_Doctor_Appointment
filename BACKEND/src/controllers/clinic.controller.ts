import { Request, Response, NextFunction } from 'express';
import * as clinicService from '../services/clinic.service';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

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

const clinicSchema = z.object({
  name: z.string().min(2),
  address: z.string(),
  phone: z.string(),
  location: z.object({
    coordinates: z.array(z.number()).length(2),
  }),
});

export const createClinic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = clinicSchema.parse(req.body);
    const clinic = await clinicService.createClinic({
      ...validatedData,
      location: {
        ...validatedData.location,
        type: 'Point',
      },
      owner: req.user!.id as any,
    }, req.user!.id);

    res.status(201).json({
      status: 'success',
      data: { clinic },
    });
  } catch (error) {
    next(error);
  }
};
