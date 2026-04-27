import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import * as doctorService from '../services/doctor.service';
import * as clinicService from '../services/clinic.service';
import { optionalProtect } from '../middlewares/auth';

const router = Router();

router.get('/', optionalProtect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req;
    
    const [doctors, clinics] = await Promise.all([
      doctorService.getAllDoctors(query),
      clinicService.getAllClinics(query)
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        doctors: doctors.slice(0, 5),
        clinics: clinics.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
