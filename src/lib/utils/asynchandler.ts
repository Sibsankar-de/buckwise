import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/utils/error-handler';
import { MiddlewareContext } from '../../../types/middleware';

type Handler = (req: NextRequest, context?: MiddlewareContext) => Promise<NextResponse>;

export function asyncHandler(handler: Handler): Handler {
    return async (req: NextRequest, context?: MiddlewareContext) => {
        try {
            return await handler(req, context);
        } catch (error) {
            const err = error as ApiError;

            console.error('❌ Error:', err);

            return NextResponse.json(
                {
                    success: false,
                    message: err.message || "Internal Server Error",
                    errors: err.errors || [],
                },
                { status: err.statusCode || 500 }
            );
        }
    };
}
