import { z } from 'zod';
import { privateProcedure, router } from '../trpc';
import { FoodModel } from '../models/foodModel';

export const foodRouter = router({
  getAll: privateProcedure
  .input(
    z.object({
      range: z.enum(['today', 'tomorrow', 'all']).default('all'),
    })
  )
  .query(async ({ input }) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    let query = {};
    if (input.range === 'today') {
      query = { date: today };
    } else if (input.range === 'tomorrow') {
      query = { date: tomorrow };
    }

    const sponsorships = await FoodModel.find(query).populate('sponsorId').lean();
    return sponsorships.reduce((acc, s) => {
      acc[s.date] = acc[s.date] || [];

      const sponsor = s.sponsorId as unknown as { 
        _id: string | { toString(): string }; 
        name?: string;
        // Add other user fields you might need
      };

      acc[s.date].push({
        id: s._id.toString(),
        date: s.date,
        mealTimes: s.mealTimes,
        sponsorId: typeof sponsor._id =="string"? sponsor._id : sponsor._id.toString(),
        sponsorName: sponsor.name || 'Unknown User', // Assuming the user object has a name field
      });
      return acc;
    }, {} as Record<string, { 
      id: string; 
      date: string; 
      mealTimes: string[]; 
      sponsorId: string;
      sponsorName: string;
    }[]>);
  }),

  getUserBookings: privateProcedure.query(async ({ ctx }) => {
    const sponsorships = await FoodModel.find({ sponsorId: ctx.user.userId }).lean();
    return sponsorships.map(s => ({
      id: s._id.toString(),
      date: s.date,
      mealTimes: s.mealTimes,
      sponsorId: s.sponsorId.toString(),
    }));
  }),

  create: privateProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      mealTimes: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const today = new Date().toISOString().split('T')[0];
      if (input.date < today) {
        throw new Error('Cannot book past dates');
      }
      const existing = await FoodModel.find({ date: input.date });
      const bookedMeals = existing.flatMap(s => s.mealTimes);
      const conflicts = input.mealTimes.filter(m => bookedMeals.includes(m));
      if (conflicts.length > 0) {
        throw new Error(`Meal times already booked: ${conflicts.join(', ')}`);
      }
      if (existing.length + input.mealTimes.length > 4) {
        throw new Error('Maximum 4 meal times can be booked per day');
      }
      const sponsorship = new FoodModel({ ...input, sponsorId: ctx.user.userId });
      await sponsorship.save();
      return { id: sponsorship._id.toString(), ...input, sponsorId: ctx.user.userId };
    }),
});