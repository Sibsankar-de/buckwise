import mongoose from "mongoose"
import { ApiError } from "../utils/error-handler"
import { Notification } from "../models/notification.model";
import { asyncHandler } from "../utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { MiddlewareContext } from "../../../types/middleware";
import { ApiResponse } from "../utils/response-handler";

type NotificationType = {
    notifiedTo: mongoose.Types.ObjectId,
    type: string,
    title: string,
    content: Record<string, any>,
}

export const createNotification = async ({ notifiedTo, type, title, content }: NotificationType) => {
    try {
        if (!notifiedTo || !type || !content) return;
        await Notification.create({
            notifiedTo,
            type,
            title,
            content
        })
    } catch (error) {
        console.log(error);
    }
}

export const markAsReadNotification = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    await Notification.findByIdAndUpdate(notificationId, {
        isRead: true
    }, { new: true });

    return NextResponse.json(new ApiResponse(200, {}, "Notification marked"));
})

// fetch notifications
export const getNotificationList = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    const matchField = filter === 'unreads' ? { isRead: false } : {};
    const notificationList = await Notification.aggregate([
        {
            $match: {
                notifiedTo: new mongoose.Types.ObjectId(userId),
                ...matchField,
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return NextResponse.json(new ApiResponse(200, notificationList, "Notifications fetched"));
});