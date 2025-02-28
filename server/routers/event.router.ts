// import { z } from 'zod';
// import { privateProcedure, router } from '../trpc';
// import { Event } from '../models/eventModel';

// export const eventRouter = router({
//   getAll: privateProcedure.query(async () => {
//     const events = await Event.find().lean();
//     return events.map(event => ({
//       id: event._id.toString(),
//       name: event.name,
//       date: event.date,
//       time: event.time,
//       description: event.description,
//     }));
//   }),

//   create: privateProcedure
//     .input(z.object({
//       name: z.string().min(1, 'Event name is required'),
//       date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
//       time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
//       description: z.string().min(1, 'Description is required'),
//     }))
//     .mutation(async ({ input }) => {
//       const event = new Event(input);
//       await event.save();
//       return { id: event._id.toString(), ...input };
//     }),

//   update: privateProcedure
//     .input(z.object({
//       id: z.string(),
//       name: z.string().min(1, 'Event name is required'),
//       date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
//       time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
//       description: z.string().min(1, 'Description is required'),
//     }))
//     .mutation(async ({ input }) => {
//       const { id, ...updateData } = input;
//       const event = await Event.findByIdAndUpdate(id, updateData, { new: true }).lean();
//       if (!event) throw new Error('Event not found');
//       return { id: event._id.toString(), ...updateData };
//     }),

//   delete: privateProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       const event = await Event.findByIdAndDelete(input.id);
//       if (!event) throw new Error('Event not found');
//       return { success: true };
//     }),
// });

import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import { Event } from '../models/eventModel';

// Define the shape of your Event document
interface EventDocument {
  _id: { toString(): string };
  name: string;
  date: string;
  time: string;
  description: string;
}

export const eventRouter = router({
  getAll: privateProcedure.query(async () => {
    const events = await Event.find().lean();
    return events.map((event: EventDocument) => ({
      id: event._id.toString(),
      name: event.name,
      date: event.date,
      time: event.time,
      description: event.description,
    }));
  }),

  create: privateProcedure
    .input(z.object({
      name: z.string().min(1, 'Event name is required'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
      description: z.string().min(1, 'Description is required'),
    }))
    .mutation(async ({ input }) => {
      const event = new Event(input);
      await event.save();
      return { id: event._id.toString(), ...input };
    }),

  update: privateProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Event name is required'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
      time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
      description: z.string().min(1, 'Description is required'),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      const event = await Event.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!event) throw new Error('Event not found');
      return { id: event._id.toString(), ...updateData };
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const event = await Event.findByIdAndDelete(input.id);
      if (!event) throw new Error('Event not found');
      return { success: true };
    }),
});