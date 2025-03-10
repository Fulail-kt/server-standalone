import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, 
});

export default mongoose.model<IOTP>('OTP', OTPSchema);