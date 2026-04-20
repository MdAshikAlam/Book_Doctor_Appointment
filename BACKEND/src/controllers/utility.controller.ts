import { Request, Response, NextFunction } from 'express';
import { geocodeAddress } from '../utils/geocoder';

export const geocodeCity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, country } = req.query;

    if (!city || !country) {
      return res.status(400).json({
        status: 'error',
        message: 'City and Country are required'
      });
    }

    const { lat, lng } = await geocodeAddress('', city as string, country as string);

    res.status(200).json({
      status: 'success',
      data: { lat, lng }
    });
  } catch (error) {
    next(error);
  }
};
