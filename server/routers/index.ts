// import { t } from '../trpc';
// import { z } from 'zod';

// export const appRouter = t.router({
//   greeting: t.procedure
//     .input(z.object({ name: z.string() }))
//     .query(({ input }) => {
//       return { message: `Hello, ${input.name}!` };
//     }),
// });

// export type AppRouter = typeof appRouter;


// import { GreetingResponse } from 'shared/src/types';


import { trpc } from '../trpc';
// import { authRouter } from '@native/shared';
import { authRouter } from './auth.router';
import { userRouter } from './user.router';
import { houseRouter } from './house.router';
import { foodRouter } from './food.router';
import { eventRouter } from './event.router';
import { committeeRouter } from './committee.router';
import { adhanRouter } from './prayer.router';

export const appRouter = trpc.router({
 auth:authRouter,
 user:userRouter,
 house:houseRouter,
 food:foodRouter,
 event:eventRouter,
 committee:committeeRouter,
 adhan:adhanRouter
});

export type AppRouter = typeof appRouter;