import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';

interface TokenPayload {
  id: string;
  role: string;
  iat?: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET as Secret, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET as Secret, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES_IN as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET) as TokenPayload;
};
