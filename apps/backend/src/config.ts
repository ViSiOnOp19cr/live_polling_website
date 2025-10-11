import dotenv from 'dotenv'
dotenv.config();

export const PORT = process.env.PORT || 3005;
export const jwt_scret = process.env.JWT_SECRET || 'secret';