import { Request, Response, NextFunction } from 'express';

export const branchHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // If user is authenticated and has a branchId assigned, force it
  if (user && user.branchId) {
    (req as any).branchId = user.branchId;
  } else {
    // Fallback to header for unauthenticated or super-admin (if any)
    const branchId = req.headers['x-branch-id'];
    if (branchId) {
      (req as any).branchId = branchId;
    }
  }
  
  next();
};
