import { z } from "zod";

export const updateUserSchema = z.object({
  phone:z.number().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  password:z.string().optional(),
  age: z.number().optional(),
  blood: z.string().optional(),
  isBloodDonor: z.boolean().optional(),
  houseName: z.string().optional(),
  buildingNo: z.string().optional(),
  maritalStatus: z.string().optional(),
  employmentStatus: z.string().optional(),
  spouse: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
});

export const createUserSchema = z.object({
    phone: z.string(),
    name: z.string().min(1),
    email: z.string().email().optional(),
    password: z.string(),
    age: z.number(),
    blood: z.string().optional(),
    isBloodDonor: z.boolean().optional(),
    houseName: z.string(),
    buildingNo: z.string(),
    maritalStatus: z.string().optional(),
    employmentStatus: z.string(),
    spouse: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    address: z.string().optional(),
    image: z.string().optional(),
  });;