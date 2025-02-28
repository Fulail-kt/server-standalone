"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
// server/routers/user.ts
const zod_1 = require("zod");
const server_1 = require("@trpc/server");
const mongoose_1 = __importDefault(require("mongoose"));
const trpc_1 = require("../trpc");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = require("../models/userModel");
const types_1 = require("../types");
const houseModel_1 = __importDefault(require("../models/houseModel"));
exports.userRouter = (0, trpc_1.router)({
    getBloodDonors: trpc_1.privateProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(10),
        cursor: zod_1.z.number().optional(),
        bloodGroup: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
        search: zod_1.z.string().optional(),
    }))
        .query(async ({ input }) => {
        const { limit, cursor, bloodGroup, search } = input;
        const skip = cursor ? (cursor - 1) * limit : 0;
        // Define the query with proper typing
        const query = {
            isBloodDonor: true,
            blood: { $ne: null }, // Ensure blood field is not null
        };
        // Add bloodGroup filter conditionally
        if (bloodGroup) {
            query.blood = bloodGroup; // This overwrites $ne, but TypeScript now accepts it
        }
        // Add search filters conditionally
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { age: isNaN(parseInt(search)) ? undefined : parseInt(search) },
            ].filter((condition) => Boolean(condition));
        }
        const donors = await userModel_1.User.find(query)
            .skip(skip)
            .limit(limit + 1) // Fetch one extra to determine hasMore
            .lean();
        const hasMore = donors.length > limit;
        const items = hasMore ? donors.slice(0, limit) : donors;
        return {
            donors: items.map((donor) => ({
                id: donor._id.toString ? donor._id.toString() : donor._id,
                name: donor.name,
                image: donor.image || '',
                age: donor.age || 0,
                bloodGroup: donor.blood,
                mobile: donor.phone,
            })),
            nextPage: hasMore ? (cursor ? cursor + 1 : 2) : undefined,
        };
    }),
    getUserById: trpc_1.privateProcedure
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(async ({ input }) => {
        const user = await mongoose_1.default.model('User').findById(input.id);
        if (!user) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        return user;
    }),
    getByHouse: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string() }))
        .query(async ({ input }) => {
        return await userModel_1.User.find({ houseName: (await houseModel_1.default.findById(input.houseId))?.houseName });
    }),
    updateUser: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        data: types_1.updateUserSchema,
    }))
        .mutation(async ({ ctx, input }) => {
        const { data } = input;
        const user = await mongoose_1.default.model('User').findById(input.id);
        if (!user) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        // Check if the user has permission to update
        if (user._id.toString() !== ctx.user.userId) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Not authorized to update this user',
            });
        }
        let house = await houseModel_1.default.findOne({ houseName: data.houseName, buildingNo: data.buildingNo });
        if (!house) {
            // Create new house if it doesn't exist
            house = await houseModel_1.default.create({
                houseName: data.houseName,
                buildingNo: data.buildingNo,
                members: [],
            });
        }
        // Assign house ID to user (convert ObjectId to string)
        data.houseName = house._id.toString();
        data.buildingNo = house._id.toString();
        const updatedUser = await mongoose_1.default.model('User').findByIdAndUpdate(input.id, { $set: input.data }, { new: true });
        return { updatedUser, message: 'update successfully', success: true };
    }),
    createUser: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        data: types_1.createUserSchema,
    }))
        .mutation(async ({ input }) => {
        const { data } = input;
        const { phone, name, password, ...otherDetails } = data;
        // Check if the hosting user exists
        const HostingUser = await userModel_1.User.findById(input.id);
        if (!HostingUser) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        // Check if phone number is already registered
        const existingUser = await userModel_1.User.findOne({ phone });
        if (existingUser) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'User with this phone number already exists',
            });
        }
        // Check if house exists
        let house = await houseModel_1.default.findOne({ houseName: data.houseName, buildingNo: data.buildingNo });
        if (!house) {
            // Create new house if it doesn't exist
            house = await houseModel_1.default.create({
                houseName: data.houseName,
                buildingNo: data.buildingNo,
                members: [],
            });
        }
        // Assign house ID to user (convert ObjectId to string)
        data.houseName = house._id.toString();
        data.buildingNo = house._id.toString();
        // Hash the password
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        // Create a new user
        const newUser = new userModel_1.User({
            phone,
            name,
            password: hashPassword,
            ...otherDetails,
        });
        await newUser.save();
        await houseModel_1.default.findByIdAndUpdate(house._id, { $push: { members: newUser._id } }, // Add new user ID to members array
        { new: true });
        return { newUser, message: 'New user created and added to house', success: true };
    })
});
