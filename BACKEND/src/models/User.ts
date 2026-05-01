import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
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
  clinic?: mongoose.Types.ObjectId; // Keeping for compatibility
  createdBy?: mongoose.Types.ObjectId;
  parentAdmin?: mongoose.Types.ObjectId;
  parentReceptionist?: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { 
      type: String, 
      enum: [...Object.values(UserRole), 'super_admin'], 
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
        return this.role !== 'super_admin'; 
      } 
    },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' }, // Keeping for compatibility
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    parentAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    parentReceptionist: { type: Schema.Types.ObjectId, ref: 'User' },
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
