"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adhanRouter = void 0;
// server/routers/adhanRouter.ts
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const server_1 = require("@trpc/server");
const prayerModel_1 = __importDefault(require("../models/prayerModel"));
const adhanTimeSchema = zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');
exports.adhanRouter = (0, trpc_1.router)({
    createAdhan: trpc_1.privateProcedure
        .input(zod_1.z.object({
        fajr: adhanTimeSchema,
        dhuhr: adhanTimeSchema,
        asr: adhanTimeSchema,
        maghrib: adhanTimeSchema,
        isha: adhanTimeSchema,
    }))
        .mutation(async ({ input }) => {
        //   if (ctx.user.role !== 'admin') {
        //     throw new TRPCError({
        //       code: 'FORBIDDEN',
        //       message: 'Only admins can create Adhan times',
        //     });
        //   }
        const existingAdhan = await prayerModel_1.default.findOne();
        if (existingAdhan) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'Adhan times already exist',
            });
        }
        const adhan = new prayerModel_1.default(input);
        await adhan.save();
        return { adhan, message: 'Adhan times created successfully', success: true };
    }),
    updateAdhan: trpc_1.privateProcedure
        .input(zod_1.z.object({
        fajr: adhanTimeSchema.optional(),
        dhuhr: adhanTimeSchema.optional(),
        asr: adhanTimeSchema.optional(),
        maghrib: adhanTimeSchema.optional(),
        isha: adhanTimeSchema.optional(),
    }))
        .mutation(async ({ input }) => {
        //   if (ctx.user.role !== 'admin') {
        //     throw new TRPCError({
        //       code: 'FORBIDDEN',
        //       message: 'Only admins can update Adhan times',
        //     });
        //   }
        const adhan = await prayerModel_1.default.findOne();
        if (!adhan) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Adhan times not found',
            });
        }
        const updatedData = {
            fajr: input.fajr || adhan.fajr,
            dhuhr: input.dhuhr || adhan.dhuhr,
            asr: input.asr || adhan.asr,
            maghrib: input.maghrib || adhan.maghrib,
            isha: input.isha || adhan.isha,
        };
        const updatedAdhan = await prayerModel_1.default.findOneAndUpdate({}, updatedData, { new: true });
        return { updatedAdhan, message: 'Adhan times updated successfully', success: true };
    }),
    getAdhan: trpc_1.publicProcedure.query(async () => {
        const adhan = await prayerModel_1.default.findOne();
        return adhan || null;
    }),
});
