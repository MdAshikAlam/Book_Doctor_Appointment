import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Clinic from '../models/Clinic';
import { AppError } from '../middlewares/error';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clinicId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user.id;

    // Check if clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      throw new AppError('Clinic not found', 404);
    }

    // Check if user already reviewed this clinic
    const existingReview = await Review.findOne({ user: userId, clinic: clinicId });
    if (existingReview) {
      throw new AppError('You have already reviewed this clinic', 400);
    }

    const review = await Review.create({
      user: userId,
      clinic: clinicId,
      rating,
      comment
    });

    // Update clinic average rating and review count
    const reviews = await Review.find({ clinic: clinicId });
    const count = reviews.length;
    const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / count;

    await Clinic.findByIdAndUpdate(clinicId, {
      averageRating: avg,
      reviewCount: count
    });

    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clinicId } = req.params;
    
    const reviews = await Review.find({ clinic: clinicId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};
