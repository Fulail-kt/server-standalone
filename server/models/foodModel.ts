import mongoose, { Schema } from 'mongoose';

const FoodSponsorshipSchema = new Schema({
  date: { type: String, required: true },
  mealTimes: [{ type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true }],
  sponsorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const FoodModel = mongoose.model('Food', FoodSponsorshipSchema);