import axios from "axios"
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

export const checkAuth = async () => {
    let isAuthenticated = false;
    try {
        const token = (await cookies()).get('accessToken')?.value;
        if (!token) return;
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decodeToken) isAuthenticated = true;
    } catch (error) {
        isAuthenticated = false;
    }

    return isAuthenticated;
}