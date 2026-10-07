import { z } from "zod";

export const sendOtpZodSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        name: z
            .string({ message: "Name must be a string" })
            .trim()
            .min(1, "Name is required")
            .max(100, "Name cannot exceed 100 characters")
            .optional(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const verifyOtpZodSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z
            .string({ message: "OTP must be a string" })
            .trim()
            .regex(/^\d{6}$/, "OTP must be a valid 6-digit code"),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});
