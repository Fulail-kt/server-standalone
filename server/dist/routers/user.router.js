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
const annualModel_1 = __importDefault(require("../models/annualModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const prayerModel_1 = __importDefault(require("../models/prayerModel"));
const cloudinary_1 = require("cloudinary");
/// cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary_1.v2.config({
    cloud_name: 'dp19pgnnl',
    api_key: '458556469471787',
    api_secret: 'XruoucHbeb4XNtuPB-aXE5H8EX0',
});
exports.userRouter = (0, trpc_1.router)({
    getBloodDonors: trpc_1.publicProcedure
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
    getAdhanAndEvent: trpc_1.privateProcedure
        .query(async () => {
        try {
            const latestEvent = await eventModel_1.default.findOne()
                .sort({ _id: -1 })
                .limit(1)
                .exec();
            const latestAdhaan = await prayerModel_1.default.findOne()
                .sort({ _id: -1 })
                .limit(1)
                .exec();
            return { latestEvent, latestAdhaan };
        }
        catch (error) {
            console.error('Error fetching latest event and adhan:', error);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch latest event and adhan data',
                cause: error,
            });
        }
    }),
    getByHouse: trpc_1.privateProcedure
        .input(zod_1.z.object({ houseId: zod_1.z.string() }))
        .query(async ({ input, ctx }) => {
        const house = await houseModel_1.default.findById(input.houseId).populate('members');
        if (!house)
            return [];
        // console.log(house,"hose")
        const result = await userModel_1.User.find({
            houseName: house.houseName,
            _id: { $ne: ctx.user.userId },
        });
        // console.log(result,"ex")
        return result;
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
    uploadProfileImage: trpc_1.privateProcedure
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
        imageData: zod_1.z.string(),
        previousImage: zod_1.z.string().optional(),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            // Step 1: Upload new image to Cloudinary
            const uploadResult = await cloudinary_1.v2.uploader.upload(input.imageData, {
                folder: 'masjid_profile_images', // Updated folder name to match your original
                public_id: `user_${input.userId}_${Date.now()}`,
                overwrite: true,
            });
            const imageUrl = uploadResult.secure_url;
            // Step 2: Update user with new image URL
            const updatedUser = await userModel_1.User.findByIdAndUpdate(input.userId, { image: imageUrl }, { new: true, runValidators: true } // Return updated document and run validators
            );
            if (!updatedUser) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                });
            }
            // Step 3: Delete previous image from Cloudinary if it exists
            if (input.previousImage) {
                const publicId = input.previousImage.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary_1.v2.uploader.destroy(`masjid_profile_images/${publicId}`).catch((err) => {
                        console.warn('Failed to delete previous image:', err); // Log but don't fail the mutation
                    });
                }
            }
            return { imageUrl };
        }
        catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to upload image',
                cause: error,
            });
        }
    }),
    deleteUser: trpc_1.privateProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
    }))
        .mutation(async ({ input, ctx }) => {
        const user = await userModel_1.User.findById(input.id);
        if (!user) {
            throw new Error('User not found');
        }
        const isAdmin = await userModel_1.User.findById(ctx.user.userId);
        if (isAdmin?.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        await userModel_1.User.findByIdAndDelete(input.id);
        return { success: true, message: 'User deleted successfully' };
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
        // // Assign house ID to user (convert ObjectId to string)
        // data.houseName = (house._id as mongoose.Types.ObjectId).toString();
        // data.buildingNo = (house._id as mongoose.Types.ObjectId).toString();
        // Hash the password
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        // Create a new user
        const newUser = new userModel_1.User({
            phone,
            name,
            password: hashPassword,
            onboarding: true,
            ...otherDetails,
        });
        await newUser.save();
        await houseModel_1.default.findByIdAndUpdate(house._id, { $push: { members: newUser._id } }, // Add new user ID to members array
        { new: true });
        return { newUser, message: 'New user created and added to house', success: true };
    }),
    savePushToken: trpc_1.privateProcedure
        .input(zod_1.z.object({ pushToken: zod_1.z.string() }))
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.userId;
        await userModel_1.User.findByIdAndUpdate(userId, { pushToken: input.pushToken }, { new: true, upsert: true });
        return { success: true, message: 'Push token saved' };
    }),
    sendToAllUsers: trpc_1.privateProcedure
        .input(zod_1.z.object({
        type: zod_1.z.enum(['event', 'fee', 'custom']),
        title: zod_1.z.string().optional(), // Optional for event/fee since they’re fetched/generated
        body: zod_1.z.string().optional(),
        data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }))
        .mutation(async ({ input }) => {
        let pushTokens = [];
        let title = input.title || '';
        let body = input.body || '';
        if (input.type === 'event') {
            // Fetch the latest event
            const latestEvent = await eventModel_1.default.findOne().sort({ createdAt: -1 });
            if (!latestEvent) {
                throw new Error('No events found');
            }
            title = `Latest Event: ${latestEvent.name}`;
            body = `${latestEvent.description} - ${latestEvent.date} at ${latestEvent.time}`;
            const users = await userModel_1.User.find({ pushToken: { $ne: null } }, 'pushToken');
            pushTokens = users.map((user) => user.pushToken).filter((token) => !!token);
        }
        else if (input.type === 'fee') {
            // Get current year
            const currentYear = new Date().getFullYear();
            // Find users who have paid this year
            const paidFees = await annualModel_1.default.find({ year: currentYear, feeStatus: 'paid' }, 'houseId');
            const paidHouseIds = paidFees.map((fee) => fee.houseId.toString());
            // Find users who haven’t paid (not in paidHouseIds)
            const unpaidUsers = await userModel_1.User.find({
                pushToken: { $ne: null },
                houseId: { $nin: paidHouseIds }, // Assuming User has a houseId field
            }, 'pushToken');
            pushTokens = unpaidUsers.map((user) => user.pushToken).filter((token) => !!token);
            title = 'Annual Fee Reminder';
            body = `Your ${currentYear} annual fee is unpaid. Please settle it soon.`;
        }
        else if (input.type === 'custom') {
            if (!input.title || !input.body) {
                throw new Error('Title and body are required for custom notifications');
            }
            title = input.title;
            body = input.body;
            const users = await userModel_1.User.find({ pushToken: { $ne: null } }, 'pushToken');
            pushTokens = users.map((user) => user.pushToken).filter((token) => !!token);
        }
        if (pushTokens.length === 0) {
            throw new Error('No users with push tokens found');
        }
        const messages = pushTokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: input.data || {},
        }));
        const chunks = [];
        for (let i = 0; i < messages.length; i += 100) {
            chunks.push(messages.slice(i, i + 100));
        }
        const responses = await Promise.all(chunks.map((chunk) => fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chunk),
        }).then((res) => res.json())));
        responses.forEach((result) => {
            if (result.errors) {
                console.error('Push notification errors:', result.errors);
            }
        });
        return { success: true, message: `Sent to ${pushTokens.length} users` };
    }),
});
