import OTP from '../models/OTP';
import { sendEmail } from '../utils/email';
import { AppError } from '../middlewares/error';
import User from '../models/User';

export const sendOTP = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Cooldown check: resend limit 30 seconds
  const lastOTP = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
  if (lastOTP) {
    const timePassed = (Date.now() - lastOTP.createdAt.getTime()) / 1000;
    if (timePassed < 30) {
      throw new AppError(`Please wait ${Math.ceil(30 - timePassed)} seconds before requesting a new OTP.`, 429);
    }
  }

  // Rate limiting check: max 5 OTPs within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const otpCount = await OTP.countDocuments({
    email: normalizedEmail,
    createdAt: { $gte: fiveMinutesAgo }
  });
  if (otpCount >= 5) {
    throw new AppError('Too many OTP requests. Please try again after 5 minutes.', 429);
  }

  // Generate secure 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save to DB
  await OTP.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    verified: false
  });

  const websiteURL = process.env.CLIENT_URL || 'http://localhost:3001';
  // Send via email
  const subject = 'Your BookMyDoctor Verification Code';
  const text = `Your verification code is ${otp}. It is valid for exactly 5 minutes (300 seconds). Link: ${websiteURL}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #00B5B5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BookMyDoctor</h2>
        <p style="font-size: 12px; color: #a0aec0; text-transform: uppercase; letter-spacing: 1.5px; margin: 5px 0 0 0; font-weight: 700;">Email Verification</p>
      </div>
      <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">Dear User,</p>
      <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">Please use the following secure 6-digit OTP code to verify your email. This code is valid for exactly <strong>5 minutes (300 seconds)</strong>:</p>
      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 34px; font-weight: 800; color: #00B5B5; letter-spacing: 6px; background-color: #f7fafc; padding: 12px 30px; border-radius: 12px; border: 2px dashed #00B5B5; display: inline-block;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #718096; text-align: center;">Never share this code with anyone.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${websiteURL}" style="background-color: #00B5B5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0,181,181,0.25);">Visit Our Website</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
      <p style="font-size: 11px; color: #a0aec0; text-align: center; line-height: 1.5;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail(normalizedEmail, subject, text, html);
  return { success: true, message: 'OTP sent successfully!' };
};

export const verifyOTP = async (email: string, otp: string, fullName?: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  const record = await OTP.findOne({
    email: normalizedEmail,
    otp,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!record) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Mark as verified
  record.verified = true;
  await record.save();

  // Create temporary/pending user if doesn't exist
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name: fullName || 'Temporary User',
      fullName: fullName || 'Temporary User',
      email: normalizedEmail,
      isEmailVerified: true,
      emailVerified: true,
      passwordSet: false, // password is not set yet
      status: 'pending'
    });
  } else {
    // If user exists but is not email verified, update verification status
    if (!user.emailVerified) {
      user.emailVerified = true;
      user.isEmailVerified = true;
      await user.save();
    }
  }

  return { success: true, message: 'Email verified successfully!' };
};
