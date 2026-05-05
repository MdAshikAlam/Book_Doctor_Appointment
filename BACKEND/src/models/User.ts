import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
  SUPER_ADMIN = 'super_admin',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: Date;
  avatar?: string;
  isEmailVerified: boolean;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  organization?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  branchIds?: mongoose.Types.ObjectId[];
  clinic?: mongoose.Types.ObjectId; // Keeping for compatibility
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentReceptionist?: mongoose.Types.ObjectId;
  
  // Admin Registration Fields
  governmentIdType?: 'Aadhar' | 'PAN' | 'Passport';
  governmentIdNumber?: string;
  idProofDocument?: string;
  clinicName?: string;
  city?: string;
  state?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;

  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.PATIENT 
    },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    branchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Clinic', 
      required: function(this: any) { 
        return this.role !== UserRole.SUPER_ADMIN && 
               this.role !== UserRole.ADMIN && 
               this.role !== UserRole.PATIENT; 
      } 
    },
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Clinic' }],
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' }, // Keeping for compatibility
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentReceptionist: { type: Schema.Types.ObjectId, ref: 'User' },

    // Admin Registration Fields
    governmentIdType: { type: String, enum: ['Aadhar', 'PAN', 'Passport'] },
    governmentIdNumber: { type: String },
    idProofDocument: { type: String },
    clinicName: { type: String },
    city: { type: String },
    state: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved' // Default to approved for existing users/staff
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password!, 12);
});

userSchema.methods.comparePassword = async function (this: IUser, candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password!);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
