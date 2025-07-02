import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/error-handler";
import { ApiResponse } from "../utils/response-handler";
import { Connection } from "../models/connection.model";
import { MiddlewareContext } from "../../../types/middleware";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import { formatDate } from "../utils/formatDate";
import { ConnectionRequest } from "../models/request.model";
import { createNotification } from "./notification.controller";
import { createFlag } from "./connection.controller";


// create new connection request
export const createRequest = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { requestTo } = await req.json();

    // verify request
    const existedRequest = await ConnectionRequest.findOne({
        from: { $in: [userId, requestTo] },
        to: { $in: [userId, requestTo] },
        status: { $in: ['pending', 'accepted'] }
    })
    if (existedRequest) throw new ApiError(400, "Request already exists!");

    // create new request
    const user = await User.findById(userId);
    const request = await ConnectionRequest.create({
        from: userId,
        to: requestTo
    });

    if (!request) throw new ApiError(402, "Failed to create request");
    await createNotification({
        notifiedTo: requestTo,
        type: 'request',
        title: "New connection request alert",
        content: {
            message: `A connection request created by ${user.userName}. Accept if you want to connect otherwise reject it.`,
            action: ["Accept", "Reject"]
        }
    });

    return NextResponse.json(new ApiResponse(200, { requestId: request._id }, "Request created"));
});

// create new chat room
const createRoom = async (user1: mongoose.Types.ObjectId, user2: mongoose.Types.ObjectId) => {
    if (!user1 || !user2) throw new ApiError(400, "Users are required");
    try {
        const createdByUser = await User.findById(user1);
        const addedUser = await User.findById(user2);
        if (!createdByUser || !addedUser) throw new ApiError(400, "Invalid user ids");
        const room = await Connection.create({
            members: [user1, user2]
        });
        if (!room) throw new ApiError(402, "Failed to create room");
        await createFlag(room._id, `🎉 New connection opened`);
        await createFlag(room._id, `Connection started by ${createdByUser.userName} on ${formatDate(room.createdAt)}`);

        return room;
    } catch (error) {

    }
}

// update request
export const updateRequest = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { requestId, status } = await req.json();

    const request = await ConnectionRequest.findById(requestId);

    // reject invalid requests
    if (request.status !== 'pending') throw new ApiError(400, "Request can not be update");
    request.status = status;
    request.save({ validateBeforeSave: false });

    const requestToUser = await User.findById(request.to);
    const requestFromUser = await User.findById(request.from);

    if (status === 'rejected') {
        await createNotification({
            notifiedTo: request.from,
            title: "Request update",
            type: 'updates',
            content: {
                message: `Your connection request to ${requestToUser.userName} has been rejected`
            }
        })
    } else if (status === 'accepted') {
        await createNotification({
            notifiedTo: request.from,
            title: "Request update",
            type: 'updates',
            content: {
                message: `Your connection request to ${requestToUser.userName} has been accepted`
            }
        });

        // create new room if accepted
        const room = await createRoom(request.from, request.to);
        [request.from, request.to].forEach(async id => {
            await createNotification({
                notifiedTo: id,
                title: "New Connection Started",
                type: "updates",
                content: {
                    message: `🎉 New connection opened with ${id === request.to ? requestFromUser.userName : requestToUser.userName} at ${formatDate(room.createdAt)}`
                }
            })
        })
    }

    return NextResponse.json(new ApiResponse(200, {}, "Request updated"));
});

// delete request
export const removeRequest = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');
    await ConnectionRequest.findByIdAndDelete(requestId);

    return NextResponse.json(new ApiResponse(200, {}, "Request removed"));
})

// fetch list
export const getRequestList = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let matchField = filter === 'received' ? { status: 'pending', to: new mongoose.Types.ObjectId(userId) } : { status: 'pending', from: new mongoose.Types.ObjectId(userId) };

    const userIdField = filter === 'received' ? 'from' : 'to';
    const requestList = await ConnectionRequest.aggregate([
        {
            $match: matchField
        },
        {
            $lookup: {
                from: 'users',
                localField: userIdField,
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                _id: 1,
                to: 1,
                from: 1,
                userDetails: {
                    _id: "$user._id",
                    userName: "$user.userName",
                    email: "$user.email"
                },
                isChecked: 1,
                createdAt: 1
            }
        }
    ]);

    return NextResponse.json(new ApiResponse(200, requestList, "Requests fetched"));
});

// update request check
export const updateRequestCheckout = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    await ConnectionRequest.updateMany(
        {
            to: new mongoose.Types.ObjectId(userId),
            isChecked: false,
            status: 'pending'
        },
        {
            isChecked: true
        }
    );

    return NextResponse.json(new ApiResponse(200, {}, "Requests checked"));
})