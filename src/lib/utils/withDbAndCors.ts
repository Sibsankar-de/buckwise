import { connectMongo } from '@/lib/db/connect-mongo';
import { corsHeaders } from '@/lib/utils/corsHeaders';
import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (req: NextRequest, param?: { params: Record<string, string> }) => Promise<NextResponse>;

export const withDbAndCors = (handler: RouteHandler): RouteHandler => {
    return async (req: NextRequest, param?: { params: Record<string, string> }) => {
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, { status: 204, headers: corsHeaders });
        }

        await connectMongo();

        const response = await handler(req);
        corsHeaders && Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    };
};