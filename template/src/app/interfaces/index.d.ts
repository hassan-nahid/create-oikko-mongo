import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../modules/user/user.interface";

declare global {
    namespace Express {
        interface User extends Partial<IUser>, JwtPayload { }
    }
}