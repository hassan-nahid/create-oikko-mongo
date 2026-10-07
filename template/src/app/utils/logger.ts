import fs from "fs";
import path from "path";
import winston from "winston";
import { envVars } from "../config/env";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const isProduction = envVars.NODE_ENV === "production";

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        const stackText = stack ? `\n${stack}` : "";
        return `[${timestamp}] ${level}: ${message}${metaText}${stackText}`;
    }),
);

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",
    defaultMeta: { service: "example-name" },
    transports: [
        new winston.transports.Console({
            format: isProduction ? fileFormat : consoleFormat,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, "combined.log"),
            format: fileFormat,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            format: fileFormat,
        }),
    ],
});

export const requestLogger = (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
};

export const errorLogger = (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    if (error instanceof Error) {
        logger.error(message, {
            ...meta,
            name: error.name,
            stack: error.stack,
            message: error.message,
        });
        return;
    }

    logger.error(message, {
        ...meta,
        error,
    });
};