import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwtToken';
import { getItem } from '../utils/mongooseCruds';
import userModel from '../model/user.model';
import { CustomRequest, ROLE } from '../utils/costume.type';

// ---------------- AuthMiddleware ----------------
export const authMiddleware = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader: string | undefined = req.headers.authorization;
  
  // Check if request has autorization start with "Bearer"
  if(!authHeader || !authHeader.startsWith('Bearer ')) {
    handleResponseError(res, HttpStatusCode.UNAUTHORIZED, 'Unauthorized - Missing or invalid token');
    return;
  }
  // Get the token
  const token = authHeader.split(' ')[1];
  try {
    // Verify token and check if payload is exists
    const payload: string | JwtPayload = await verifyToken(token);
    if(typeof payload === 'string' || !payload.id) {
      handleResponseError(res, HttpStatusCode.UNAUTHORIZED, 'Unauthorized - Invalid token');
      return;
    }
    // Get user from payload with id
    const user = await getItem(userModel, {_id: payload.id})
    if(!user) {
      handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
      return;
    }
    // Add user to request
    req.user = user;
    next();
  } catch (err: any) {
    if (err === 'Token has expired') {
      handleResponseError(res, HttpStatusCode.UNAUTHORIZED, 'Unauthorized - Token has expired');
    }
    handleResponseError(res, HttpStatusCode.INTERNALSERVERERROR, 'Internal Server Error');
  }
});

// ---------------- isAdmin ----------------
export const isAdmin = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const role:ROLE = req.user?.role as ROLE;
  if(role !== "admin") {
    handleResponseError(res, HttpStatusCode.UNAUTHORIZED, "Unauthorized, - You are not admin");
    return;
  }
  next();
});