import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';
import { User } from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'bigSecret';

// Signup: Create a new user
const signup = publicProcedure
  .input(
    z.object({
      name:z.string(),
      phone: z.string(),
      password: z.string().min(6),
    }),
  )
  .mutation(async ({ input }) => {
    const { phone, password ,name} = input;

    console.log(input,"input")

    // Check if the user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashPassword=await bcrypt.hash(password,10)

    // Create a new user
    const user = new User({ phone, password:hashPassword,name });
    await user.save();

    // Generate a JWT
    const token = jwt.sign({onBoard:user.onboarding??false, userId: user._id,role:user.role??'user',access:user.access??[] }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token,message:'successfully account created',success:true };
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
    const token = jwt.sign({onBoard:user.onboarding??false, userId: user._id,role:user.role??'user',access:user.access??[] }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { message:'successfully logged in ',success:true,token };
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
  signin,
  updateOnboarding
});