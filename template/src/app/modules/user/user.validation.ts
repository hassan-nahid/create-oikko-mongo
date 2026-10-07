import z from "zod";
import { IsActive, Role } from "./user.interface";
export const createUserZodSchema = z.object({
    body: z.object({
        name: z
            .string({
                // Zod v4 uses a unified error callback
                error: () => ({ message: "Name must be string" })
            })
            .trim()
            .min(2, { message: "Name must be at least 2 characters long." })
            .max(50, { message: "Name cannot exceed 50 characters." }),

        email: z
            .string({
                error: () => ({ message: "Email must be string" })
            })
            .trim()
            .email({ message: "Invalid email address format." })
            .min(5, { message: "Email must be at least 5 characters long." })
            .max(100, { message: "Email cannot exceed 100 characters." }),

        password: z
            .string({
                error: () => ({ message: "Password must be string" })
            })
            .min(8, { message: "Password must be at least 8 characters long." })
            .regex(/^(?=.*[A-Z])/, {
                message: "Password must contain at least 1 uppercase letter.",
            })
            .regex(/^(?=.*[!@#$%^&*])/, {
                message: "Password must contain at least 1 special character.",
            })
            .regex(/^(?=.*\d)/, {
                message: "Password must contain at least 1 number.",
            }),
    }),
    query: z.object({}).passthrough().optional(),
    params: z.object({}).passthrough().optional(),
});

export const updateUserZodSchema = z.object({
    body: z.object({
        name: z
            .string({
                // Zod v4 uses a unified error callback
                error: () => ({ message: "Name must be string" })
            })
            .trim()
            .min(2, { message: "Name must be at least 2 characters long." })
            .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
        password: z
            .string({
                error: () => ({ message: "Password must be string" })
            })
            .min(8, { message: "Password must be at least 8 characters long." })
            .regex(/^(?=.*[A-Z])/, {
                message: "Password must contain at least 1 uppercase letter.",
            })
            .regex(/^(?=.*[!@#$%^&*])/, {
                message: "Password must contain at least 1 special character.",
            })
            .regex(/^(?=.*\d)/, {
                message: "Password must contain at least 1 number.",
            }).optional(),
        role: z.enum(Object.values(Role) as [string]).optional(),
        IsActive: z.enum(Object.values(IsActive) as [string]).optional(),
        isDeleted: z.boolean({
            error: () => ({ message: "isDeleted must be boolean" })
        }).optional(),
        isVerified: z.boolean({
            error: () => ({ message: "isVerified must be boolean" })
        }).optional(),
    }),
    query: z.object({}).passthrough().optional(),
    params: z.object({}).passthrough().optional(),
});