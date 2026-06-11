import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Clinic from '../models/Clinic';
import Doctor from '../models/Doctor';
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

    let review = await Review.findOne({ user: userId, clinic: clinicId } as any);
    let isNew = false;
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      isNew = true;
      review = await Review.create({
        user: userId,
        clinic: clinicId as any,
        rating,
        comment
      });
    }

    // Update clinic average rating and review count
    const reviews = await Review.find({ clinic: clinicId } as any);
    const count = reviews.length;
    const avg = count > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / count) : 0;

    await Clinic.findByIdAndUpdate(clinicId, {
      averageRating: avg,
      reviewCount: count
    });

    res.status(isNew ? 201 : 200).json({
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
    const userId = (req as any).user?.id;
    
    const reviews = await Review.find({ clinic: clinicId } as any)
      .populate('user', 'name avatar')
      .sort('-createdAt');

    let sortedReviews = [...reviews];
    if (userId) {
      const userReviewIndex = sortedReviews.findIndex(r => r.user?._id?.toString() === userId.toString());
      if (userReviewIndex > -1) {
        const [userReview] = sortedReviews.splice(userReviewIndex, 1);
        if (userReview) {
          sortedReviews.unshift(userReview);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      results: sortedReviews.length,
      data: { reviews: sortedReviews }
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateDoctorReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user.id;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    let review = await Review.findOne({ user: userId, doctor: doctorId } as any);
    let isNew = false;
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      isNew = true;
      review = await Review.create({
        user: userId,
        doctor: doctorId as any,
        rating,
        comment
      });
    }

    // Update doctor average rating and review count
    const reviews = await Review.find({ doctor: doctorId } as any);
    const count = reviews.length;
    const avg = count > 0 ? (reviews.reduce((acc, item) => item.rating + acc, 0) / count) : 0;

    await Doctor.findByIdAndUpdate(doctorId, {
      rating: avg,
      numReviews: count
    });

    res.status(isNew ? 201 : 200).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: doctorId } = req.params;
    const userId = (req as any).user?.id;
    
    const reviews = await Review.find({ doctor: doctorId } as any)
      .populate('user', 'name avatar')
      .sort('-createdAt');

    let sortedReviews = [...reviews];
    if (userId) {
      const userReviewIndex = sortedReviews.findIndex(r => r.user?._id?.toString() === userId.toString());
      if (userReviewIndex > -1) {
        const [userReview] = sortedReviews.splice(userReviewIndex, 1);
        if (userReview) {
          sortedReviews.unshift(userReview);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      results: sortedReviews.length,
      data: { reviews: sortedReviews }
    });
  } catch (error) {
    next(error);
  }
};
