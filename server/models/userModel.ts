import mongoose, { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  email?: string;
  password: string;
  name: string;
  phone: string;
  age?: number;
  blood?: string;
  isBloodDonor: boolean;
  houseName?: string;
  buildingNo?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  spouse?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  onboarding: boolean;
  baseFee?:number;
  role: string;
  pushToken?:string,
  access?: string[];
  image?: string;
  isSAdmin?:boolean;
  createdBy?:mongoose.Types.ObjectId;
  otp:number|null;
  otpExpires:Date|null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: Number,
  blood: String,
  isBloodDonor: {
    type: Boolean,
    default: false,
  },
  houseName: String,
  buildingNo: String,
  maritalStatus: String,
  employmentStatus: String,
  spouse: String,
  fatherName: String,
  motherName: String,
  address: String,
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  onboarding: { type: Boolean, default: false },
  baseFee:{type:Number,required:false},
  pushToken: { type: String, default: null },
  image: String,
  otp: {
    type: Number,
    default: null,
    select: false 
  },
  otpExpires: {
    type: Date,
    default: null,
    select: false 
  },
  isSAdmin:{type:Boolean,default:false,required:false},
  createdBy:{type:mongoose.Types.ObjectId},
  access: {
    type: [String],
    default: [],
    validate: {
      validator: function(this: IUser, value: string[]) {
        // Only allow access field for ADMIN users
        return this.role === UserRole.ADMIN || value.length === 0;
      },
      message: 'Access field is only allowed for ADMIN users.',
    },
  },
}, {
  timestamps: true,
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (_: mongoose.Document, ret: Record<string, any>) => {
      delete ret.password;
      return ret;
    }
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);