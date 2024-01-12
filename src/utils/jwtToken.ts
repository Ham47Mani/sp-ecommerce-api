import { JwtPayload, sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();// Use dotenv package to use envirenment variable
const secretKey: string = process.env.JWT_SECRET_KEY || "32e8d10c873e804a28208b";// JWT secret key

// ----------------- Generate token -----------------
export const generateToken = async (id: string, expire: string = '1d'): Promise<string | JwtPayload> => {
  const payload = {id};
  return sign(payload, secretKey, {expiresIn: "3d"});
};

// ----------------- Verify token -----------------
export const verifyToken = async (token: string): Promise<string | JwtPayload> => {
  try {
    const decoded = verify(token, secretKey) as JwtPayload;
    return decoded;
  } catch (err: any) {
    return 'Invalid token';
  }
};

// ----------------- Refrech token -----------------
export const  generateRefreshToken = async (id: string, exprire: string = "1d"): Promise<string | JwtPayload> => {
  const payload = {id};
  return sign(payload, secretKey, {expiresIn: exprire});
}