import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id");

const passwordSchema = z
    .string({ message: "Password must be string" })
    .trim()
    .min(1, { message: "Password is required" });

export const loginZodSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
        forceLogoutOthers: z.union([z.boolean(), z.string()]).optional(),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const forgotPasswordZodSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const changePasswordZodSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: passwordSchema,
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const setPasswordZodSchema = z.object({
    body: z.object({
        password: passwordSchema,
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});

export const resetPasswordZodSchema = z.object({
    body: z.object({
        id: objectIdSchema,
        token: z.string().min(1, "Token is required"),
        newPassword: passwordSchema,
    }),
    query: z.object({}).passthrough(),
    params: z.object({}).passthrough(),
});