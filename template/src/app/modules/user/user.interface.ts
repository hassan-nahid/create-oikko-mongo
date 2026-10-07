import mongoose from "mongoose";

export enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

export enum IGender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other",
}

export enum IsActive {
    ACTIVE = "active",
    INACTIVE = "inactive",
    BLOCKED = "blocked",
    DELETED = "deleted"
}


export interface IAuthProvider {
    provider: "google" | "credentials";
    providerId: string;
}

export interface IUser {
    _id?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    photo: string | null;
    gender: IGender | null;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    role: Role;
    auths: IAuthProvider[];

}