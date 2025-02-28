import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema({
  name: { type: String, required: true },
  date: { type: String, required: true }, 
  time: { type: String, required: true }, 
  description: { type: String, required: true },
}, { timestamps: true });

export const Event = mongoose.model('Event', EventSchema);