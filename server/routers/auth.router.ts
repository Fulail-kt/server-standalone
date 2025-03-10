import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';
import { IUser, User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import houseModel from '../models/houseModel';
import OTP  from '../models/otpModel';

const JWT_SECRET = process.env.JWT_SECRET || 'bigSecret';
const APIHOME_API_KEY = 'a56911b08cdf3a2954674a6aa7e4b7d740176';


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

interface APIHomeResponse {
  status?: string;
  message?: string;
  id?: string;
  error?: string;
}

const requestOTP = publicProcedure
  .input(z.object({
    phone: z.string().regex(/^[6789]\d{9}$/, 'Enter a valid Indian phone number'),
  }))
  .mutation(async ({ input }) => {
    const { phone } = input;
    const fullPhone = `+91${phone}`;
    
    // Check if the user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    // Generate OTP
    const otp = generateOTP();
    
    await OTP.findOneAndUpdate(
      { phone },
      { otp },
      { upsert: true, new: true }
    );

    try {
      // Send OTP using APIHome
      const options = {
        method: 'GET' as const,
        url: 'https://apihome.in/panel/api/bulksms/',
        params: {
          key: APIHOME_API_KEY,
          mobile: fullPhone,
          otp: otp.toString(),
        },
      };

      const { data } = await axios.request<APIHomeResponse>(options);
      console.log('APIHome Response:', data);

      if (data.status !== 'Success') {
        throw new Error(`APIHome failed to send OTP: ${data.message || data.error || 'Unknown error'}`);
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('APIHome error:', error);
      throw new Error('Failed to send OTP: ' + ((error as Error).message || 'Unknown error'));
    }
  });

  const verifyOTP = publicProcedure.input(z.object({
    phone: z.string().regex(/^[6789]\d{9}$/),
    otp: z.string().length(6),
  })).mutation(async({input})=>{
    const{phone,otp}=input
    const otpRecord = await OTP.findOne({ phone });
    
    // Validate OTP
    if (!otpRecord || otpRecord.otp.toString() !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    await OTP.deleteOne({ phone });

    return {message:'success fully verified',success:true}

  })


// Signup with OTP verification
const signup = publicProcedure
  .input(
    z.object({
      name: z.string().min(4),
      phone: z.string().regex(/^[6789]\d{9}$/),
      password: z.string().min(6),
      otp: z.string().length(6),
      houseName: z.string().min(1),
      buildingNo: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    const { phone, password, name, otp, houseName, buildingNo } = input;

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone });
    
    // Validate OTP
    if (!otpRecord || otpRecord.otp.toString() !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    // Find or create house
    let house = await houseModel.findOne({ houseName, buildingNo });

    if (!house) {
      // Create new house if it doesn't exist
      house = await houseModel.create({
        houseName,
        buildingNo,
        members: [],
      });
    }
    
    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      name,
      phone,
      password: hashPassword,
      houseName,
      buildingNo,
    });
    
    await newUser.save();
    
    // Add user to house members
    await houseModel.findByIdAndUpdate(
      house._id,
      { $push: { members: newUser._id } },
      { new: true }
    );
    
    // Delete the OTP record once verified
    await OTP.deleteOne({ phone });

    // Generate token
    const token = jwt.sign(
      { 
        onBoard: newUser.onboarding ?? false, 
        userId: newUser._id, 
        role: newUser.role ?? 'user',
        access: newUser.access ?? [],
        isSAdmin: newUser.isSAdmin ?? false 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return { token, message: 'Successfully account created', success: true };
  });

// Login: Authenticate the user
const signin = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      password: z.string().min(6),
    }),
  )
  .mutation(async ({ input }) => {
    const { phone, password } = input;
    const user = await User.findOne({ phone });
    if (!user) {
      throw new Error('Invalid phone number or password');
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid phone number or password');
    }

    // Generate a JWT
    const token = jwt.sign({
      onBoard: user.onboarding ?? false, 
      userId: user._id,
      role: user.role ?? 'user',
      isSAdmin: user.isSAdmin ?? false,
      access: user.access ?? [] 
    }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { message: 'Successfully logged in', success: true, token };
  });


  const updateOnboarding = privateProcedure
  .input(
    z.object({
      name: z.string().min(4, 'Name must be at least 4 characters'),
      phone: z.string().min(10, 'Phone number must be valid'),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      age: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(18, 'Must be at least 18 years old').optional()
      ),
      blood: z.string().optional(),
      isBloodDonor: z.boolean().default(false),
      houseName: z.string(),
      buildingNo: z.string(),
      maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
      employmentStatus: z.enum(['employed', 'unemployed', 'self-employed', 'student', 'retired']).optional(),
      spouse: z.string().optional(),
      fatherName: z.string(),
      motherName: z.string(),
      address: z.string(),
    }),
  )
  .mutation(async ({ ctx,input }) => {

    console.log(ctx,input)

    const { phone, name, ...otherDetails } = input;

    console.log(input, "input");

    // Check if the user already exists
    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update user information
    existingUser.name = name;
    
    // Update all other details
    Object.assign(existingUser, otherDetails);
    
    // Set onboarding status to true
    existingUser.onboarding = true;

    await existingUser.save();

    // Generate a JWT
    const token = jwt.sign(
      {
        onBoard:true, 
        userId: existingUser._id,
        role: existingUser.role ?? 'user',
        access: existingUser.access ?? [] 
      }, 
      JWT_SECRET, 
      {
        expiresIn: '7d',
      }
    );

    return { 
      token,
      message: 'Profile updated successfully',
      success: true 
    };
  });

export const authRouter = router({
  signup,
  requestOTP,
  signin,
  verifyOTP,
  updateOnboarding
});