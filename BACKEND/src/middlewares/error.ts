import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size allowed is 25MB.';
    } else {
      message = `Upload error: ${err.message}`;
    }
  } else if (err.message && err.message.includes('Only images and PDFs are allowed!')) {
    statusCode = 400;
  }

  const status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

  logger.error({
    message: message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
