import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic', required: false },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Prevent user from reviewing the same clinic or doctor multiple times
reviewSchema.index({ user: 1, clinic: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, doctor: 1 }, { unique: true, sparse: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
