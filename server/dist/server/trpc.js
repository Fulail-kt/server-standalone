"use strict";
// // import { initTRPC } from '@trpc/server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpc = exports.privateProcedure = exports.publicProcedure = exports.router = void 0;
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
const server_1 = require("@trpc/server");
const trpc_1 = require("../shared/trpc"); // Update path
Object.defineProperty(exports, "router", { enumerable: true, get: function () { return trpc_1.router; } });
Object.defineProperty(exports, "publicProcedure", { enumerable: true, get: function () { return trpc_1.publicProcedure; } });
const t = server_1.initTRPC.context().create();
const isAuthenticated = t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    return next({
        ctx: {
            user: ctx.user,
        },
    });
});
exports.privateProcedure = t.procedure.use(isAuthenticated);
exports.trpc = t;
