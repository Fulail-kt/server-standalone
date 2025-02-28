"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    phone: zod_1.z.number().optional(),
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().optional(),
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
exports.createUserSchema = zod_1.z.object({
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
