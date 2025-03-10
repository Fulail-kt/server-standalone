import mongoose, { Schema } from 'mongoose';

interface IAdhan {
  fajr: string;
  fajrIqamah: string;
  dhuhr: string;
  dhuhrIqamah: string;
  asr: string;
  asrIqamah: string;
  maghrib: string;
  maghribIqamah: string;
  isha: string;
  ishaIqamah: string;
}

const adhanSchema = new Schema<IAdhan>(
  {
    fajr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    fajrIqamah: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    dhuhr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    dhuhrIqamah: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    asr: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    asrIqamah: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    maghrib: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    maghribIqamah: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    isha: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
    ishaIqamah: { type: String, required: true, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  },
  { timestamps: true }
);

const AdhanModel = mongoose.model<IAdhan>('Adhan', adhanSchema);

export default AdhanModel;