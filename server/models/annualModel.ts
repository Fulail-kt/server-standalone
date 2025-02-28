import mongoose,{Schema} from 'mongoose'
interface IAnnualFee {
  houseId: mongoose.Types.ObjectId;
  year: number;
  baseFee: number;
  annualAmount: number;
  feeStatus: 'paid' | 'unpaid';
  paidDate?: Date;
}

const annualFeeSchema = new Schema<IAnnualFee>(
  {
    houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    year: { type: Number, required: true },
    baseFee: { type: Number, required: true },
    annualAmount: { type: Number, required: true },
    feeStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

export const AnnualFee = mongoose.model<IAnnualFee>('AnnualFee', annualFeeSchema);