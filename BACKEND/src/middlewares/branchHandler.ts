import { Request, Response, NextFunction } from 'express';

export const branchHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // 1. Get branch from header if provided (common for Super Admin and public)
  const headerBranchId = req.headers['x-branch-id'];

  if (user) {
    if (user.role === 'super_admin') {
      // Super Admin: Global access, but can select a branch for specific views
      if (headerBranchId) {
        (req as any).branchId = headerBranchId;
      }
    } else if (user.role === 'admin') {
      // Admin: Restricted to their assigned branches
      if (headerBranchId && user.branchIds?.includes(headerBranchId as string)) {
        (req as any).branchId = headerBranchId;
      } else if (user.branchIds?.length > 0) {
        // Default to first assigned branch if none selected or invalid selection
        (req as any).branchId = user.branchIds[0];
      } else if (user.branchId) {
        // Fallback for single branch admin
        (req as any).branchId = user.branchId;
      }
    } else {
      // Receptionist / Doctor / Patient: Locked to their branchId
      (req as any).branchId = user.branchId;
    }
  } else {
    // Unauthenticated: Fallback to header for public branch-specific queries
    if (headerBranchId) {
      (req as any).branchId = headerBranchId;
    }
  }
  
  next();
};
