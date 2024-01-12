import { Response } from "express";
import { resData } from "./dataRes";

export const handleResponseSuccess = (res: Response, status: number, message: string, data: any): void => {
  res.status(status).json(resData(message, true, data));
};

export const handleResponseError = (res: Response, status: number, message: string): void => {
  res.status(status).json(resData(message, false));
};