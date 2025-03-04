"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const trpc_1 = require("../trpc");
const zod_1 = require("zod");
const userModel_1 = require("../models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'bigSecret';
// Signup: Create a new user
const signup = trpc_1.publicProcedure
    .input(zod_1.z.object({
    name: zod_1.z.string(),
    phone: zod_1.z.string(),
    password: zod_1.z.string().min(6),
}))
    .mutation(async ({ input }) => {
    const { phone, password, name } = input;
    console.log(input, "input");
    // Check if the user already exists
    const existingUser = await userModel_1.User.findOne({ phone });
    if (existingUser) {
        throw new Error('User already exists');
    }
    const hashPassword = await bcryptjs_1.default.hash(password, 10);
    // Create a new user
    const user = new userModel_1.User({ phone, password: hashPassword, name });
    await user.save();
    // Generate a JWT
    const token = jsonwebtoken_1.default.sign({ onBoard: user.onboarding ?? false, userId: user._id, role: user.role ?? 'user', access: user.access ?? [], isSAdmin: user.isSAdmin ?? false }, JWT_SECRET, {
        expiresIn: '7d',
    });
    return { token, message: 'successfully account created', success: true };
});
// Login: Authenticate the user
const signin = trpc_1.publicProcedure
    .input(zod_1.z.object({
    phone: zod_1.z.string(),
    password: zod_1.z.string().min(6),
}))
    .mutation(async ({ input }) => {
    const { phone, password } = input;
    const user = await userModel_1.User.findOne({ phone });
    if (!user) {
        throw new Error('Invalid phone number or password');
    }
    // Compare the provided password with the hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new Error('Invalid phone number or password');
    }
    // Generate a JWT
    const token = jsonwebtoken_1.default.sign({ onBoard: user.onboarding ?? false, userId: user._id, role: user.role ?? 'user', isSAdmin: user.isSAdmin ?? false, access: user.access ?? [] }, JWT_SECRET, {
        expiresIn: '7d',
    });
    return { message: 'successfully logged in ', success: true, token };
});
const updateOnboarding = trpc_1.privateProcedure
    .input(zod_1.z.object({
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
}))
    .mutation(async ({ ctx, input }) => {
    console.log(ctx, input);
    const { phone, name, ...otherDetails } = input;
    console.log(input, "input");
    // Check if the user already exists
    const existingUser = await userModel_1.User.findOne({ phone });
    if (!existingUser) {
        throw new Error('User not found');
    }
    // Update user information
    existingUser.name = name;
    // Update all other details
    Object.assign(existingUser, otherDetails);
    // Set onboarding status to true
    existingUser.onboarding = true;
    await existingUser.save();
    // Generate a JWT
    const token = jsonwebtoken_1.default.sign({
        onBoard: true,
        userId: existingUser._id,
        role: existingUser.role ?? 'user',
        access: existingUser.access ?? []
    }, JWT_SECRET, {
        expiresIn: '7d',
    });
    return {
        token,
        message: 'Profile updated successfully',
        success: true
    };
});
exports.authRouter = (0, trpc_1.router)({
    signup,
    signin,
    updateOnboarding
});
