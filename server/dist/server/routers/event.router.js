"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const eventModel_1 = require("../models/eventModel");
exports.eventRouter = (0, trpc_1.router)({
    getAll: trpc_1.privateProcedure.query(async () => {
        const events = await eventModel_1.Event.find().lean();
        return events.map(event => ({
            id: event._id.toString(),
            name: event.name,
            date: event.date,
            time: event.time,
            description: event.description,
        }));
    }),
    create: trpc_1.privateProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Event name is required'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        time: zod_1.z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
        description: zod_1.z.string().min(1, 'Description is required'),
    }))
        .mutation(async ({ input }) => {
        const event = new eventModel_1.Event(input);
        await event.save();
        return { id: event._id.toString(), ...input };
    }),
    update: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1, 'Event name is required'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        time: zod_1.z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
        description: zod_1.z.string().min(1, 'Description is required'),
    }))
        .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const event = await eventModel_1.Event.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (!event)
            throw new Error('Event not found');
        return { id: event._id.toString(), ...updateData };
    }),
    delete: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(async ({ input }) => {
        const event = await eventModel_1.Event.findByIdAndDelete(input.id);
        if (!event)
            throw new Error('Event not found');
        return { success: true };
    }),
});
