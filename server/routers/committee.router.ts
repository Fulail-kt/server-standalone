// // server/routers/committee.ts
// import { z } from 'zod';
// import { privateProcedure, router } from '../trpc';
// import committeeModel from '../models/committeeModel';
// import { User } from '../models/userModel';
// import houseModel from '../models/houseModel';

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





// import { z } from 'zod';
// import { privateProcedure, publicProcedure, router } from '../trpc';
// import committeeModel from '../models/committeeModel';
// import { User } from '../models/userModel';
// interface User {
//     _id: string;
//     name: string;
//     phone: string;
//     image: string;
//     role: string;
//     access: string;
//   }
// export const committeeRouter = router({
//     getAll: publicProcedure.query(async () => {
//         const committees = await committeeModel.find().populate<{ userId: User }>('userId');
//         return committees.map(c => ({
//           id: c._id,
//           userId: c.userId._id.toString(),
//           name: c.userId.name,
//           position: c.position,
//           phone: c.userId.phone,
//           image: c.userId.image,
//           role: c.userId.role,
//           access: c.userId.access,
//         }));
//       }),

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
//       // Check if user is already a committee member
//       const existingMember = await committeeModel.findOne({ userId: input.userId });
//       if (existingMember) {
//         throw new Error('This user is already a committee member');
//       }

//       const user = await User.findByIdAndUpdate(input.userId, {
//         role: input.role,
//         access: input.role === 'ADMIN' ? input.access : [],
//       }, { new: true });

//       if (!user) throw new Error('User not found');

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

import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from '../trpc';
import committeeModel from '../models/committeeModel';
import { User } from '../models/userModel';
import mongoose from 'mongoose';

// Define interfaces for your documents
interface User {
  _id: mongoose.Types.ObjectId | string; 
  name: string;
  phone: string;
  image: string;
  role: string;
  access: string[];
}

interface Committee {
  _id: mongoose.Types.ObjectId | string;
  userId: User;
  position: string;
  date: Date;
}

export const committeeRouter = router({
  getAll: publicProcedure.query(async () => {
    const committees = await committeeModel.find().populate<{ userId: User }>('userId');
    return committees.map((c) => ({
      id: (c as Committee)._id.toString(),
      userId: (c as Committee).userId._id.toString(),
      name: (c as Committee).userId.name,
      position: (c as Committee).position,
      phone: (c as Committee).userId.phone,
      image: (c as Committee).userId.image,
      role: (c as Committee).userId.role,
      access: (c as Committee).userId.access,
    }));
  }),

  add: privateProcedure
    .input(z.object({
      houseId: z.string(),
      userId: z.string(),
      position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
      role: z.enum(['user', 'admin']),
      access: z.array(z.enum(['food', 'event', 'committee','houses','annual'])).optional(),
      date: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Check if user is already a committee member
      const existingMember = await committeeModel.findOne({ userId: input.userId });
      if (existingMember) {
        throw new Error('This user is already a committee member');
      }

      const user = await User.findByIdAndUpdate(input.userId, {
        role: input.role,
        access: input.role === 'admin' ? input.access : [],
      }, { new: true });

      if (!user) throw new Error('User not found');

      const committee = new committeeModel({
        userId: input.userId,
        position: input.position,
        date: new Date(input.date),
      });
      await committee.save();
      return committee;
    }),

  edit: privateProcedure
    .input(z.object({
      id: z.string(),
      position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
      role: z.enum(['user', 'admin']),
      access: z.array(z.enum(['food', 'event', 'committee','houses','annual'])).optional(),
    }))
    .mutation(async ({ input }) => {
      const committee = await committeeModel.findById(input.id);
      if (!committee) throw new Error('Committee member not found');

      await User.findByIdAndUpdate(committee.userId, {
        role: input.role,
        access: input.role === 'admin' ? input.access : [],
      });

      return committeeModel.findByIdAndUpdate(input.id, { position: input.position }, { new: true });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const committee = await committeeModel.findById(input.id);
      if (!committee) throw new Error('Committee member not found');

      await User.findByIdAndUpdate(committee.userId, {
        role: 'user',
        access: [],
      });
      await committeeModel.findByIdAndDelete(input.id);
      return { success: true };
    }),
});