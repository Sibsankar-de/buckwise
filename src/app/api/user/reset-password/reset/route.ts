import { validateAndResetPassword } from "@/lib/controllers/user.controller";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    return await validateAndResetPassword(req);
} 