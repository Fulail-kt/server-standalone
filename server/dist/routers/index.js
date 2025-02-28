"use strict";
// import { t } from '../trpc';
// import { z } from 'zod';
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
// export const appRouter = t.router({
//   greeting: t.procedure
//     .input(z.object({ name: z.string() }))
//     .query(({ input }) => {
//       return { message: `Hello, ${input.name}!` };
//     }),
// });
// export type AppRouter = typeof appRouter;
// import { GreetingResponse } from 'shared/src/types';
const trpc_1 = require("../trpc");
// import { authRouter } from '@native/shared';
const auth_router_1 = require("./auth.router");
const user_router_1 = require("./user.router");
const house_router_1 = require("./house.router");
const food_router_1 = require("./food.router");
const event_router_1 = require("./event.router");
const committee_router_1 = require("./committee.router");
const prayer_router_1 = require("./prayer.router");
exports.appRouter = trpc_1.trpc.router({
    auth: auth_router_1.authRouter,
    user: user_router_1.userRouter,
    house: house_router_1.houseRouter,
    food: food_router_1.foodRouter,
    event: event_router_1.eventRouter,
    committee: committee_router_1.committeeRouter,
    adhan: prayer_router_1.adhanRouter
});
