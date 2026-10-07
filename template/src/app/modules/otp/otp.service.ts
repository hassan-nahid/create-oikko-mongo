import crypto from "crypto"
import { sendEmail } from "../../utils/sendEmail"
import AppError from "../../errorHelpers/AppError"
import { User } from "../user/user.model"
import httpStatus from "http-status-codes"
import { logger } from "../../utils/logger"
import { redisClient } from "../../config/redis.config"
const OTP_EXPIRATION = 2 * 60

const generateOtp = (length = 6) => {
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    return otp
}

const sendOTP = async (email: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const resolvedName = name?.trim()

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
        logger.warn("OTP send rejected: user not found", { email: normalizedEmail })
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (user.isVerified) {
        logger.warn("OTP send rejected: user already verified", {
            userId: String(user._id),
            email: normalizedEmail,
        })
        throw new AppError(httpStatus.BAD_REQUEST, "Your account is already verified")
    }

    const otp = generateOtp()

    const redisKey = `otp:${normalizedEmail}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your Otp Code",
        templateName: "otp",
        templateData: {
            name: resolvedName || user.name,
            otp: otp
        }
    })

    logger.info("OTP sent successfully", {
        userId: String(user._id),
        email: normalizedEmail,
        expiresInSeconds: OTP_EXPIRATION,
    })

}

const verifyOTP = async (email: string, otp: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedOtp = otp.trim()

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
        logger.warn("OTP verify rejected: user not found", { email: normalizedEmail })
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (user.isVerified) {
        logger.warn("OTP verify rejected: user already verified", {
            userId: String(user._id),
            email: normalizedEmail,
        })
        throw new AppError(httpStatus.BAD_REQUEST, "Your account is already verified")
    }


    const redisKey = `otp:${normalizedEmail}`

    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        logger.warn("OTP verify rejected: otp expired or missing", {
            userId: String(user._id),
            email: normalizedEmail,
        })
        throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired. Please request a new one")
    }

    if (savedOtp !== normalizedOtp) {
        logger.warn("OTP verify rejected: invalid otp", {
            userId: String(user._id),
            email: normalizedEmail,
        })
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP. Please check and try again")
    }



    await Promise.all([
        User.updateOne({ email: normalizedEmail }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])

    logger.info("OTP verified successfully", {
        userId: String(user._id),
        email: normalizedEmail,
    })
}

export const OTPService = {
    sendOTP,
    verifyOTP
}