import mongoose, { Schema, Document } from 'mongoose';

export enum ClinicType {
  PRIVATE_CLINIC = 'Private Clinic',
  DIAGNOSTIC_CENTER = 'Diagnostic Center'
}

export enum VerificationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface IClinic extends Document {
  name: string;
  organizationId: mongoose.Types.ObjectId;
  clinicType: ClinicType;
  description?: string;
  images: string[];
  
  // Location
  addressLine1: string;
  addressLine2?: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };

  // Contact
  phone: string;
  alternatePhone?: string;
  email: string;
  website?: string;

  // Timing
  openingTime: string;
  closingTime: string;
  workingDays: string[]; // ['Mon', 'Tue', ...]
  emergencyAvailable: boolean;

  // Doctors
  doctors: mongoose.Types.ObjectId[];

  // Facilities & Services
  services: string[]; // ['OPD', 'Emergency', ...]
  facilities: string[]; // ['ICU', 'Ambulance', ...]

  // Fees
  registrationFee?: number;
  averageConsultationFee?: number;

  // Verification
  registrationNumber: string;
  registrationCertificate?: string;
  verificationStatus: VerificationStatus;
  slug: string;

  // System
  owner: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentReceptionist?: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  averageRating: number;
  reviewCount: number;
}

const clinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true, trim: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    clinicType: { 
      type: String, 
      enum: Object.values(ClinicType), 
      required: true,
      default: ClinicType.PRIVATE_CLINIC 
    },
    description: { type: String },
    images: [{ type: String }],

    // Location
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    // Contact
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String, required: true },
    website: { type: String },

    // Timing
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    emergencyAvailable: { type: Boolean, default: false },

    // Doctors
    doctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],

    // Facilities & Services
    services: { type: [String] },
    facilities: { type: [String] },

    // Fees
    registrationFee: { type: Number },
    averageConsultationFee: { type: Number },

    // Verification
    registrationNumber: { type: String, required: true },
    registrationCertificate: { type: String },
    verificationStatus: { 
      type: String, 
      enum: Object.values(VerificationStatus), 
      default: VerificationStatus.PENDING 
    },
    slug: { type: String, unique: true, index: true },

    // System
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentReceptionist: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clinicSchema.index({ location: '2dsphere' });

clinicSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = (this as any).name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

const Clinic = mongoose.model<IClinic>('Clinic', clinicSchema);
export default Clinic;
