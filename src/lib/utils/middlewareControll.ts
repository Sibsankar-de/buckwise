import { NextRequest } from "next/server";
import { Middleware, MiddlewareContext } from "../../../types/middleware";

export async function runMiddlewares(req: NextRequest, middlewares: Middleware[]): Promise<MiddlewareContext> {
    let context: MiddlewareContext = {};

    for (const middleware of middlewares) {
        context = await middleware(req, context);
    }

    return context;
}