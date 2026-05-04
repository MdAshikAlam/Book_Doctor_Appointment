import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  specialty: string;
  specialization?: string;
  subSpecialization?: string;
  experience: number;
  experienceYears?: number;
  qualifications: string[];
  qualification?: string[];
  licenseNumber: string;
  registrationNumber?: string;
  medicalCouncil: string;
  stateMedicalCouncil?: string;
  bio: string;
  about?: string;
  profileImage?: string;
  consultationFee: number;
  address: string;
  district: string;
  state: string;
  availability: {
    day: string;
    slots: string[];
  }[];
  leaves: {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[];
  rating: number;
  numReviews: number;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  clinic: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  clinics: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentReceptionist?: mongoose.Types.ObjectId;
  status: 'submitted' | 'verified' | 'rejected';
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId | string;
  rejectionReason?: string;
  registrationYear?: number;
  licenseDocument?: string;
  createdByAdminId?: mongoose.Types.ObjectId;
  slug: string;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: { type: String, required: true },
    specialization: { type: String },
    subSpecialization: { type: String },
    experience: { type: Number, required: true },
    experienceYears: { type: Number },
    qualifications: [{ type: String, required: true }],
    qualification: [{ type: String }],
    licenseNumber: { type: String, required: true },
    registrationNumber: { type: String },
    medicalCouncil: { type: String, required: true },
    stateMedicalCouncil: { type: String },
    bio: { type: String },
    about: { type: String },
    profileImage: { type: String },
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
    leaves: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String },
      },
    ],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    clinics: [{ type: Schema.Types.ObjectId, ref: 'Clinic' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentReceptionist: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['submitted', 'verified', 'rejected'], 
      default: 'submitted' 
    },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    registrationYear: { type: Number },
    licenseDocument: { type: String },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    slug: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

doctorSchema.index({ location: '2dsphere' });
doctorSchema.index({ specialty: 'text', bio: 'text' });

const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
export default Doctor;
