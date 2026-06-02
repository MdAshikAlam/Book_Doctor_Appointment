import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID || '',
  });
  const payload = (ticket as any).getPayload();
  if (!payload) {
    throw new Error('Invalid Google Token payload');
  }
  return {
    email: payload.email!,
    fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'Google User',
    googleId: payload.sub,
    profilePicture: payload.picture,
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
  };
}
