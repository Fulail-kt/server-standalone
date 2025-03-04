// server/routers/user.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { privateProcedure, router } from '../trpc';
import bcrypt from 'bcryptjs'
import { User } from '../models/userModel';
import { createUserSchema, updateUserSchema } from '../types';
import houseModel from '../models/houseModel';
import AnnualFeeModel from '../models/annualModel';
import EventModel from '../models/eventModel';
import AdhanModel from '../models/prayerModel';
import { v2 as cloudinary } from 'cloudinary';


/// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


interface UserDoc {
  _id: mongoose.Types.ObjectId | string;  // Allow both string and ObjectId
  name: string;
  image?: string;
  age?: number;
  blood: BloodGroup | null;
  phone: string;
  isBloodDonor: boolean;
}
interface FeeStatus {
  baseFee: number;
  feeStatus: 'paid' | 'unpaid' | null; 
  houseName: string;
}

interface ExpoPushResponse {
  data?: { status: string; message?: string; details?: string }[];
  errors?: { message: string; code: string }[];
}
// Update schema (excluding phone and password)
type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'All';
export const userRouter = router({
  getBloodDonors: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().optional(),
        bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, bloodGroup, search } = input;
      const skip = cursor ? (cursor - 1) * limit : 0;

      // Define the query with proper typing
      const query: FilterQuery<UserDoc> = {
        isBloodDonor: true,
        blood: { $ne: null }, // Ensure blood field is not null
      };

      // Add bloodGroup filter conditionally
      if (bloodGroup) {
        query.blood = bloodGroup; // This overwrites $ne, but TypeScript now accepts it
      }

      // Add search filters conditionally
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { age: isNaN(parseInt(search)) ? undefined : parseInt(search) },
        ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));
      }

      const donors = await User.find(query)
        .skip(skip)
        .limit(limit + 1) // Fetch one extra to determine hasMore
        .lean();

      const hasMore = donors.length > limit;
      const items = hasMore ? donors.slice(0, limit) : donors;


      return {
        donors: items.map((donor) => ({
          id: (donor._id as string).toString ? (donor._id as string).toString() : donor._id,
          name: donor.name,
          image: donor.image || '',
          age: donor.age || 0,
          bloodGroup: donor.blood as BloodGroup,
          mobile: donor.phone as string,
        })),
        nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
      };
    }),
  getUserById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await mongoose.model('User').findById(input.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      return user;
    }),
    getAdhanAndEvent: privateProcedure
    .query(async () => {
      try {
        const latestEvent = await EventModel.findOne()
          .sort({ _id: -1 })
          .limit(1)
          .exec(); 
  
        const latestAdhaan = await AdhanModel.findOne()
          .sort({ _id: -1 })
          .limit(1)
          .exec();
  
        return { latestEvent, latestAdhaan };
      } catch (error) {
        console.error('Error fetching latest event and adhan:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch latest event and adhan data',
          cause: error,
        });
      }
    }),
    getByHouse: privateProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ input, ctx }) => {
      const house = await houseModel.findById(input.houseId).populate('members');
      if (!house) return [];
      
      // console.log(house,"hose")
      const result= await User.find({ 
        houseName: house.houseName,
        _id: { $ne: ctx.user.userId },
      })
      // console.log(result,"ex")
      return result
    }),
  updateUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateUserSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data } = input
      const user = await mongoose.model('User').findById(input.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if the user has permission to update
      if (user._id.toString() !== ctx.user.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this user',
        });
      }

      let house = await houseModel.findOne({ houseName: data.houseName, buildingNo: data.buildingNo });

      if (!house) {
        // Create new house if it doesn't exist
        house = await houseModel.create({
          houseName: data.houseName,
          buildingNo: data.buildingNo,
          members: [],
        });
      }

      // Assign house ID to user (convert ObjectId to string)
      data.houseName = (house._id as mongoose.Types.ObjectId).toString();
      data.buildingNo = (house._id as mongoose.Types.ObjectId).toString();


      const updatedUser = await mongoose.model('User').findByIdAndUpdate(
        input.id,
        { $set: input.data },
        { new: true }
      );

      return { updatedUser, message: 'update successfully', success: true };
    }),
    uploadProfileImage:privateProcedure
    .input(
      z.object({
        userId: z.string(),
        imageData: z.string(), 
        previousImage: z.string().optional(), 
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Step 1: Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(input.imageData, {
          folder: 'masjid_profile_images', // Updated folder name to match your original
          public_id: `user_${input.userId}_${Date.now()}`,
          overwrite: true,
        });
  
        const imageUrl = uploadResult.secure_url;
  
        // Step 2: Update user with new image URL
        const updatedUser = await User.findByIdAndUpdate(
          input.userId,
          { image: imageUrl },
          { new: true, runValidators: true } // Return updated document and run validators
        );
  
        if (!updatedUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
  
        // Step 3: Delete previous image from Cloudinary if it exists
        if (input.previousImage) {
          const publicId = input.previousImage.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`masjid_profile_images/${publicId}`).catch((err) => {
              console.warn('Failed to delete previous image:', err); // Log but don't fail the mutation
            });
          }
        }
  
        return { imageUrl };
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload image',
          cause: error,
        });
      }
    }),
    deleteUser: privateProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await User.findById(input.id);
      if (!user) {
        throw new Error('User not found');
      }

        const isAdmin = await User.findById(ctx.user.userId)
        if(isAdmin?.role!=='admin'){
          throw new Error('Unauthorized');
        }
      

      await User.findByIdAndDelete(input.id);
      return { success: true, message: 'User deleted successfully' };
    }),

  createUser: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: createUserSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      const { phone, name, password, ...otherDetails } = data;

      // Check if the hosting user exists
      const HostingUser = await User.findById(input.id);
      if (!HostingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Check if phone number is already registered
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this phone number already exists',
        });
      }

      // Check if house exists
      let house = await houseModel.findOne({ houseName: data.houseName, buildingNo: data.buildingNo });

      if (!house) {
        // Create new house if it doesn't exist
        house = await houseModel.create({
          houseName: data.houseName,
          buildingNo: data.buildingNo,
          members: [],
        });
      }

      // Assign house ID to user (convert ObjectId to string)
      data.houseName = (house._id as mongoose.Types.ObjectId).toString();
      data.buildingNo = (house._id as mongoose.Types.ObjectId).toString();


      // Hash the password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        phone,
        name,
        password: hashPassword,
        ...otherDetails,
      });

      await newUser.save();

      await houseModel.findByIdAndUpdate(
        house._id,
        { $push: { members: newUser._id } }, // Add new user ID to members array
        { new: true }
      );

      return { newUser, message: 'New user created and added to house', success: true };
    }),
  savePushToken: privateProcedure
    .input(z.object({ pushToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.userId; 
      await User.findByIdAndUpdate(
        userId,
        { pushToken: input.pushToken },
        { new: true, upsert: true } 
      );
      return { success: true, message: 'Push token saved' };
    }),
    sendToAllUsers: privateProcedure
    .input(
      z.object({
        type: z.enum(['event', 'fee', 'custom']),
        title: z.string().optional(), // Optional for event/fee since they’re fetched/generated
        body: z.string().optional(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      let pushTokens: string[] = [];
      let title = input.title || '';
      let body = input.body || '';

      if (input.type === 'event') {
        // Fetch the latest event
        const latestEvent = await EventModel.findOne().sort({ createdAt: -1 });
        if (!latestEvent) {
          throw new Error('No events found');
        }
        title = `Latest Event: ${latestEvent.name}`;
        body = `${latestEvent.description} - ${latestEvent.date} at ${latestEvent.time}`;
        const users = await User.find({ pushToken: { $ne: null } }, 'pushToken');
        pushTokens = users.map((user) => user.pushToken).filter((token): token is string => !!token);
      } else if (input.type === 'fee') {
        // Get current year
        const currentYear = new Date().getFullYear();
        // Find users who have paid this year
        const paidFees = await AnnualFeeModel.find({ year: currentYear, feeStatus: 'paid' }, 'houseId');
        const paidHouseIds = paidFees.map((fee) => fee.houseId.toString());
        // Find users who haven’t paid (not in paidHouseIds)
        const unpaidUsers = await User.find({
          pushToken: { $ne: null },
          houseId: { $nin: paidHouseIds }, // Assuming User has a houseId field
        }, 'pushToken');
        pushTokens = unpaidUsers.map((user) => user.pushToken).filter((token): token is string => !!token);
        title = 'Annual Fee Reminder';
        body = `Your ${currentYear} annual fee is unpaid. Please settle it soon.`;
      } else if (input.type === 'custom') {
        if (!input.title || !input.body) {
          throw new Error('Title and body are required for custom notifications');
        }
        title = input.title;
        body = input.body;
        const users = await User.find({ pushToken: { $ne: null } }, 'pushToken');
        pushTokens = users.map((user) => user.pushToken).filter((token): token is string => !!token);
      }

      if (pushTokens.length === 0) {
        throw new Error('No users with push tokens found');
      }

      const messages = pushTokens.map((token) => ({
        to: token,
        sound: 'default' as const,
        title,
        body,
        data: input.data || {},
      }));

      const chunks: typeof messages[] = [];
      for (let i = 0; i < messages.length; i += 100) {
        chunks.push(messages.slice(i, i + 100));
      }

      const responses = await Promise.all(
        chunks.map((chunk) =>
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk),
          }).then((res) => res.json() as Promise<ExpoPushResponse>)
        )
      );

      responses.forEach((result) => {
        if (result.errors) {
          console.error('Push notification errors:', result.errors);
        }
      });

      return { success: true, message: `Sent to ${pushTokens.length} users` };
    }),
});
