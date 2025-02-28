"use strict";
// // server/routers/committee.ts
// import { z } from 'zod';
// import { privateProcedure, router } from '../trpc';
// import committeeModel from '../models/committeeModel';
// import { User } from '../models/userModel';
// import houseModel from '../models/houseModel';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.committeeRouter = void 0;
// export const committeeRouter = router({
//   getAll: privateProcedure.query(async () => {
//     const committees = await committeeModel.find().populate('userId');
//     return committees.map(c => ({
//       id: c._id.toString(),
//       userId: c.userId._id.toString(),
//       name: c.userId.name,
//       position: c.position,
//       phone: c.userId.phone,
//       image: c.userId.image,
//     }));
//   }),
//   add: privateProcedure
//     .input(z.object({
//       houseId: z.string(),
//       userId: z.string(),
//       position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
//       role: z.enum(['USER', 'ADMIN']),
//       access: z.array(z.enum(['food', 'event', 'committee'])).optional(),
//       date: z.string(),
//     }))
//     .mutation(async ({ input }) => {
//       const user = await User.findByIdAndUpdate(input.userId, {
//         role: input.role,
//         access: input.role === 'ADMIN' ? input.access : [],
//       }, { new: true });
//       const committee = new committeeModel({
//         userId: input.userId,
//         position: input.position,
//         date: new Date(input.date),
//       });
//       await committee.save();
//       return committee;
//     }),
//   edit: privateProcedure
//     .input(z.object({
//       id: z.string(),
//       position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
//       role: z.enum(['USER', 'ADMIN']),
//       access: z.array(z.enum(['food', 'event', 'committee'])).optional(),
//     }))
//     .mutation(async ({ input }) => {
//       const committee = await committeeModel.findById(input.id);
//       if (!committee) throw new Error('Committee member not found');
//       await User.findByIdAndUpdate(committee.userId, {
//         role: input.role,
//         access: input.role === 'ADMIN' ? input.access : [],
//       });
//       return committeeModel.findByIdAndUpdate(input.id, { position: input.position }, { new: true });
//     }),
//   delete: privateProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       const committee = await committeeModel.findById(input.id);
//       if (!committee) throw new Error('Committee member not found');
//       await User.findByIdAndUpdate(committee.userId, {
//         role: 'USER',
//         access: [],
//       });
//       await committeeModel.findByIdAndDelete(input.id);
//       return { success: true };
//     }),
// });
// // server/routers/house.ts
// export const houseRouter = router({
//   getAll: privateProcedure.query(async () => {
//     return await houseModel.find();
//   }),
// });
// // server/routers/user.ts
// export const userRouter = router({
//   getByHouse: privateProcedure
//     .input(z.object({ houseId: z.string() }))
//     .query(async ({ input }) => {
//       return await User.find({ houseName: (await houseModel.findById(input.houseId))?.houseName });
//     }),
// });
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const committeeModel_1 = __importDefault(require("../models/committeeModel"));
const userModel_1 = require("../models/userModel");
exports.committeeRouter = (0, trpc_1.router)({
    getAll: trpc_1.publicProcedure.query(async () => {
        const committees = await committeeModel_1.default.find().populate('userId');
        return committees.map(c => ({
            id: c._id,
            userId: c.userId._id.toString(),
            name: c.userId.name,
            position: c.position,
            phone: c.userId.phone,
            image: c.userId.image,
            role: c.userId.role,
            access: c.userId.access,
        }));
    }),
    add: trpc_1.privateProcedure
        .input(zod_1.z.object({
        houseId: zod_1.z.string(),
        userId: zod_1.z.string(),
        position: zod_1.z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
        role: zod_1.z.enum(['USER', 'ADMIN']),
        access: zod_1.z.array(zod_1.z.enum(['food', 'event', 'committee'])).optional(),
        date: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        // Check if user is already a committee member
        const existingMember = await committeeModel_1.default.findOne({ userId: input.userId });
        if (existingMember) {
            throw new Error('This user is already a committee member');
        }
        const user = await userModel_1.User.findByIdAndUpdate(input.userId, {
            role: input.role,
            access: input.role === 'ADMIN' ? input.access : [],
        }, { new: true });
        if (!user)
            throw new Error('User not found');
        const committee = new committeeModel_1.default({
            userId: input.userId,
            position: input.position,
            date: new Date(input.date),
        });
        await committee.save();
        return committee;
    }),
    edit: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        position: zod_1.z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
        role: zod_1.z.enum(['USER', 'ADMIN']),
        access: zod_1.z.array(zod_1.z.enum(['food', 'event', 'committee'])).optional(),
    }))
        .mutation(async ({ input }) => {
        const committee = await committeeModel_1.default.findById(input.id);
        if (!committee)
            throw new Error('Committee member not found');
        await userModel_1.User.findByIdAndUpdate(committee.userId, {
            role: input.role,
            access: input.role === 'ADMIN' ? input.access : [],
        });
        return committeeModel_1.default.findByIdAndUpdate(input.id, { position: input.position }, { new: true });
    }),
    delete: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(async ({ input }) => {
        const committee = await committeeModel_1.default.findById(input.id);
        if (!committee)
            throw new Error('Committee member not found');
        await userModel_1.User.findByIdAndUpdate(committee.userId, {
            role: 'USER',
            access: [],
        });
        await committeeModel_1.default.findByIdAndDelete(input.id);
        return { success: true };
    }),
});
