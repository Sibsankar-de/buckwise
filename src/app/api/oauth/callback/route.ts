import { registerOrLoginUser } from "@/lib/controllers/oAuth.controller"
import { withDbAndCors } from "@/lib/utils/withDbAndCors"
import { NextRequest } from "next/server"

export const GET = withDbAndCors(async (req: NextRequest) => {
    return await registerOrLoginUser(req);
})