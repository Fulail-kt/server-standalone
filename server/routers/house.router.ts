//     // server/routers/houseRouter.ts
// import { TRPCError } from '@trpc/server';
// import { privateProcedure, router } from '../trpc';
// import { z } from 'zod';
// import houseModel from '../models/houseModel';
// import { AnnualFee } from '../models/annualModel';
// import {FilterQuery} from 'mongoose'

// interface HouseDoc {
//   _id: string;
//   houseName: string;
//   totalMembers: number;
// }
// export const houseRouter = router({
//   houseGetMembers: privateProcedure
//     .input(z.object({ houseId: z.string() }))
//     .query(async ({ input }) => {
//       const house = await houseModel.findById(input.houseId).populate('members').lean();
//       if (!house) throw new TRPCError({ code: 'NOT_FOUND', message: 'House not found' });
//       return house.members as [];
//     }),
//     getUserHouse: privateProcedure
//     .input(z.object({ userId: z.string() })) 
//     .query(async ({ input }) => {
//         const house = await houseModel
//             .findOne({ members: input.userId }) 
//             .populate({
//                 path: 'members',
//                 select: 'name phone image', 
//             })
//             .lean(); 

//         if (!house) {
//             throw new TRPCError({ code: 'NOT_FOUND', message: 'User is not part of any house' });
//         }

//         return house;
//     }),

//   houseGetAll: privateProcedure.query(async () => {
//     const houses = await houseModel.find()
//       .populate('members', 'name email phone age bloodGroup maritalStatus employmentStatus address buildingNo isBloodDonor fatherName motherName spouseName')
//       .lean();
//     return houses.map(house => ({
//       id: house._id.toString(),
//       houseName: house.houseName,
//       buildingNo: house.buildingNo,
//       totalMembers: house.members.length,
//       members: house.members as [],
//     }));
//   }),
//   getAnnualFees: privateProcedure
//   .input(
//     z.object({
//       limit: z.number().min(1).max(100).default(10),
//       cursor: z.number().optional(),
//       year: z.number(),
//       filter: z.enum(['all', 'paid', 'unpaid']).default('all'),
//       search: z.string().optional(),
//     })
//   )
//   .query(async ({ input }) => {
//     const { limit, cursor, year, filter, search } = input;
//     const skip = cursor ? (cursor - 1) * limit : 0;

//     // Fetch all houses
//     const houseQuery:FilterQuery<HouseDoc>= {};
//     if (search) {
//       houseQuery.houseName = { $regex: search, $options: 'i' };
//     }
//     const allHouses = await houseModel.find(houseQuery).lean();

//     // Fetch annual fees for the year
//     const feeQuery: {year:number} = { year };
//     const annualFees = await AnnualFee.find(feeQuery)
//       .populate('houseId', 'houseName totalMembers')
//       .lean();

//     // Combine houses with their fee status
//     const feeMap = new Map(annualFees.map(fee => [fee.houseId._id.toString(), fee]));
//     const combinedData = allHouses.map(house => {
//       const fee = feeMap.get(house._id.toString());
//       const defaultBaseFee = 100; // Default baseFee if not in AnnualFee
//       const annualAmount = fee ? fee.annualAmount : defaultBaseFee * house.totalMembers;

//       return {
//         id: house._id.toString(),
//         houseName: house.houseName,
//         totalMembers: house.totalMembers,
//         feeStatus: fee ? fee.feeStatus : 'unpaid', // No fee entry = unpaid
//         annualAmount,
//         year,
//       };
//     });

//     // Apply filter and search
//     const filteredData = combinedData.filter(data => {
//       if (filter === 'paid' && data.feeStatus !== 'paid') return false;
//       if (filter === 'unpaid' && data.feeStatus === 'paid') return false;
//       if (search && !data.houseName.toLowerCase().includes(search.toLowerCase())) return false;
//       return true;
//     });

//     const hasMore = filteredData.length > limit;
//     const items = hasMore ? filteredData.slice(skip, skip + limit) : filteredData.slice(skip);

//     return {
//       houses: items,
//       nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
//     };
//   }),

// updateBaseFee: privateProcedure
//   .input(z.object({ baseFee: z.number(), year: z.number() }))
//   .mutation(async ({ input }) => {
//     const { baseFee, year } = input;
//     const houses = await houseModel.find().lean();

//     await Promise.all(
//       houses.map(async (house) => {
//         const existingFee = await AnnualFee.findOne({ houseId: house._id, year });
//         if (!existingFee) {
//           // Only unpaid houses get an entry with the new baseFee
//           await AnnualFee.findOneAndUpdate(
//             { houseId: house._id, year },
//             { baseFee, annualAmount: baseFee * house.totalMembers, feeStatus: 'unpaid' },
//             { upsert: true, new: true }
//           );
//         } else if (existingFee.feeStatus === 'unpaid') {
//           // Update unpaid houses with new baseFee
//           existingFee.baseFee = baseFee;
//           existingFee.annualAmount = baseFee * house.totalMembers;
//           await existingFee.save();
//         }
//       })
//     );
//   }),

// toggleFeeStatus: privateProcedure
//   .input(z.object({ houseId: z.string(), year: z.number(), baseFee: z.number() }))
//   .mutation(async ({ input }) => {
//     const { houseId, year, baseFee } = input;
//     const house = await houseModel.findById(houseId).lean();
//     if (!house) throw new Error('House not found');

//     const fee = await AnnualFee.findOne({ houseId, year });
//     if (fee) {
//       if (fee.feeStatus === 'paid') {
//         // Paid -> Unpaid: Remove the AnnualFee entry
//         await AnnualFee.deleteOne({ houseId, year });
//       } else {
//         // Unpaid -> Paid: Update status and add paidDate
//         fee.feeStatus = 'paid';
//         fee.paidDate = new Date();
//         await fee.save();
//       }
//     } else {
//       // Unpaid -> Paid: Create new entry
//       await AnnualFee.create({
//         houseId,
//         year,
//         baseFee,
//         annualAmount: baseFee * house.totalMembers,
//         feeStatus: 'paid',
//         paidDate: new Date(),
//       });
//     }
//   })});

// server/routers/houseRouter.ts
import { TRPCError } from '@trpc/server';
import { privateProcedure, router } from '../trpc';
import { z } from 'zod';
import houseModel from '../models/houseModel';
import mongoose, { FilterQuery } from 'mongoose';
import AnnualFeeModel from '../models/annualModel';
import { User } from '../models/userModel';

// Define comprehensive interfaces for better type safety
interface HouseDoc {
  _id: { toString(): string };
  houseName: string;
  buildingNo?: string;
  totalMembers: number;
  members: string[];
}

interface MemberDoc {
  name: string;
  email?: string;
  phone: string;
  age?: number;
  bloodGroup?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  address?: string;
  buildingNo?: string;
  isBloodDonor?: boolean;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
}

interface AnnualFeeDoc {
  _id: { toString(): string };
  houseId: { 
    _id: { toString(): string };
    houseName: string;
    totalMembers: number;
  };
  year: number;
  baseFee: number;
  annualAmount: number;
  feeStatus: 'paid' | 'unpaid';
  paidDate?: Date;
}

interface CombinedFeeData {
  id: string;
  houseName: string;
  totalMembers: number;
  feeStatus: 'paid' | 'unpaid';
  annualAmount: number;
  year: number;
}

interface FeeStatus {
  baseFee: number;
  feeStatus: 'paid' | 'unpaid' | null; 
  houseName: string;
}

export const houseRouter = router({
  houseGetMembers: privateProcedure
    .input(z.object({ houseId: z.string() }))
    .query(async ({ input }) => {
      const house = await houseModel.findById(input.houseId).populate('members').lean();
      if (!house) throw new TRPCError({ code: 'NOT_FOUND', message: 'House not found' });
      return house.members as [];
    }),
    
  getUserHouse: privateProcedure
    .input(z.object({ userId: z.string() })) 
    .query(async ({ input }) => {
        const house = await houseModel
            .findOne({ members: input.userId }) 
            .populate({
                path: 'members',
                select: 'name phone image', 
            })
            .lean(); 

        if (!house) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'User is not part of any house' });
        }

        return house;
    }),

  houseGetAll: privateProcedure.query(async () => {
    const houses = await houseModel.find()
      .populate('members', 'name email phone age bloodGroup maritalStatus employmentStatus address buildingNo isBloodDonor fatherName motherName spouseName')
      .lean();
    return houses.map((house) => ({
      id: house._id.toString(),
      houseName: house.houseName,
      buildingNo: house.buildingNo,
      totalMembers: house.members.length,
      members: house.members as [],
    }));
  }),
  
  // getAnnualFees: privateProcedure
  // .input(
  //   z.object({
  //     limit: z.number().min(1).max(100).default(10),
  //     cursor: z.number().optional(),
  //     year: z.number(),
  //     filter: z.enum(['all', 'paid', 'unpaid']).default('all'),
  //     search: z.string().optional(),
  //   })
  // )
  // .query(async ({ input }) => {
  //   const { limit, cursor, year, filter, search } = input;
  //   const skip = cursor ? (cursor - 1) * limit : 0;

  //   // Fetch all houses
  //   const houseQuery: FilterQuery<HouseDoc> = {};
  //   if (search) {
  //     houseQuery.houseName = { $regex: search, $options: 'i' };
  //   }
  //   const allHouses = await houseModel.find(houseQuery).lean() as HouseDoc[];

  //   // Fetch annual fees for the year
  //   const feeQuery: { year: number } = { year };
  //   const annualFees = await AnnualFeeModel.find(feeQuery).populate('houseId', 'houseName totalMembers').lean() as unknown as AnnualFeeDoc[];

  //   // Combine houses with their fee status
  //   const feeMap = new Map(annualFees.map((fee: AnnualFeeDoc) => [fee.houseId._id.toString(), fee]));
  //   const combinedData = allHouses.map((house: HouseDoc) => {
  //     const fee = feeMap.get(house._id.toString());
  //     const defaultBaseFee = 100; // Default baseFee if not in AnnualFee
  //     const annualAmount = fee ? fee.annualAmount : defaultBaseFee * house.totalMembers;

  //     return {
  //       id: house._id.toString(),
  //       houseName: house.houseName,
  //       totalMembers: house.totalMembers,
  //       feeStatus: fee ? fee.feeStatus : 'unpaid', // No fee entry = unpaid
  //       annualAmount,
  //       year,
  //     } as CombinedFeeData;
  //   });

  //   // Apply filter and search
  //   const filteredData = combinedData.filter((data: CombinedFeeData) => {
  //     if (filter === 'paid' && data.feeStatus !== 'paid') return false;
  //     if (filter === 'unpaid' && data.feeStatus === 'paid') return false;
  //     if (search && !data.houseName.toLowerCase().includes(search.toLowerCase())) return false;
  //     return true;
  //   });

  //   const hasMore = filteredData.length > limit;
  //   const items = hasMore ? filteredData.slice(skip, skip + limit) : filteredData.slice(skip);

  //   return {
  //     houses: items,
  //     nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
  //   };
  // }),
  getAnnualFees:privateProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().optional(),
      year: z.number(),
      filter: z.enum(['all', 'paid', 'unpaid']).default('all'),
      search: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const { limit, cursor, year, filter, search } = input;
    const skip = cursor ? (cursor - 1) * limit : 0;

    try {
      // Step 1: Fetch annual fees for the specified year
      const feeQuery = { year };
      const annualFees = await AnnualFeeModel.find(feeQuery)
        .populate('houseId', 'houseName totalMembers')
        .lean() as unknown as AnnualFeeDoc[];

      // Step 2: Map fees to houses
      const houseIds = annualFees.map((fee) => fee.houseId._id);
      const feeMap = new Map(annualFees.map((fee) => [fee.houseId._id.toString(), fee]));

      // Step 3: Fetch houses that match the search and have fees for the year
      const houseQuery:FilterQuery<AnnualFeeDoc> = {
        _id: { $in: houseIds }, // Only houses with fees for the year
      };
      if (search) {
        houseQuery.houseName = { $regex: search, $options: 'i' };
      }
      const filteredHouses = await houseModel.find(houseQuery).lean() ;

      // Step 4: Combine data
      const combinedData = filteredHouses.map((house) => {
        const fee = feeMap.get(house._id.toString())!;
        return {
          id: house._id.toString(),
          houseName: house.houseName,
          totalMembers: house.totalMembers.toString(),
          feeStatus: fee.feeStatus,
          annualAmount: fee.annualAmount.toString(),
          year: fee.year.toString(),
        } as unknown as CombinedFeeData;
      });

      // Step 5: Apply filter
      const filteredData = combinedData.filter((data) => {
        if (filter === 'paid' && data.feeStatus !== 'paid') return false;
        if (filter === 'unpaid' && data.feeStatus === 'paid') return false;
        return true;
      });

      // Step 6: Pagination
      const hasMore = filteredData.length > skip + limit;
      const items = hasMore ? filteredData.slice(skip, skip + limit) : filteredData.slice(skip);

      return {
        houses: items,
        nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
      };
    } catch (error) {
      console.error('Error fetching annual fees:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch annual fees',
        cause: error,
      });
    }
  }),
 getAnnualFeeStatus: privateProcedure
  .input(
    z.object({
      userId: z.string(),
      year: z.number(),
    })
  )
  .query(async ({ input }): Promise<FeeStatus> => {
    try {
      // Step 1: Find the house where the userId is in the members array
      const house = await houseModel.findOne({ members: input.userId });
      if (!house) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'House not found for the user',
        });
      }

      // Step 2: Check AnnualFeeModel for the houseId and year
      const annualFee = await AnnualFeeModel.findOne({
        houseId: house._id,
        year: input.year,
      });
      const baseFeeUser= await User.findOne({isSAdmin:true,name:'super-admin'})
      // Default base fee if no record exists
      const defaultBaseFee = baseFeeUser?.baseFee??100; // Could fetch from a settings collection



      return {
        baseFee: annualFee ? annualFee.baseFee : defaultBaseFee,
        feeStatus: annualFee ? annualFee.feeStatus : null, // No record means not paid
        houseName: house.houseName,
      };
    } catch (error) {
      console.error('Error fetching annual fee status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch annual fee status',
        cause: error,
      });
    }
  }),
  updateBaseFee: privateProcedure
    .input(z.object({ baseFee: z.number() }))
    .mutation(async ({ input,ctx }) => {

      const adminCheck = await User.findById(ctx?.user?.userId);
    if (!adminCheck || adminCheck.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Unauthorized access detected',
      });
    }

    // Step 2: Update the super-admin user's baseFee
    const updatedUser = await User.findOneAndUpdate(
      { isSAdmin: true, name: 'super-admin' },
      { baseFee: input.baseFee },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Super-admin user not found',
      });
    }

    return { baseFee: updatedUser.baseFee };
    }),
  getBaseFee: privateProcedure
  .query(async ({ ctx }) => {
    const baseFeeUser = await User.findOne({ isSAdmin: true, name: 'super-admin' });

    if (!baseFeeUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Super-admin user not found',
      });
    }

    const baseFee = baseFeeUser.baseFee ?? 100; // Fallback to 100 if baseFee is undefined/null

    return baseFee ;
  }),

  toggleFeeStatus: privateProcedure
    .input(z.object({ houseId: z.string(), year: z.number(), baseFee: z.number() }))
    .mutation(async ({ input }) => {
      const { houseId, year, baseFee } = input;
      const house = await houseModel.findById(houseId).lean();
      if (!house) throw new Error('House not found');

      const fee = await AnnualFeeModel.findOne({ houseId, year });
      if (fee) {
        if (fee.feeStatus === 'paid') {
          // Paid -> Unpaid: Remove the AnnualFee entry
          await AnnualFeeModel.deleteOne({ houseId, year });
        } else {
          // Unpaid -> Paid: Update status and add paidDate
          fee.feeStatus = 'paid';
          fee.paidDate = new Date();
          await fee.save();
        }
      } else {
        // Unpaid -> Paid: Create new entry
        await AnnualFeeModel.create({
          houseId,
          year,
          baseFee,
          annualAmount: baseFee * house.totalMembers,
          feeStatus: 'paid',
          paidDate: new Date(),
        });
      }
    })
});