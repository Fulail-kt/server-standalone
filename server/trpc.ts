// // import { initTRPC } from '@trpc/server';

// // const t = initTRPC.create();

// // export const router = t.router;
// // export const procedure = t.procedure;

// // import { initTRPC } from '@trpc/server';

// // export const t = initTRPC.create();

// // export const router = t.router;
// // export const procedure = t.procedure;




// // import { initTRPC, TRPCError } from '@trpc/server';
// // import { Context } from './context';

// // const t = initTRPC.context<Context>().create();

// // // Base router and procedure helpers
// // export const router = t.router;
// // export const publicProcedure = t.procedure;

// // // Middleware for private procedures
// // const isAuthenticated = t.middleware(({ ctx, next }) => {
// //   if (!ctx.user) {
// //     throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
// //   }
// //   return next({
// //     ctx: {
// //       user: ctx.user,
// //     },
// //   });
// // });

// // // Private procedure
// // export const privateProcedure = t.procedure.use(isAuthenticated);


// // import { initTRPC, TRPCError } from '@trpc/server';
// // import { Context } from './context';

// // // Initialize tRPC
// // const t = initTRPC.context<Context>().create();

// // // Base router and procedure helpers
// // export const router = t.router;
// // export const publicProcedure = t.procedure;

// // // Middleware for private procedures
// // const isAuthenticated = t.middleware(({ ctx, next }) => {
// //   if (!ctx.user) {
// //     throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
// //   }
// //   return next({
// //     ctx: {
// //       user: ctx.user, // Attach user to the context
// //     },
// //   });
// // });

// // // Private procedure
// // export const privateProcedure = t.procedure.use(isAuthenticated);

// // // Export the tRPC instance
// // export const trpc = t;


// import { initTRPC, TRPCError } from '@trpc/server';
// import { Context } from './context';

// // Initialize tRPC
// const t = initTRPC.context<Context>().create();

// // Base router and procedure helpers
// export const router = t.router;
// export const publicProcedure = t.procedure;

// // Middleware for private procedures
// const isAuthenticated = t.middleware(({ ctx, next }) => {
//   if (!ctx.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
//   }
//   return next({
//     ctx: {
//       user: ctx.user, // Attach user to the context
//     },
//   });
// });

// // Private procedure
// export const privateProcedure = t.procedure.use(isAuthenticated);

// // Export the tRPC instance
// export const trpc = t;


import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context'; // Update path
import { router, publicProcedure } from '../shared/trpc'; // Update path

const t = initTRPC.context<Context>().create();

export { router, publicProcedure };

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const privateProcedure = t.procedure.use(isAuthenticated);

export const trpc = t;