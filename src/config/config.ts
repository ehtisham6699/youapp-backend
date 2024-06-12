import * as dotenv from 'dotenv';

dotenv.config();
export const PORT = process.env.PORT;
export const HOSTNAME = process.env.HOSTNAME;
export const NODE_ENV = process.env.NODE_ENV;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
