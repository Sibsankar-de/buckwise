import { getUserById } from "@/lib/controllers/user.controller"
import { withDbAndCors } from "@/lib/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/lib/utils/middlewareControll";
import { verifyAuth } from "@/lib/middlewares/auth.middleware";

export const GET = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth])
    return await getUserById(req, context);
}) 