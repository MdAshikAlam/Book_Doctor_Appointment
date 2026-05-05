import { Request, Response, NextFunction } from 'express';

export const branchHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // 1. Get clinic from header if provided
  const headerClinicId = req.headers['x-clinic-id'];

  if (user) {
    if (user.role === 'super_admin') {
      // Super Admin: Global access, but can select a clinic for specific views
      if (headerClinicId) {
        (req as any).clinicId = headerClinicId;
      }
    } else if (user.role === 'admin') {
      // Admin: Restricted to their assigned clinics
      if (headerClinicId && user.clinics?.includes(headerClinicId as string)) {
        (req as any).clinicId = headerClinicId;
      } else if (user.clinics?.length > 0) {
        // Default to first assigned clinic if none selected or invalid selection
        (req as any).clinicId = user.clinics[0];
      } else if (user.clinic) {
        // Fallback for single clinic admin
        (req as any).clinicId = user.clinic;
      }
    } else {
      // Receptionist / Doctor / Patient: Locked to their clinicId
      (req as any).clinicId = user.clinic;
    }
  } else {
    // Unauthenticated: Fallback to header for public clinic-specific queries
    if (headerClinicId) {
      (req as any).clinicId = headerClinicId;
    }
  }
  
  next();
};
