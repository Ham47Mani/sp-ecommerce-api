// Use dotenv package to use envirenment variable
import dotenv from "dotenv";
import { connectToDB } from "../utils/mongooseCruds";
dotenv.config();

// ------ Connect database function ------
export const dbConnect = async () : Promise<void> => {
  try {
    const DatabaseURL:string = `${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
    connectToDB(DatabaseURL);
  } catch (err: any) {
    console.log("Cannot connect to database");
    throw new Error(err);
  }
};