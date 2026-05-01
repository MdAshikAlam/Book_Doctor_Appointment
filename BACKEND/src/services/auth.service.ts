import crypto from 'crypto';
import User, { IUser, UserRole } from '../models/User';
import { AppError } from '../middlewares/error';
import { generateAccessToken, generateRefreshToken } from '../utils/auth';
import { sendEmail } from '../utils/email';

export const registerUser = async (userData: Partial<IUser>) => {
  const existingUser = await User.findOne({ email: userData.email as string });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create(userData);
  
  // Hide password from output
  const userObj = user.toObject();
  delete userObj.password;

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  return { user: userObj, accessToken, refreshToken };
};

export const loginUser = async (email: string, password?: string, isDashboard: boolean = false) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (isDashboard) {
    const staffRoles: string[] = [UserRole.DOCTOR, UserRole.ADMIN, UserRole.RECEPTIONIST, 'super_admin'];
    if (!staffRoles.includes(user.role)) {
      throw new AppError('Email not registered.', 401);
    }
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
