import { NextFunction, Request, Response } from "express";
import { requestLogger } from "../utils/logger";

export const logHttpRequests = (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        requestLogger("HTTP request", {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        });
    });

    next();
};