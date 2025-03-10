// server/routers/adhanRouter.ts
import { z } from 'zod';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import AdhanModel from '../models/prayerModel';

const adhanTimeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

export const adhanRouter = router({
  createAdhan: privateProcedure
    .input(
      z.object({
        fajr: adhanTimeSchema,
        fajrIqamah: adhanTimeSchema,
        dhuhr: adhanTimeSchema, 
        dhuhrIqamah: adhanTimeSchema, 
        asr: adhanTimeSchema,
        asrIqamah: adhanTimeSchema,
        maghrib: adhanTimeSchema, 
        maghribIqamah: adhanTimeSchema, 
        isha: adhanTimeSchema,
        ishaIqamah: adhanTimeSchema,
      })
    )
    .mutation(async ({ input }) => {
    //   if (ctx.user.role !== 'admin') {
    //     throw new TRPCError({
    //       code: 'FORBIDDEN',
    //       message: 'Only admins can create Adhan times',
    //     });
    //   }

      const existingAdhan = await AdhanModel.findOne();
      if (existingAdhan) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Adhan times already exist',
        });
      }

      const adhan = new AdhanModel(input);
      await adhan.save();
      return { adhan, message: 'Adhan times created successfully', success: true };
    }),

  updateAdhan: privateProcedure
    .input(
      z.object({
        fajr: adhanTimeSchema.optional(),
        fajrIqamah: adhanTimeSchema.optional(),
        dhuhr: adhanTimeSchema.optional(), 
        dhuhrIqamah: adhanTimeSchema.optional(), 
        asr: adhanTimeSchema.optional(),
        asrIqamah: adhanTimeSchema.optional(),
        maghrib: adhanTimeSchema.optional(), 
        maghribIqamah: adhanTimeSchema.optional(), 
        isha: adhanTimeSchema.optional(),
        ishaIqamah: adhanTimeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
    //   if (ctx.user.role !== 'admin') {
    //     throw new TRPCError({
    //       code: 'FORBIDDEN',
    //       message: 'Only admins can update Adhan times',
    //     });
    //   }

      const adhan = await AdhanModel.findOne();
      if (!adhan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Adhan times not found',
        });
      }

      const updatedData = {
        fajr: input.fajr || adhan.fajr,
        fajrIqamah: input.fajrIqamah || adhan.fajrIqamah,
        dhuhr: input.dhuhr || adhan.dhuhr,
        dhuhrIqamah: input.dhuhrIqamah || adhan.dhuhrIqamah,
        asr: input.asr || adhan.asr,
        asrIqamah: input.asrIqamah || adhan.asrIqamah,
        maghrib: input.maghrib || adhan.maghrib,
        maghribIqamah: input.maghribIqamah || adhan.maghribIqamah,
        isha: input.isha || adhan.isha,
        ishaIqamah: input.ishaIqamah || adhan.ishaIqamah,
      };

      const updatedAdhan = await AdhanModel.findOneAndUpdate({}, updatedData, { new: true });
      return { updatedAdhan, message: 'Adhan times updated successfully', success: true };
    }),

  getAdhan: publicProcedure.query(async () => {
    const adhan = await AdhanModel.findOne();
    return adhan || null;
  }),
});