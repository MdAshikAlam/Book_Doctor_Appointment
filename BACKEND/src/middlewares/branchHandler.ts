import { Request, Response, NextFunction } from 'express';

export const branchHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const headerClinicId = req.headers['x-clinic-id'];
  
  if (user) {
    if (user.role === 'super_admin') {
      if (headerClinicId) {
        (req as any).branchId = headerClinicId;
      }
    } else if (user.role === 'admin') {
      const branchIdsStrings = user.branchIds?.map((id: any) => id.toString()) || [];
      if (headerClinicId && branchIdsStrings.includes(headerClinicId as string)) {
        (req as any).branchId = headerClinicId;
      } else if (branchIdsStrings.length > 0) {
        (req as any).branchId = branchIdsStrings[0];
      } else {
        (req as any).branchId = user.branchId?.toString();
      }
    } else {
      (req as any).branchId = user.branchId?.toString();
    }
  } else if (headerClinicId) {
    (req as any).branchId = headerClinicId;
  }
  
  next();
};
