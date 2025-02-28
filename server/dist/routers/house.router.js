"use strict";
//     // server/routers/houseRouter.ts
// import { TRPCError } from '@trpc/server';
// import { privateProcedure, router } from '../trpc';
// import { z } from 'zod';
// import houseModel from '../models/houseModel';
// import { AnnualFee } from '../models/annualModel';
// import {FilterQuery} from 'mongoose'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.houseRouter = void 0;
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
const server_1 = require("@trpc/server");
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const houseModel_1 = __importDefault(require("../models/houseModel"));
const annualModel_1 = require("../models/annualModel");
exports.houseRouter = (0, trpc_1.router)({
    houseGetMembers: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string() }))
        .query(async ({ input }) => {
        const house = await houseModel_1.default.findById(input.houseId).populate('members').lean();
        if (!house)
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'House not found' });
        return house.members;
    }),
    getUserHouse: trpc_1.privateProcedure
        .input(zod_1.z.object({ userId: zod_1.z.string() }))
        .query(async ({ input }) => {
        const house = await houseModel_1.default
            .findOne({ members: input.userId })
            .populate({
            path: 'members',
            select: 'name phone image',
        })
            .lean();
        if (!house) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User is not part of any house' });
        }
        return house;
    }),
    houseGetAll: trpc_1.privateProcedure.query(async () => {
        const houses = await houseModel_1.default.find()
            .populate('members', 'name email phone age bloodGroup maritalStatus employmentStatus address buildingNo isBloodDonor fatherName motherName spouseName')
            .lean();
        return houses.map((house) => ({
            id: house._id.toString(),
            houseName: house.houseName,
            buildingNo: house.buildingNo,
            totalMembers: house.members.length,
            members: house.members,
        }));
    }),
    getAnnualFees: trpc_1.privateProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(10),
        cursor: zod_1.z.number().optional(),
        year: zod_1.z.number(),
        filter: zod_1.z.enum(['all', 'paid', 'unpaid']).default('all'),
        search: zod_1.z.string().optional(),
    }))
        .query(async ({ input }) => {
        const { limit, cursor, year, filter, search } = input;
        const skip = cursor ? (cursor - 1) * limit : 0;
        // Fetch all houses
        const houseQuery = {};
        if (search) {
            houseQuery.houseName = { $regex: search, $options: 'i' };
        }
        const allHouses = await houseModel_1.default.find(houseQuery).lean();
        // Fetch annual fees for the year
        const feeQuery = { year };
        const annualFees = await annualModel_1.AnnualFee.find(feeQuery).populate('houseId', 'houseName totalMembers').lean();
        // Combine houses with their fee status
        const feeMap = new Map(annualFees.map((fee) => [fee.houseId._id.toString(), fee]));
        const combinedData = allHouses.map((house) => {
            const fee = feeMap.get(house._id.toString());
            const defaultBaseFee = 100; // Default baseFee if not in AnnualFee
            const annualAmount = fee ? fee.annualAmount : defaultBaseFee * house.totalMembers;
            return {
                id: house._id.toString(),
                houseName: house.houseName,
                totalMembers: house.totalMembers,
                feeStatus: fee ? fee.feeStatus : 'unpaid', // No fee entry = unpaid
                annualAmount,
                year,
            };
        });
        // Apply filter and search
        const filteredData = combinedData.filter((data) => {
            if (filter === 'paid' && data.feeStatus !== 'paid')
                return false;
            if (filter === 'unpaid' && data.feeStatus === 'paid')
                return false;
            if (search && !data.houseName.toLowerCase().includes(search.toLowerCase()))
                return false;
            return true;
        });
        const hasMore = filteredData.length > limit;
        const items = hasMore ? filteredData.slice(skip, skip + limit) : filteredData.slice(skip);
        return {
            houses: items,
            nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
        };
    }),
    updateBaseFee: trpc_1.privateProcedure
        .input(zod_1.z.object({ baseFee: zod_1.z.number(), year: zod_1.z.number() }))
        .mutation(async ({ input }) => {
        const { baseFee, year } = input;
        const houses = await houseModel_1.default.find().lean();
        await Promise.all(houses.map(async (house) => {
            const existingFee = await annualModel_1.AnnualFee.findOne({ houseId: house._id, year });
            if (!existingFee) {
                // Only unpaid houses get an entry with the new baseFee
                await annualModel_1.AnnualFee.findOneAndUpdate({ houseId: house._id, year }, { baseFee, annualAmount: baseFee * house.totalMembers, feeStatus: 'unpaid' }, { upsert: true, new: true });
            }
            else if (existingFee.feeStatus === 'unpaid') {
                // Update unpaid houses with new baseFee
                existingFee.baseFee = baseFee;
                existingFee.annualAmount = baseFee * house.totalMembers;
                await existingFee.save();
            }
        }));
    }),
    toggleFeeStatus: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string(), year: zod_1.z.number(), baseFee: zod_1.z.number() }))
        .mutation(async ({ input }) => {
        const { houseId, year, baseFee } = input;
        const house = await houseModel_1.default.findById(houseId).lean();
        if (!house)
            throw new Error('House not found');
        const fee = await annualModel_1.AnnualFee.findOne({ houseId, year });
        if (fee) {
            if (fee.feeStatus === 'paid') {
                // Paid -> Unpaid: Remove the AnnualFee entry
                await annualModel_1.AnnualFee.deleteOne({ houseId, year });
            }
            else {
                // Unpaid -> Paid: Update status and add paidDate
                fee.feeStatus = 'paid';
                fee.paidDate = new Date();
                await fee.save();
            }
        }
        else {
            // Unpaid -> Paid: Create new entry
            await annualModel_1.AnnualFee.create({
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
