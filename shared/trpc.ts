// import { initTRPC } from '@trpc/server';
// import { boolean, z } from 'zod';
// import { privateProcedure } from '@server/trpc';

// const t = initTRPC.create();

// export const router = t.router;
// export const publicProcedure = t.procedure;

// // Define the input and output types for your routes
// export const authRouter = router({
//   signup: publicProcedure
//     .input(
//       z.object({
//         name: z.string(),
//         phone: z.string(),
//         password: z.string().min(6),
//       }),
//     )
//     .output(
//       z.object({
//         token: z.string(),
//       }),
//     )
//     .mutation(async ({ input }) => {
  
//       return { message:'',success:boolean, token: 'fake-token' }; 
//     }),

//   signin: publicProcedure
//     .input(
//       z.object({
//         phone: z.string(),
//         password: z.string().min(6),
//       }),
//     )
//     .output(
//       z.object({
//         token: z.string(),
//       }),
//     )
//     .mutation(async ({ input }) => {
//       return { message:'',success:boolean, token:'' }; 
//     }),
//     updateOnboarding: privateProcedure.input( z.object({
//       name: z.string().min(4, 'Name must be at least 4 characters'),
//       phone: z.string().min(10, 'Phone number must be valid'),
//       email: z.string().email('Invalid email address').optional().or(z.literal('')),
//       age: z.preprocess(
//         (val) => (val === '' ? undefined : Number(val)),
//         z.number().min(18, 'Must be at least 18 years old').optional()
//       ),
//       blood: z.string().optional(),
//       isBloodDonor: z.boolean().default(false),
//       houseName: z.string(),
//       buildingNo: z.string(),
//       maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
//       employmentStatus: z.enum(['employed', 'unemployed', 'self-employed', 'student', 'retired']).optional(),
//       spouse: z.string().optional(),
//       fatherName: z.string(),
//       motherName: z.string(),
//       address: z.string(),
//     })).mutation(async ({ input, ctx }) => {
//       console.log(input,"input")
//       const { phone, name, ...otherDetails } = input;

//       return { token: '',message:'',success:boolean };
//     }),
// });
// // Update schema (excluding phone and password)
// const updateUserSchema = z.object({
//   email: z.string().email().optional(),
//   age: z.number().optional(),
//   blood: z.string().optional(),
//   isBloodDonor: z.boolean().optional(),
//   houseName: z.string().optional(),
//   buildingNo: z.string().optional(),
//   maritalStatus: z.string().optional(),
//   employmentStatus: z.string().optional(),
//   spouse: z.string().optional(),
//   fatherName: z.string().optional(),
//   motherName: z.string().optional(),
//   address: z.string().optional(),
//   image: z.string().optional(),
// });

// const createUserSchema = z.object({
//   phone: z.string(), 
//   name: z.string().min(1),
//   email: z.string().email().optional(),
//   password: z.string(),
//   age: z.number(),
//   blood: z.string().optional(),
//   isBloodDonor: z.boolean().optional(),
//   houseName: z.string(),
//   buildingNo: z.string(),
//   maritalStatus: z.string().optional(),
//   employmentStatus: z.string(),
//   spouse: z.string().optional(),
//   fatherName: z.string().optional(),
//   motherName: z.string().optional(),
//   address: z.string().optional(),
//   image: z.string().optional(),
// });;

// export const userRouter = router({
//   getBloodDonors: privateProcedure
//     .input(
//       z.object({
//         limit: z.number().min(1).max(100).default(10),
//         cursor: z.number().optional(),
//         bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
//         search: z.string().optional(),
//       })
//     )
//     .query(async ({ input }) => {
//       return {
//         donors: [{id:"",name:'',age:'',image:'',bloodGroup:'',mobile:''}],
//         nextPage: '',
//       };
//     }),
//   getUserById: privateProcedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ ctx, input }) => {
     
//       return {user:{}};
//     }),
//   getByHouse: privateProcedure
//     .input(z.object({ houseId: z.string() }))
//     .query(async ({ input }) => {
//      return {user:[]};
//     }),
//   updateUser: privateProcedure
//     .input(
//       z.object({
//         id: z.string(),
//         data: updateUserSchema,
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       return {updatedUser:{},message:'',success:boolean};
//     }),

//     createUser: privateProcedure
//     .input(
//       z.object({
//         id: z.string(),
//         data: createUserSchema,
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       return {createUser:{},message:'',success:boolean};
//     }),
// });

// export const houseRouter = router({
//   houseGetMembers: privateProcedure
//     .input(z.object({ houseId: z.string() }))
//     .query(async ({ input, ctx }) => {
//       console.log("input hosue",input)
//       return { houses: [] }; 
//     }),

//   houseGetAll: privateProcedure.query(async () => {
//     console.log("get hosue")
//     return {}; 
//   }),
//   getUserHouse: privateProcedure.input(z.object({id:z.string()})).query(async ({input,ctx}) => {
//     console.log("get user House")
//     return {}; 
//   }),
//   getAnnualFees: privateProcedure
//   .input(
//     z.object({
//       limit: z.number().min(1).max(100).default(10),
//       cursor: z.number().optional(),
//       year: z.number(),
//       filter: z.enum(['all', 'paid', 'unpaid']).default('all'),
//       search: z.string().optional(),
//     })
//   )
//   .query(async ({ input }) => {
//     const houses=[{id:'',houseName:'',totalMember:'',feeStatus:'',annualAmount:'',year:''}]
//     return {
//      houses,
//       nextPage: '',
//     };
//   }),

// updateBaseFee: privateProcedure
//   .input(z.object({ baseFee: z.number(), year: z.number() }))
//   .mutation(async ({ input }) => {
   
//     return { updatedBase:''}
//   }),

// toggleFeeStatus: privateProcedure
//   .input(z.object({ houseId: z.string(), year: z.number() }))
//   .mutation(async ({ input }) => {
//     return {success:true}
//   }),
// });

// export const foodRouter = router({
//   getAll: privateProcedure.input(
//     z.object({
//       range: z.enum(['today', 'tomorrow', 'all']).default('all'),
//     })
//   ).query(async () => {
   
    
//       return {acc:{}};
//     }),
//   getUserBookings: privateProcedure.query(async ({ ctx }) => {

//     return {id:'',data:'',mealTimes:'',sponsorId:'',sponsorName:''}
//   }),

//   create: privateProcedure
//     .input(z.object({
//       date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
//       mealTimes: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).min(1),
//     }))
//     .mutation(async ({ input, ctx }) => {
//       const today = new Date().toISOString().split('T')[0];
//       if (input.date < today) {
//         throw new Error('Cannot book past dates');
//       }
    
//       return { id:'', ...input, sponsorId:'' };
//     }),
// });

// export const eventRouter = router({
//   getAll: privateProcedure.query(async () => {
//      const events =[{id:'',name:'',date:'',time:'',description:''}]
//     return {events}
//   }),

//   create: privateProcedure
//     .input(z.object({
//       name: z.string().min(1, 'Event name is required'),
//       date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
//       time: z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
//       description: z.string().min(1, 'Description is required'),
//     }))
//     .mutation(async ({ input }) => {
    
//       return { id: "", ...input };
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
     
//       return { id: "", ...updateData };
//     }),

//   delete: privateProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       return { success: true };
//     }),
// });

// const adhanTimeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');
// export const adhanRouter = router({
//   createAdhan: privateProcedure
//     .input(
//       z.object({
//         fajr: adhanTimeSchema,
//         dhuhr: adhanTimeSchema,
//         asr: adhanTimeSchema,
//         maghrib: adhanTimeSchema,
//         isha: adhanTimeSchema,
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
     
//       return { adhan:{}, message: 'Adhan times created successfully', success: true };
//     }),

//   updateAdhan: privateProcedure
//     .input(
//       z.object({
//         fajr: adhanTimeSchema.optional(),
//         dhuhr: adhanTimeSchema.optional(),
//         asr: adhanTimeSchema.optional(),
//         maghrib: adhanTimeSchema.optional(),
//         isha: adhanTimeSchema.optional(),
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
    
//       return { updatedAdhan:{}, message: 'Adhan times updated successfully', success: true };
//     }),

//   getAdhan: privateProcedure.query(async () => {
//     return{ adhan:{}}
//   }),
// });


// export const committeeRouter = router({
//   getAll: privateProcedure.query(async () => {
//     return {committee:[]}
//   }),

//   add: privateProcedure
//     .input(z.object({
//       houseId: z.string(),
//       userId: z.string(),
//       position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
//       role: z.enum(['USER', 'ADMIN']),
//       access: z.array(z.enum(['food', 'event', 'committee'])).optional(),
//       date: z.string(),
//     }))
//     .mutation(async ({ input }) => {
    
//       return {committee:[]};
//     }),

//   edit: privateProcedure
//     .input(z.object({
//       id: z.string(),
//       position: z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
//       role: z.enum(['USER', 'ADMIN']),
//       access: z.array(z.enum(['food', 'event', 'committee'])).optional(),
//     }))
//     .mutation(async ({ input }) => {
     
//       return {committee:[]}
//     }),

//   delete: privateProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       return { success: true };
//     }),
// });

// // server/routers/house.ts

// // server/routers/user.ts
// // export const userRouter = router({
// //   getByHouse: privateProcedure
// //     .input(z.object({ houseId: z.string() }))
// //     .query(async ({ input }) => {
// //       return await User.find({ houseName: (await houseModel.findById(input.houseId))?.houseName });
// //     }),
// // });







// // Export the AppRouter type
// export const appRouter = router({
//   auth: authRouter, 
//   user: userRouter,
//   house:houseRouter,
//   food:foodRouter,
//   event:eventRouter,
//   adhan:adhanRouter,
//   committee:committeeRouter
// });

// export type AppRouter = typeof appRouter;


// shared/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Placeholder routers (for type definition only)
const authRouter = router({});
const userRouter = router({});
const houseRouter = router({});
const foodRouter = router({});
const eventRouter = router({});
const adhanRouter = router({});
const committeeRouter = router({});

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  house: houseRouter,
  food: foodRouter,
  event: eventRouter,
  adhan: adhanRouter,
  committee: committeeRouter,
});

export type AppRouter = typeof appRouter;