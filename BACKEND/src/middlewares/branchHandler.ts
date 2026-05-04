import { Request, Response, NextFunction } from 'express';

export const branchHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // 1. Get clinic from header if provided
  const headerClinicId = req.headers['x-clinic-id'];

  if (user) {
    if (user.role === 'super_admin') {
      // Super Admin: Global access, but can select a clinic for specific views
      if (headerClinicId) {
        (req as any).branchId = headerClinicId;
      }
    } else if (user.role === 'admin') {
      // Admin: Restricted to their assigned clinics
      if (headerClinicId && user.branchIds?.includes(headerClinicId as string)) {
        (req as any).branchId = headerClinicId;
      } else if (user.branchIds?.length > 0) {
        // Default to first assigned clinic if none selected or invalid selection
        (req as any).branchId = user.branchIds[0];
      } else if (user.branchId) {
        // Fallback for single clinic admin
        (req as any).branchId = user.branchId;
      }
    } else {
      // Receptionist / Doctor / Patient: Locked to their clinicId
      (req as any).branchId = user.branchId;
    }
  } else {
    // Unauthenticated: Fallback to header for public clinic-specific queries
    if (headerClinicId) {
      (req as any).branchId = headerClinicId;
    }
  }
  
  next();
};
