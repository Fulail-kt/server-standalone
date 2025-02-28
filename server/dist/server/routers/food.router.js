"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foodRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const foodModel_1 = require("../models/foodModel");
exports.foodRouter = (0, trpc_1.router)({
    getAll: trpc_1.privateProcedure
        .input(zod_1.z.object({
        range: zod_1.z.enum(['today', 'tomorrow', 'all']).default('all'),
    }))
        .query(async ({ input }) => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
        let query = {};
        if (input.range === 'today') {
            query = { date: today };
        }
        else if (input.range === 'tomorrow') {
            query = { date: tomorrow };
        }
        const sponsorships = await foodModel_1.FoodModel.find(query).populate('sponsorId').lean();
        return sponsorships.reduce((acc, s) => {
            acc[s.date] = acc[s.date] || [];
            const sponsor = s.sponsorId;
            acc[s.date].push({
                id: s._id.toString(),
                date: s.date,
                mealTimes: s.mealTimes,
                sponsorId: typeof sponsor._id == "string" ? sponsor._id : sponsor._id.toString(),
                sponsorName: sponsor.name || 'Unknown User', // Assuming the user object has a name field
            });
            return acc;
        }, {});
    }),
    getUserBookings: trpc_1.privateProcedure.query(async ({ ctx }) => {
        const sponsorships = await foodModel_1.FoodModel.find({ sponsorId: ctx.user.userId }).lean();
        return sponsorships.map(s => ({
            id: s._id.toString(),
            date: s.date,
            mealTimes: s.mealTimes,
            sponsorId: s.sponsorId.toString(),
        }));
    }),
    create: trpc_1.privateProcedure
        .input(zod_1.z.object({
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        mealTimes: zod_1.z.array(zod_1.z.enum(['morning', 'afternoon', 'evening', 'night'])).min(1),
    }))
        .mutation(async ({ input, ctx }) => {
        const today = new Date().toISOString().split('T')[0];
        if (input.date < today) {
            throw new Error('Cannot book past dates');
        }
        const existing = await foodModel_1.FoodModel.find({ date: input.date });
        const bookedMeals = existing.flatMap(s => s.mealTimes);
        const conflicts = input.mealTimes.filter(m => bookedMeals.includes(m));
        if (conflicts.length > 0) {
            throw new Error(`Meal times already booked: ${conflicts.join(', ')}`);
        }
        if (existing.length + input.mealTimes.length > 4) {
            throw new Error('Maximum 4 meal times can be booked per day');
        }
        const sponsorship = new foodModel_1.FoodModel({ ...input, sponsorId: ctx.user.userId });
        await sponsorship.save();
        return { id: sponsorship._id.toString(), ...input, sponsorId: ctx.user.userId };
    }),
});
