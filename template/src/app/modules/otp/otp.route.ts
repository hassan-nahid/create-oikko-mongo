// src/modules/otp/otp.routes.ts
import express from "express";
import { OTPController } from "./otp.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { sendOtpZodSchema, verifyOtpZodSchema } from "./otp.validation";

const router = express.Router();

router.post("/send", validateRequest(sendOtpZodSchema), OTPController.sendOTP);
router.post("/verify", validateRequest(verifyOtpZodSchema), OTPController.verifyOTP);

export const OtpRoutes = router;