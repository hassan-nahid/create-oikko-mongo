import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { connectRedis } from './app/config/redis.config';
let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);

        console.log("MongoDB connected successfully");

        await connectRedis();

        console.log("Redis connected successfully")

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on port ${envVars.PORT}`);
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}


startServer();

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Server Shutting Down...");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})
process.on("SIGINT", () => {
    console.log("SIGINT signal received. Server Shutting Down...");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection Detected. Server Shutting Down...", err);

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
})

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception Detected. Server Shutting Down...", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1);
})

