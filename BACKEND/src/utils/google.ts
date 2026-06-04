import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middlewares/error';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || '',
    });
    const payload = (ticket as any).getPayload();
    if (!payload) {
      throw new AppError('Google authentication failed. Invalid token payload.', 401);
    }
    return {
      email: payload.email!,
      fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Google User',
      googleId: payload.sub,
      profilePicture: payload.picture,
      emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    };
  } catch (err: any) {
    console.error('Google Token Verification Error Details:', err);
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Google authentication failed. Please ensure you are logging in with the correct Google account or try again.', 401);
  }
}
