import mongoose, { Document, Schema } from 'mongoose';

export interface IHouse extends Document {
  houseName: string;
  buildingNo: string;
  members: mongoose.Types.ObjectId[]; 
  totalMembers: number;
}

const houseSchema = new Schema<IHouse>(
  {
    houseName: { type: String, required: true },
    buildingNo: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    totalMembers: { type: Number, default: 0 },
  },
  { timestamps: true }
);


houseSchema.pre('save', function (next) {
  this.totalMembers = this.members.length;
  next();
});

export default mongoose.model<IHouse>('House', houseSchema);
