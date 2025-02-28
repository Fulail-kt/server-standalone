"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = exports.committeeRouter = exports.adhanRouter = exports.eventRouter = exports.foodRouter = exports.houseRouter = exports.userRouter = exports.authRouter = exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const trpc_1 = require("@server/trpc");
const t = server_1.initTRPC.create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
// Define the input and output types for your routes
exports.authRouter = (0, exports.router)({
    signup: exports.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
        phone: zod_1.z.string(),
        password: zod_1.z.string().min(6),
    }))
        .output(zod_1.z.object({
        token: zod_1.z.string(),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { message: '', success: zod_1.boolean, token: 'fake-token' };
    })),
    signin: exports.publicProcedure
        .input(zod_1.z.object({
        phone: zod_1.z.string(),
        password: zod_1.z.string().min(6),
    }))
        .output(zod_1.z.object({
        token: zod_1.z.string(),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { message: '', success: zod_1.boolean, token: '' };
    })),
    updateOnboarding: trpc_1.privateProcedure.input(zod_1.z.object({
        name: zod_1.z.string().min(4, 'Name must be at least 4 characters'),
        phone: zod_1.z.string().min(10, 'Phone number must be valid'),
        email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        age: zod_1.z.preprocess((val) => (val === '' ? undefined : Number(val)), zod_1.z.number().min(18, 'Must be at least 18 years old').optional()),
        blood: zod_1.z.string().optional(),
        isBloodDonor: zod_1.z.boolean().default(false),
        houseName: zod_1.z.string(),
        buildingNo: zod_1.z.string(),
        maritalStatus: zod_1.z.enum(['single', 'married', 'divorced', 'widowed']),
        employmentStatus: zod_1.z.enum(['employed', 'unemployed', 'self-employed', 'student', 'retired']).optional(),
        spouse: zod_1.z.string().optional(),
        fatherName: zod_1.z.string(),
        motherName: zod_1.z.string(),
        address: zod_1.z.string(),
    })).mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        console.log(input, "input");
        const { phone, name } = input, otherDetails = __rest(input, ["phone", "name"]);
        return { token: '', message: '', success: zod_1.boolean };
    })),
});
// Update schema (excluding phone and password)
const updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    age: zod_1.z.number().optional(),
    blood: zod_1.z.string().optional(),
    isBloodDonor: zod_1.z.boolean().optional(),
    houseName: zod_1.z.string().optional(),
    buildingNo: zod_1.z.string().optional(),
    maritalStatus: zod_1.z.string().optional(),
    employmentStatus: zod_1.z.string().optional(),
    spouse: zod_1.z.string().optional(),
    fatherName: zod_1.z.string().optional(),
    motherName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
const createUserSchema = zod_1.z.object({
    phone: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string(),
    age: zod_1.z.number(),
    blood: zod_1.z.string().optional(),
    isBloodDonor: zod_1.z.boolean().optional(),
    houseName: zod_1.z.string(),
    buildingNo: zod_1.z.string(),
    maritalStatus: zod_1.z.string().optional(),
    employmentStatus: zod_1.z.string(),
    spouse: zod_1.z.string().optional(),
    fatherName: zod_1.z.string().optional(),
    motherName: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
;
exports.userRouter = (0, exports.router)({
    getBloodDonors: trpc_1.privateProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(10),
        cursor: zod_1.z.number().optional(),
        bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        search: zod_1.z.string().optional(),
    }))
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return {
            donors: [{ id: "", name: '', age: '', image: '', bloodGroup: '', mobile: '' }],
            nextPage: '',
        };
    })),
    getUserById: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx, input }) {
        return { user: {} };
    })),
    getByHouse: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string() }))
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { user: [] };
    })),
    updateUser: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        data: updateUserSchema,
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx, input }) {
        return { updatedUser: {}, message: '', success: zod_1.boolean };
    })),
    createUser: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        data: createUserSchema,
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx, input }) {
        return { createUser: {}, message: '', success: zod_1.boolean };
    })),
});
exports.houseRouter = (0, exports.router)({
    houseGetMembers: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string() }))
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        console.log("input hosue", input);
        return { houses: [] };
    })),
    houseGetAll: trpc_1.privateProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("get hosue");
        return {};
    })),
    getUserHouse: trpc_1.privateProcedure.input(zod_1.z.object({ id: zod_1.z.string() })).query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        console.log("get user House");
        return {};
    })),
    getAnnualFees: trpc_1.privateProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(10),
        cursor: zod_1.z.number().optional(),
        year: zod_1.z.number(),
        filter: zod_1.z.enum(['all', 'paid', 'unpaid']).default('all'),
        search: zod_1.z.string().optional(),
    }))
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const houses = [{ id: '', houseName: '', totalMember: '', feeStatus: '', annualAmount: '', year: '' }];
        return {
            houses,
            nextPage: '',
        };
    })),
    updateBaseFee: trpc_1.privateProcedure
        .input(zod_1.z.object({ baseFee: zod_1.z.number(), year: zod_1.z.number() }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { updatedBase: '' };
    })),
    toggleFeeStatus: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string(), year: zod_1.z.number() }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { success: true };
    })),
});
exports.foodRouter = (0, exports.router)({
    getAll: trpc_1.privateProcedure.input(zod_1.z.object({
        range: zod_1.z.enum(['today', 'tomorrow', 'all']).default('all'),
    })).query(() => __awaiter(void 0, void 0, void 0, function* () {
        return { acc: {} };
    })),
    getUserBookings: trpc_1.privateProcedure.query((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx }) {
        return { id: '', data: '', mealTimes: '', sponsorId: '', sponsorName: '' };
    })),
    create: trpc_1.privateProcedure
        .input(zod_1.z.object({
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        mealTimes: zod_1.z.array(zod_1.z.enum(['morning', 'afternoon', 'evening', 'night'])).min(1),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        const today = new Date().toISOString().split('T')[0];
        if (input.date < today) {
            throw new Error('Cannot book past dates');
        }
        return Object.assign(Object.assign({ id: '' }, input), { sponsorId: '' });
    })),
});
exports.eventRouter = (0, exports.router)({
    getAll: trpc_1.privateProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        const events = [{ id: '', name: '', date: '', time: '', description: '' }];
        return { events };
    })),
    create: trpc_1.privateProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Event name is required'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        time: zod_1.z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
        description: zod_1.z.string().min(1, 'Description is required'),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return Object.assign({ id: "" }, input);
    })),
    update: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1, 'Event name is required'),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        time: zod_1.z.string().regex(/^\d{1,2}:\d{2} (AM|PM)$/, 'Invalid time format (HH:MM AM/PM)'),
        description: zod_1.z.string().min(1, 'Description is required'),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const { id } = input, updateData = __rest(input, ["id"]);
        return Object.assign({ id: "" }, updateData);
    })),
    delete: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { success: true };
    })),
});
const adhanTimeSchema = zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');
exports.adhanRouter = (0, exports.router)({
    createAdhan: trpc_1.privateProcedure
        .input(zod_1.z.object({
        fajr: adhanTimeSchema,
        dhuhr: adhanTimeSchema,
        asr: adhanTimeSchema,
        maghrib: adhanTimeSchema,
        isha: adhanTimeSchema,
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        return { adhan: {}, message: 'Adhan times created successfully', success: true };
    })),
    updateAdhan: trpc_1.privateProcedure
        .input(zod_1.z.object({
        fajr: adhanTimeSchema.optional(),
        dhuhr: adhanTimeSchema.optional(),
        asr: adhanTimeSchema.optional(),
        maghrib: adhanTimeSchema.optional(),
        isha: adhanTimeSchema.optional(),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        return { updatedAdhan: {}, message: 'Adhan times updated successfully', success: true };
    })),
    getAdhan: trpc_1.privateProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        return { adhan: {} };
    })),
});
exports.committeeRouter = (0, exports.router)({
    getAll: trpc_1.privateProcedure.query(() => __awaiter(void 0, void 0, void 0, function* () {
        return { committee: [] };
    })),
    add: trpc_1.privateProcedure
        .input(zod_1.z.object({
        houseId: zod_1.z.string(),
        userId: zod_1.z.string(),
        position: zod_1.z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
        role: zod_1.z.enum(['USER', 'ADMIN']),
        access: zod_1.z.array(zod_1.z.enum(['food', 'event', 'committee'])).optional(),
        date: zod_1.z.string(),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { committee: [] };
    })),
    edit: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        position: zod_1.z.enum(['President', 'Secretary', 'Treasurer', 'Member']),
        role: zod_1.z.enum(['USER', 'ADMIN']),
        access: zod_1.z.array(zod_1.z.enum(['food', 'event', 'committee'])).optional(),
    }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { committee: [] };
    })),
    delete: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        return { success: true };
    })),
});
// server/routers/house.ts
// server/routers/user.ts
// export const userRouter = router({
//   getByHouse: privateProcedure
//     .input(z.object({ houseId: z.string() }))
//     .query(async ({ input }) => {
//       return await User.find({ houseName: (await houseModel.findById(input.houseId))?.houseName });
//     }),
// });
// Export the AppRouter type
exports.appRouter = (0, exports.router)({
    auth: exports.authRouter,
    user: exports.userRouter,
    house: exports.houseRouter,
    food: exports.foodRouter,
    event: exports.eventRouter,
    adhan: exports.adhanRouter,
    committee: exports.committeeRouter
});
//# sourceMappingURL=trpc.js.map