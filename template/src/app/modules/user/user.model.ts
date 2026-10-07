import { model, Schema } from "mongoose";
import { IAuthProvider, IGender, IsActive, IUser, Role } from "./user.interface";


const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    timestamps: false,
    versionKey: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    photo: {
        type: String,
        default: null,
    },
    isDeleted: { type: Boolean },
    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE
    },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    gender: {
        type: String,
        enum: Object.values(IGender),
        default: null,
    },
    auths: [authProviderSchema]
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema)