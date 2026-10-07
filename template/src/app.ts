import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./app/config/passport";
import { router } from "./app/routes";
import expressSession from "express-session"

import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { envVars } from "./app/config/env";

const app = express();

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("trust proxy", 1)
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Server is running"
    })
})

app.use(globalErrorHandler)

app.use(notFound)

export default app;
