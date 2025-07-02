import { NextRequest } from "next/server";
import { Middleware, MiddlewareContext } from "../../../types/middleware";
import { ApiError } from "../utils/error-handler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyAuth = async (req: NextRequest, context: MiddlewareContext): Promise<MiddlewareContext> => {
    try {
        const token = req.cookies.get('accessToken')?.value;
        if (!token) throw new ApiError(400, "Invalid request");

        const verifiedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!verifiedToken || typeof verifiedToken !== 'object' || !('_id' in verifiedToken)) {
            throw new ApiError(401, "Token expired");
        }

        const user = await User.findById((verifiedToken as jwt.JwtPayload))
        if (!user) throw new ApiError(402, "Invalid user");

        return { ...context, userId: user._id }
    } catch (error) {
        throw new ApiError(401, "Unauthorised request");
    }

}