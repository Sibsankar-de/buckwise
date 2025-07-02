import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/error-handler";
import OpenAI from "openai";
import { ApiResponse } from "../utils/response-handler";
import { Connection } from "../models/connection.model";
import { MiddlewareContext } from "../../../types/middleware";
import mongoose from "mongoose";
import { Due, Flag } from "../models/message.model";
import { User } from "../models/user.model";
import { formatDate } from "../utils/formatDate";
import { ConnectionRequest } from "../models/request.model";
import { createNotification } from "./notification.controller";


// create new flag
export const createFlag = async (roomId: mongoose.Types.ObjectId, message: string) => {
    try {
        if (!message || !roomId) throw new ApiError(400, "All fields are required");
        const flag = await Flag.create({
            roomId,
            content: {
                message
            }
        });

        if (!flag) throw new ApiError(402, "Unable to create flag");
        return flag;
    } catch (error) {
        throw new ApiError(402, "Failed to create flag");
    }
}

// configure openai
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_KEY
});

const SYSTEM_PROMPT = `
You are a payment information extraction agent.

Your task is to analyze a given message describing a payment transaction and extract structured data in strict JSON format.

Follow these instructions:

1. Extract the payment amount in Indian Rupees as a number (e.g., 150, 200).
2. Extract and process the "remarks" field:
   - If no remarks are present, return an empty string "".
   - If remarks exist but are unclear or ungrammatical, rewrite them in clear and correct English while preserving the original meaning.
   - Do not create or assume remarks if none are provided.
3. Identify who made the payment ("paidBy"):
   - Use "me" if the speaker made the payment.
   - Use "other" if someone else paid the speaker.
   - If the direction is unclear, default to "me".
   - Pay close attention to pronouns and payment direction.
   - The "paidBy" field is required.

Respond with only a valid JSON object in the following format:
{
  amount: <number>,
  paidBy: "me" | "other",
  remarks: "<string>"
}

Examples:

Input: "Paid 200 for pizza"  
Output: { "amount": 200, "paidBy": "me", "remarks": "I paid for the pizza" }

Input: "You gave me rupees 150 for lunch"  
Output: { "amount": 150, "paidBy": "other", "remarks": "You paid me for lunch" }

Input: "I will get 150 for shopping"  
Output: { "amount": 150, "paidBy": "me", "remarks": "I paid you for shopping" }

Input: "500"  
Output: { "amount": 500, "paidBy": "me", "remarks": "" }
`;

// create due
export const createDue = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { prompt, connectedUserId } = await req.json();
    const { userId } = context!;

    if (!prompt) throw new ApiError(400, "message is required");
    // check users
    const currentUser = await User.findById(userId);
    const connectedUser = await User.findById(connectedUserId);
    if (!currentUser || !connectedUser) throw new ApiError(400, "Invalid users");

    // get details from message
    const response = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: prompt
            },
        ],
        response_format: {
            type: 'json_schema',
            json_schema: {
                strict: true,
                name: "message",
                schema: {
                    type: Object,
                    properties: {
                        amount: {
                            type: Number,
                            description: 'Amount in rupees'
                        },
                        remarks: {
                            type: String,
                            description: "Remarks of payment"
                        },
                        paidBy: {
                            type: String,
                            description: "Amount paid by me or other",
                            enum: ['me', 'other']
                        }
                    }
                }
            }
        }
    });

    const data = JSON.parse(response.choices[0].message.content || "");
    console.log(data);

    if (data.ammount === null || data.ammount === 0 || data.amount === null) throw new ApiError(403, "Invalid message");


    // find room
    const room = await Connection.findOne({
        members: { $in: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(connectedUserId)] }
    })

    const roomId: mongoose.Types.ObjectId = room._id;
    if (!room) throw new ApiError(400, "Room not found. Create a request first");

    // set due users
    let dueToUser = currentUser, dueFromUser = connectedUser;
    if (data.paidBy === 'other') {
        dueToUser = connectedUser;
        dueFromUser = currentUser;
    }

    const due = await Due.create({
        roomId,
        createdBy: userId,
        dueTo: dueToUser._id,
        dueFrom: dueFromUser._id,
        content: {
            totalAmount: data.amount,
            dueAmount: data.amount,
            remarks: data.remarks,
            status: `Payment due to ${dueToUser.userName}`
        }
    });

    room.lastMessageId = due._id;
    room.save({ validateBeforeSave: false });

    return NextResponse.json(new ApiResponse(200, due, "due created"));

});

// update dues of the duTo user
export const updateDues = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { dueId } = await req.json();

    const due = await Due.findById(dueId);
    const dueToUser = await User.findById(due.dueTo);

    // get the previous dues of dueTo user
    const pendingDues = await Due.aggregate([
        {
            $match: {
                roomId: new mongoose.Types.ObjectId(due.roomId),
                _id: { $ne: new mongoose.Types.ObjectId(due._id) },
                dueFrom: new mongoose.Types.ObjectId(dueToUser._id),
                isDue: true,
                'content.dueAmount': { $lte: due.content.dueAmount }
            }
        },
        {
            $sort: {
                "createdAt": 1
            }
        }
    ]);


    // updates the dues
    let remainings = due.content.dueAmount;
    let i = 0;
    for (let pendingDue of pendingDues) {
        if (remainings <= 0) break;
        const dueAmount = pendingDue.content.dueAmount;
        if (dueAmount <= 0) continue;
        const updatedDueAmount = Math.max(dueAmount - remainings, 0);
        const updatedPaidAmount = Math.min(dueAmount, remainings) + pendingDue.content.paidAmount;
        console.log(updatedDueAmount, updatedPaidAmount);

        const updatedDue = await Due.findByIdAndUpdate(pendingDue._id, {
            'content.dueAmount': updatedDueAmount,
            'content.paidAmount': updatedPaidAmount,
            'content.status': ` ₹${Math.abs(dueAmount - updatedDueAmount)} paid from the due of ${formatDate(due.createdAt)}.`,
            isDue: !(updatedDueAmount === 0)
        }, { new: true });
        remainings -= dueAmount;

        // generates flag messages
        const flagMessage = updatedDueAmount === 0 ?
            `✅ A due of ₹${dueAmount}, created on ${formatDate(updatedDue.createdAt)} and due from ${dueToUser.userName}, has been cleared.`
            : `⏺️ An amount of ₹${updatedPaidAmount} has been paid toward the due of ₹${dueAmount}, created on ${formatDate(updatedDue.createdAt)} and due from ${dueToUser.userName}.`
        await createFlag(due.roomId, flagMessage);

        // send clearance flag if all dues cleared
        if (remainings >= 0 && i === pendingDues.length - 1) {
            await createFlag(due.roomId, `🎊 ${dueToUser.userName} has cleared all dues!`);
            break;
        };

        i++;
    };

    // update current due
    remainings = Math.max(remainings, 0);
    if (remainings !== due.content.dueAmount)
        await Due.findByIdAndUpdate(dueId, {
            'content.dueAmount': remainings,
            'content.paidAmount': due.content.totalAmount - remainings,
            'content.status': ` ₹${due.content.dueAmount - remainings} paid from the due of ${formatDate(due.createdAt)}.`,
            isDue: !(remainings === 0)
        }, { new: true });

    return NextResponse.json(new ApiResponse(200, {}, "Dues updated"));
});

// create connection list
export const getConnectionList = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const connectionList = await Connection.aggregate([
        {
            $match: {
                members: {
                    $in: [new mongoose.Types.ObjectId(userId)]
                }
            }
        },
        {
            // find the last message
            $lookup: {
                from: 'dues',
                foreignField: '_id',
                localField: 'lastMessageId',
                as: "lastMessage"
            }
        },
        {
            $addFields: {
                members: {
                    $filter: {
                        input: "$members",
                        as: "id",
                        cond: { $ne: ["$$id", new mongoose.Types.ObjectId(userId)] }
                    }
                }
            }
        },
        {
            // finds the connected user
            $lookup: {
                from: "users",
                localField: "members",
                foreignField: "_id",
                as: "connectedUser"
            }
        },
        {
            $unwind: {
                path: "$lastMessage",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: "$connectedUser"
        },
        {
            // find the total due from the current user
            $lookup: {
                from: 'dues',
                let: { roomId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$roomId", "$$roomId"] },
                                    { $eq: ["$dueFrom", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalDue: { $sum: "$content.dueAmount" }
                        }
                    }
                ],
                as: "dueList",
            }
        },
        {
            $addFields: {
                totalDue: {
                    $cond: [
                        { $gt: [{ $size: "$dueList" }, 0] },
                        { $arrayElemAt: ["$dueList.totalDue", 0] },
                        0
                    ]
                }
            }
        },
        {
            $sort: {
                'lastMessage.createdAt': -1
            }
        },
        {
            $project: {
                roomId: '$_id',
                connectedUser: {
                    _id: '$connectedUser._id',
                    userName: '$connectedUser.userName',
                    email: '$connectedUser.email',
                    avatar: '$connectedUser.avatar'
                },
                lastMessage: {
                    content: '$lastMessage.content',
                    createdAt: '$lastMessage.createdAt'
                },
                totalDue: 1
            }
        }
    ]);

    return NextResponse.json(new ApiResponse(200, connectionList, "connection list fetched"));
});

// create room messages
export const getRoomMessages = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined, param: { params: Record<string, string> } | undefined) => {
    const { searchParams } = new URL(req.url);
    const connectedUserId = searchParams.get('id')
    const { userId } = context!;
    if (!connectedUserId) throw new ApiError(400, "User id is required");
    const room = await Connection.findOne({ members: { $in: [userId, connectedUserId] } });

    const messageList = await Due.aggregate([
        {
            $match: {
                roomId: new mongoose.Types.ObjectId(room._id)
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { uid: '$createdBy' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$uid', '$_id']
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ],
                as: 'createdByUser'
            }
        },
        {
            $unwind: {
                path: "$createdByUser",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unionWith: {
                coll: 'flags',
                pipeline: [
                    {
                        $match: {
                            roomId: new mongoose.Types.ObjectId(room._id)
                        }
                    }
                ]
            }
        },
        {
            $sort: {
                createdAt: 1
            }
        }
    ]);

    // fetch the dues based on user
    const dueStatus = await Due.aggregate([
        {
            $match: {
                roomId: new mongoose.Types.ObjectId(room._id),
                dueFrom: {
                    $in: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(connectedUserId)]
                }
            }
        },
        {
            $group: {
                _id: '$dueFrom',
                totalDue: {
                    $sum: '$content.dueAmount'
                }
            }
        },
        {
            $match: {
                totalDue: { $ne: 0 }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user'
            }
        },
        {
            $project: {
                _id: 0,
                dueFromUser: {
                    _id: '$_id',
                    userName: '$user.userName'
                },
                totalDue: 1
            }
        },
    ]);



    return NextResponse.json(new ApiResponse(200, { messageList, dueStatus }, "Messages fetched"));
});