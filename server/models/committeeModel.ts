import mongoose, { Document, Schema } from 'mongoose';

interface User {
    _id: string;
    name: string;
    phone: string;
    image: string;
    role: string;
    access: string;
  }
export interface ICommittee extends Document {
  userId: mongoose.Types.ObjectId|User;
  position: string;
  date: Date;
}

const committeeSchema = new Schema<ICommittee>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<ICommittee>('Committee', committeeSchema);