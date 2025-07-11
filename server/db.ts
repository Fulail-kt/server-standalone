// apps/server/src/db.ts
import mongoose from 'mongoose';
import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI??'';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};