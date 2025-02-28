// server/models/adhanModel.ts
import mongoose, { Schema } from 'mongoose';

interface IAdhan {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const adhanSchema = new Schema<IAdhan>(
  {
    fajr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    dhuhr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    asr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    maghrib: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    isha: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  },
  { timestamps: true }
);

export const Adhan = mongoose.model<IAdhan>('Adhan', adhanSchema);