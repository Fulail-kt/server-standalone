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
const axios_1 = __importDefault(require("axios"));
const houseModel_1 = __importDefault(require("../models/houseModel"));
const otpModel_1 = __importDefault(require("../models/otpModel"));
const JWT_SECRET = process.env.JWT_SECRET || 'bigSecret';
const APIHOME_API_KEY = 'a56911b08cdf3a2954674a6aa7e4b7d740176';
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const requestOTP = trpc_1.publicProcedure
    .input(zod_1.z.object({
    phone: zod_1.z.string().regex(/^[6789]\d{9}$/, 'Enter a valid Indian phone number'),
}))
    .mutation(async ({ input }) => {
    const { phone } = input;
    const fullPhone = `+91${phone}`;
    // Check if the user already exists
    const existingUser = await userModel_1.User.findOne({ phone });
    if (existingUser) {
        throw new Error('Phone number already registered');
    }
    // Generate OTP
    const otp = generateOTP();
    await otpModel_1.default.findOneAndUpdate({ phone }, { otp }, { upsert: true, new: true });
    try {
        // Send OTP using APIHome
        const options = {
            method: 'GET',
            url: 'https://apihome.in/panel/api/bulksms/',
            params: {
                key: APIHOME_API_KEY,
                mobile: fullPhone,
                otp: otp.toString(),
            },
        };
        const { data } = await axios_1.default.request(options);
        console.log('APIHome Response:', data);
        if (data.status !== 'Success') {
            throw new Error(`APIHome failed to send OTP: ${data.message || data.error || 'Unknown error'}`);
        }
        return { success: true, message: 'OTP sent successfully' };
    }
    catch (error) {
        console.error('APIHome error:', error);
        throw new Error('Failed to send OTP: ' + (error.message || 'Unknown error'));
    }
});
const verifyOTP = trpc_1.publicProcedure.input(zod_1.z.object({
    phone: zod_1.z.string().regex(/^[6789]\d{9}$/),
    otp: zod_1.z.string().length(6),
})).mutation(async ({ input }) => {
    const { phone, otp } = input;
    const otpRecord = await otpModel_1.default.findOne({ phone });
    // Validate OTP
    if (!otpRecord || otpRecord.otp.toString() !== otp) {
        throw new Error('Invalid or expired OTP');
    }
    await otpModel_1.default.deleteOne({ phone });
    return { message: 'success fully verified', success: true };
});
// Signup with OTP verification
const signup = trpc_1.publicProcedure
    .input(zod_1.z.object({
    name: zod_1.z.string().min(4),
    phone: zod_1.z.string().regex(/^[6789]\d{9}$/),
    password: zod_1.z.string().min(6),
    otp: zod_1.z.string().length(6),
    houseName: zod_1.z.string().min(1),
    buildingNo: zod_1.z.string().min(1),
}))
    .mutation(async ({ input }) => {
    const { phone, password, name, otp, houseName, buildingNo } = input;
    // Find OTP record
    const otpRecord = await otpModel_1.default.findOne({ phone });
    // Validate OTP
    if (!otpRecord || otpRecord.otp.toString() !== otp) {
        throw new Error('Invalid or expired OTP');
    }
    // Find or create house
    let house = await houseModel_1.default.findOne({ houseName, buildingNo });
    if (!house) {
        // Create new house if it doesn't exist
        house = await houseModel_1.default.create({
            houseName,
            buildingNo,
            members: [],
        });
    }
    // Hash password
    const hashPassword = await bcryptjs_1.default.hash(password, 10);
    // Create user
    const newUser = new userModel_1.User({
        name,
        phone,
        password: hashPassword,
        houseName,
        buildingNo,
    });
    await newUser.save();
    // Add user to house members
    await houseModel_1.default.findByIdAndUpdate(house._id, { $push: { members: newUser._id } }, { new: true });
    // Delete the OTP record once verified
    await otpModel_1.default.deleteOne({ phone });
    // Generate token
    const token = jsonwebtoken_1.default.sign({
        onBoard: newUser.onboarding ?? false,
        userId: newUser._id,
        role: newUser.role ?? 'user',
        access: newUser.access ?? [],
        isSAdmin: newUser.isSAdmin ?? false
    }, JWT_SECRET, { expiresIn: '7d' });
    return { token, message: 'Successfully account created', success: true };
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
    const token = jsonwebtoken_1.default.sign({
        onBoard: user.onboarding ?? false,
        userId: user._id,
        role: user.role ?? 'user',
        isSAdmin: user.isSAdmin ?? false,
        access: user.access ?? []
    }, JWT_SECRET, {
        expiresIn: '7d',
    });
    return { message: 'Successfully logged in', success: true, token };
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
    requestOTP,
    signin,
    verifyOTP,
    updateOnboarding
});
