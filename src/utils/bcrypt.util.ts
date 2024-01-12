import bcrypt, { compare, genSaltSync, hashSync } from "bcrypt";
import dotenv from 'dotenv';

dotenv.config();

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt: string = await genSaltSync(Number(process.env.BCRYPT_SALT_ROUNDS));
  const hashedPassword: string = await hashSync(password, salt);
  return hashedPassword;
};

// Compare password
export const isMatchedPassword = async(entrePassword: string, password: string) : Promise<boolean> => {
  const isMatched: boolean = await compare(entrePassword, password);
  return isMatched;
}