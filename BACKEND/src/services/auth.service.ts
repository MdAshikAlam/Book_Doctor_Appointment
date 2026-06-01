import crypto from 'crypto';
import User, { IUser, UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';
import { sendEmail } from '../utils/email';
import logger from '../utils/logger';
import OTP from '../models/OTP';

export const registerUser = async (userData: Partial<IUser>) => {
  const emailVal = (userData.email as string).toLowerCase().trim();
  const existingUser = await User.findOne({ email: emailVal });
  
  if (existingUser) {
    if (existingUser.passwordSet === false) {
      // Complete registration for temporary account
      if (userData.phone) {
        const existingPhone = await User.findOne({ phone: userData.phone, _id: { $ne: existingUser._id } });
        if (existingPhone) {
          throw new AppError('Phone number already in use', 400);
        }
      }

      if (userData.name) existingUser.name = userData.name;
      if (userData.fullName) existingUser.fullName = userData.fullName;
      if (userData.phone) existingUser.phone = userData.phone;
      if (userData.clinicName) existingUser.clinicName = userData.clinicName;
      if (userData.city) existingUser.city = userData.city;
      if (userData.state) existingUser.state = userData.state;
      
      if (userData.role === 'admin') {
        if (userData.password) existingUser.password = userData.password;
        existingUser.passwordSet = true;
        existingUser.status = 'approved';
        existingUser.role = 'admin' as any;
      } else {
        if (userData.password) existingUser.password = userData.password;
        existingUser.passwordSet = true;
        existingUser.status = userData.role === 'doctor' ? 'pending' : 'active';
      }
      
      existingUser.emailVerified = true;
      existingUser.isEmailVerified = true;
      await existingUser.save();

      // Log Registration Activity manually (since user is not logged in)
      try {
        const ActivityLog = (await import('../models/ActivityLog')).default;
        await ActivityLog.create({
          user: existingUser._id,
          action: 'REGISTER_CLINIC',
          entityType: 'User',
          entityId: existingUser._id,
          details: `Clinic Admin registration submitted for clinic ${existingUser.clinicName}`
        } as any);
      } catch (err) {
        console.error('Failed to log registration activity:', err);
      }

      if (userData.authProvider !== 'google') {
        await OTP.deleteMany({ email: emailVal });
      }

      const userObj = existingUser.toObject();
      delete userObj.password;

      const accessToken = generateAccessToken({ id: existingUser._id.toString(), role: existingUser.role });
      const refreshToken = generateRefreshToken({ id: existingUser._id.toString(), role: existingUser.role });

      existingUser.refreshToken = refreshToken;
      await existingUser.save();

      return { user: userObj, accessToken, refreshToken };
    }
    throw new AppError('Email already in use', 400);
  }

  // Validate phone number uniqueness if present
  if (userData.phone) {
    const existingPhone = await User.findOne({ phone: userData.phone });
    if (existingPhone) {
      throw new AppError('Phone number already in use', 400);
    }
  }

  // Verify email OTP check for local provider
  if (userData.authProvider !== 'google') {
    const verifiedOTP = await OTP.findOne({ email: emailVal, verified: true });
    if (!verifiedOTP) {
      throw new AppError('Email verification is mandatory. Please verify your email first.', 400);
    }
  }
  userData.emailVerified = true;
  userData.isEmailVerified = true; // backward compatibility

  if (userData.role === 'admin') {
    userData.passwordSet = true;
    userData.status = 'approved';
  }

  const user = await User.create(userData);

  // Log Registration Activity manually (since user is not logged in)
  try {
    const ActivityLog = (await import('../models/ActivityLog')).default;
    await ActivityLog.create({
      user: user._id,
      action: 'REGISTER_ADMIN',
      entityType: 'User',
      entityId: user._id,
      details: `Clinic Admin registration completed for ${user.email}`
    } as any);
  } catch (err) {
    console.error('Failed to log registration activity:', err);
  }

  // Clean up verified OTP record after registration
  if (userData.authProvider !== 'google') {
    await OTP.deleteMany({ email: emailVal });
  }
  
  // Hide password from output
  const userObj = user.toObject();
  delete userObj.password;

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  return { user: userObj, accessToken, refreshToken };
};

export const loginUser = async (emailOrPhone: string, password?: string, isDashboard: boolean = false) => {
  if (!emailOrPhone) {
    throw new AppError('Please provide email or phone number', 400);
  }

  logger.debug(`Attempting login for: ${emailOrPhone}`);
  
  // Try to find user by email or phone
  const searchKey = emailOrPhone.includes('@') ? { email: emailOrPhone.toLowerCase().trim() } : { phone: emailOrPhone.trim() };
  const user = await User.findOne(searchKey).select('+password');
  
  if (!user) {
    logger.debug(`User not found for: ${emailOrPhone}`);
    throw new AppError('Account not found.', 404);
  }

  // Check if email is verified (Super Admin is seeded verified)
  if (user.role !== 'super_admin' && !user.emailVerified) {
    throw new AppError('Please verify your email address.', 401);
  }

  // Check if they need to set a password
  if (user.passwordSet === false) {
    throw new AppError('Please set your password to continue.', 428);
  }

  if (!password) {
    throw new AppError('Please provide password', 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.debug(`Password mismatch for user: ${emailOrPhone}`);
    throw new AppError('Incorrect email/phone or password', 401);
  }

  if (isDashboard) {
    const staffRoles: string[] = [UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST, 'super_admin'];
    if (!staffRoles.includes(user.role)) {
      throw new AppError('Email not registered.', 401);
    }

    // 1. Check User Account Status
    if (user.role !== 'super_admin') {
      if (user.status === 'pending') {
        throw new AppError('Your application is pending approval. Please wait for the administrator to approve your account.', 403);
      }
      if (user.status === 'suspended') {
        throw new AppError('Your account has been suspended. Please contact support.', 403);
      }
      if (user.status === 'inactive') {
        throw new AppError('Your account is currently inactive.', 403);
      }
      if (user.status === 'rejected') {
        throw new AppError('Your application has been rejected.', 403);
      }
      if (user.status === 'deleted') {
        throw new AppError('This account has been deleted.', 403);
      }
    }

    // 2. Check Clinic/Branch Status
    // Removed: Staff should still be able to login even if their clinic is paused (to view history/settings)
  }

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  // Hide password from output
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

export const forgotPassword = async (email: string) => {
  // Only allow staff/doctors to reset from dashboard
  const staffRoles: string[] = [UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST, 'super_admin'];
  
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    role: { $in: staffRoles }
  });

  if (!user) {
    throw new AppError('This email is not registered as a dashboard staff account.', 404);
  }

  // 1. Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash it and save to DB
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry (1 hour)
  user.passwordResetExpires = new Date(Date.now() + 3600000);

  await user.save();

  // 3. Send it to user's email
  const resetURL = `${process.env.DASHBOARD_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail(user.email, 'Your password reset token (valid for 60 min)', message, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your BookMyDoc account. Click the button below to set a new password:</p>
        <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">This link will expire in 60 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `);
    return { success: true };
  } catch (err) {
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpires = undefined;
    await user.save();
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
};

export const resetPassword = async (token: string, password?: string) => {
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  // 2. If token has not expired, and there is user, set the new password
  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  if (!password) {
    throw new AppError('Please provide a new password', 400);
  }

  user.password = password;
  (user as any).passwordResetToken = undefined;
  (user as any).passwordResetExpires = undefined;
  await user.save();

  // 3. Log the user in, send JWT
  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const googleAuth = async (data: {
  email: string;
  fullName: string;
  googleId: string;
  profilePicture?: string;
  isDashboard?: boolean;
}) => {
  const emailVal = data.email.toLowerCase().trim();
  let user = await User.findOne({ email: emailVal });

  if (!user) {
    const createData: any = {
      name: data.fullName,
      fullName: data.fullName,
      email: emailVal,
      googleId: data.googleId,
      authProvider: 'google',
      isEmailVerified: true,
      emailVerified: true,
      role: data.isDashboard ? UserRole.ADMIN : UserRole.PATIENT,
      status: data.isDashboard ? 'approved' : 'active'
    };
    if (data.profilePicture) {
      createData.profilePicture = data.profilePicture;
    }
    user = await User.create(createData);
  } else {
    if (!user.googleId) {
      user.googleId = data.googleId;
      user.authProvider = 'google';
      user.emailVerified = true;
      user.isEmailVerified = true;
      await user.save();
    }
  }

  const userObj = user.toObject();
  delete userObj.password;

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  return { user: userObj, accessToken, refreshToken };
};

export const forgotPasswordOtp = async (email: string) => {
  const emailVal = email.toLowerCase().trim();
  const user = await User.findOne({ email: emailVal });
  if (!user) {
    throw new AppError('No account found with this email address.', 404);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({
    email: emailVal,
    otp,
    expiresAt,
    verified: false
  });

  const websiteURL = process.env.CLIENT_URL || 'http://localhost:3001';
  const subject = 'Your Password Reset OTP';
  const text = `Your verification code to reset your password is ${otp}. It is valid for exactly 5 minutes (300 seconds). Link: ${websiteURL}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #00B5B5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BookMyDoctor</h2>
        <p style="font-size: 12px; color: #a0aec0; text-transform: uppercase; letter-spacing: 1.5px; margin: 5px 0 0 0; font-weight: 700;">Password Recovery</p>
      </div>
      <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">Dear User,</p>
      <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">Please use the following secure 6-digit OTP code to reset your password. This code is valid for exactly <strong>5 minutes (300 seconds)</strong>:</p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 34px; font-weight: 800; color: #00B5B5; letter-spacing: 6px; background-color: #f7fafc; padding: 12px 30px; border-radius: 12px; border: 2px dashed #00B5B5; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #718096; text-align: center;">Never share this code with anyone.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${websiteURL}" style="background-color: #00B5B5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0,181,181,0.25);">Visit Our Website</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
      <p style="font-size: 11px; color: #a0aec0; text-align: center; line-height: 1.5;">If you did not request this recovery, you can safely ignore this email.</p>
    </div>
  `;
  await sendEmail(emailVal, subject, text, html);
  return { success: true };
};

export const resetPasswordOtp = async (email: string, otp: string, passwordConfirm: string) => {
  const emailVal = email.toLowerCase().trim();
  
  const record = await OTP.findOne({
    email: emailVal,
    otp,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const user = await User.findOne({ email: emailVal });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.password = passwordConfirm;
  await user.save();

  await OTP.deleteMany({ email: emailVal });

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, accessToken, refreshToken };
};
