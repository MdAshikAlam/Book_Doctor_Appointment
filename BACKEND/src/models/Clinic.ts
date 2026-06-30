import mongoose, { Schema, Document } from 'mongoose';

export enum ClinicType {
  PRIVATE_CLINIC = 'Private Clinic'
}

export enum VerificationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface IClinic extends Document {
  clinicName: string;
  legalName: string;
  clinicType: ClinicType;
  specialties: string[];
  description?: string;
  images: string[];
  
  // Owner
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;

  // Location
  address: string;
  addressLine2?: string;
  city?: string;
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

  // Verification
  registrationNumber: string;
  registrationProof: string;
  addressProof?: string;
  clinicStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  slug: string;

  // System
  owner: mongoose.Types.ObjectId;
  createdByAdminId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentReceptionist?: mongoose.Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  averageRating: number;
  reviewCount: number;
  receptionAssistantMode: boolean;
}

const clinicSchema = new Schema<IClinic>(
  {
    clinicName: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    clinicType: { 
      type: String, 
      enum: Object.values(ClinicType), 
      required: true,
      default: ClinicType.PRIVATE_CLINIC 
    },
    specialties: { type: [String], default: [] },
    description: { type: String },
    images: [{ type: String }],

    // Owner
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: { type: String, required: true },

    // Location
    address: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String },
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

    // Verification
    registrationNumber: { type: String, required: true, unique: true },
    registrationProof: { type: String, required: true },
    addressProof: { type: String },
    clinicStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'], 
      default: 'pending' 
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    slug: { type: String, unique: true, index: true },

    // System
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentReceptionist: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    receptionAssistantMode: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clinicSchema.index({ clinicName: 1, pincode: 1 }, { unique: true });
clinicSchema.index({ location: '2dsphere' });

clinicSchema.pre('save', function() {
  if (this.isModified('clinicName')) {
    this.slug = this.clinicName
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  if (!this.legalName) {
    this.legalName = this.clinicName;
  }
});

const Clinic = mongoose.model<IClinic>('Clinic', clinicSchema);
export default Clinic;
