import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";

const createUserService = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password as string, 10)
    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string
    };

    const user = await User.create({
        email,
        auths: [authProvider],
        password: hashedPassword,
        ...rest
    })

    return user;
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId)
        .select("-password")

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Format the response to include claimedRewards
    const userData = user.toObject();

    return {
        data: {
            ...userData
        }
    }
};

const getAllUsers = async (query: Record<string, string>) => {
    // Start with base query that excludes deleted users
    const baseQuery = User.find({ isDeleted: { $ne: true } });

    const queryBuilder = new QueryBuilder(baseQuery, query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build().select("-password"),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

export const UserServices = {
    createUserService,
    getAllUsers,
    getMe
}