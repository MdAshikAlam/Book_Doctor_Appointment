import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  specialty: string;
  subSpecialization?: string;
  experience: number;
  qualifications: string[];
  licenseNumber: string;
  medicalCouncil: string;
  bio: string;
  consultationFee: number;
  address: string;
  district: string;
  state: string;
  availability: {
    day: string;
    slots: string[];
  }[];
  rating: number;
  numReviews: number;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  clinic: mongoose.Types.ObjectId;
  clinics: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentSubAdmin?: mongoose.Types.ObjectId;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: { type: String, required: true },
    subSpecialization: { type: String },
    experience: { type: Number, required: true },
    qualifications: [{ type: String, required: true }],
    licenseNumber: { type: String, required: true },
    medicalCouncil: { type: String, required: true },
    bio: { type: String },
    consultationFee: { type: Number, required: true },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    availability: [
      {
        day: { type: String, required: true },
        slots: [{ type: String }],
      },
    ],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    clinics: [{ type: Schema.Types.ObjectId, ref: 'Clinic' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentSubAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

doctorSchema.index({ location: '2dsphere' });
doctorSchema.index({ specialty: 'text', bio: 'text' });

const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
export default Doctor;
