import { loginUser } from "@/lib/controllers/user.controller"
import { withDbAndCors } from "@/lib/utils/withDbAndCors"
import { NextRequest } from "next/server"

export const POST = withDbAndCors(async (req: NextRequest) => {
    return await loginUser(req);
}) 