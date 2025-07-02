import { markAsReadNotification } from "@/lib/controllers/notification.controller";
import { withDbAndCors } from "@/lib/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/lib/utils/middlewareControll";
import { verifyAuth } from "@/lib/middlewares/auth.middleware";

export const PATCH = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth]);
    return await markAsReadNotification(req, context);
})