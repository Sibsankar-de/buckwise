import { updateAvatar } from "@/lib/controllers/user.controller"
import { withDbAndCors } from "@/lib/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/lib/utils/middlewareControll";
import { verifyAuth } from "@/lib/middlewares/auth.middleware";
import { fileHandle } from "@/lib/middlewares/fileHandle.middleware";

export const PATCH = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth, fileHandle])
    return await updateAvatar(req, context);
}) 