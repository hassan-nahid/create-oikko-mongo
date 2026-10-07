import { Response } from "express";
import { envVars } from "../config/env";

export interface AuthTokens {
    accessToken?: string;
    refreshToken?: string;
}

const baseCookieOptions = {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: (envVars.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
};

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            ...baseCookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
        })
    }

    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
        })
    }
}

export const clearAuthCookie = (res: Response) => {
    res.clearCookie("accessToken", baseCookieOptions)
    res.clearCookie("refreshToken", baseCookieOptions)
}