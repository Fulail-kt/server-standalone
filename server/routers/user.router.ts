// server/routers/user.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import mongoose, { FilterQuery } from 'mongoose';
import { privateProcedure, router } from '../trpc';
import bcrypt from 'bcryptjs'
import { User } from '../models/userModel';
import { createUserSchema, updateUserSchema } from '../types';
import houseModel from '../models/houseModel';

interface UserDoc {
  _id: string;
  name: string;
  image?: string;
  age?: number;
  blood: BloodGroup | null;
  phone: string;
  isBloodDonor: boolean;
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
          id: donor._id.toString(),
          name: donor.name,
          image: donor.image || '',
          age: donor.age || 0,
          bloodGroup: donor.blood as BloodGroup, // Safe assertion since $ne: null ensures it's not null
          mobile: donor.phone,
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
        getByHouse: privateProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ input }) => {
      return await User.find({ houseName: (await houseModel.findById(input.houseId))?.houseName });
    }),
    updateUser: privateProcedure
        .input(
            z.object({
                id: z.string(),
                data: updateUserSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            const {data}=input
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

            return {updatedUser,message:'update successfully',success:true};
        }),

 createUser : privateProcedure
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
        })
});
