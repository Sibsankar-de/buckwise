import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/error-handler";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/response-handler";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken"
import { MiddlewareContext } from "../../../types/middleware";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/coludinary-upload";
import { Notification } from "../models/notification.model";
import { sendMail } from "../utils/send-mail";


// create user
export const createUser = asyncHandler(async (req: NextRequest) => {
    const body = await req.json();
    const { userName, email, password } = body;

    if ([userName, email, password].some(e => e === '')) throw new ApiError(400, "All fields are required");

    const existedUser = await User.findOne({ email });
    if (existedUser) throw new ApiError(402, "User already exist");

    const newUser = await User.create({
        userName,
        email,
        password,
        authBy: 'local'
    })

    if (!newUser) throw new ApiError(401, "Failed to create user");

    return NextResponse.json(new ApiResponse(200, {}, "User created"))
});

// generate tokens
export const generateAccessAndRefrehToken = async (userId: mongoose.Types.ObjectId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(401, "User not found");
        const accessToken = await user.getAccessToken();
        const refreshToken = await user.getRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Internal error on generating tokens");
    }
}

// cookie options
const expiresDate = new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000);
export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
    expires: expiresDate
}

// log in
export const loginUser = asyncHandler(async (req: NextRequest) => {
    const { email, password } = await req.json();

    if ([email, password].some(e => e === '')) throw new ApiError(400, "All fields are required");

    // check email
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(402, "User not exist");

    // check password
    const isPasswordOk = await user.checkPassword(password);
    if (!isPasswordOk) throw new ApiError(401, "Invalid password");

    const { accessToken, refreshToken } = await generateAccessAndRefrehToken(user?._id);


    (await cookies()).set('accessToken', accessToken, cookieOptions);
    (await cookies()).set('refreshToken', refreshToken, cookieOptions);

    return NextResponse.json(new ApiResponse(200, {}, "User logged in"))

})

// logout user
export const logoutUser = asyncHandler(async (req: NextRequest) => {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) throw new ApiError(400, "Invalid request");

    const verifiedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!verifiedToken || typeof verifiedToken !== 'object' || !('_id' in verifiedToken)) {
        throw new ApiError(401, "Unauthorised request");
    }

    const user = await User.findByIdAndUpdate((verifiedToken as jwt.JwtPayload)._id, {
        refreshtoken: ''
    }, { new: true });

    (await cookies()).delete('accessToken');
    (await cookies()).delete('refreshToken');

    return NextResponse.json(new ApiResponse(200, {}, "User logged out"));
})

// check for auth
export const checkAuth = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    let isAuthenticated = false;
    if (userId) isAuthenticated = true;

    return NextResponse.json(new ApiResponse(200, { isAuthenticated }, "authentication checked"));
})

// update user
export const updateUser = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { email, userName } = await req.json();
    if (!email || !userName) throw new ApiError(402, "All fields are required");

    // check for new email 
    const user = await User.findById(userId);
    if (email !== user.email) {
        const userByNewEmail = await User.findOne({ email });
        if (userByNewEmail) throw new ApiError(402, "Email is already in use");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
        userName,
        email
    }, { new: true }).select("-password -refreshToken");

    return NextResponse.json(new ApiResponse(200, updatedUser, "User details updated"));
})

// update password
export const updatePassword = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) throw new ApiError(400, "All fields are required");

    const user = await User.findById(userId);

    if (!user) throw new ApiError(400, "User not found");

    // check current password
    const isPasswordOk = await user.checkPassword(currentPassword);
    if (!isPasswordOk) throw new ApiError(402, "Invalid current password");

    user.password = newPassword
    user.save({ validateBeforeSave: false });


    return NextResponse.json(new ApiResponse(200, "Password updated"));
})

// update avatar
export const updateAvatar = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId, files } = context!;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(400, "User not found");

    const image = files?.avatar;
    if (!image) throw new ApiError(400, "Avatar file is required");

    const buffer = Buffer.from(await image.arrayBuffer());

    const uploadData = await uploadToCloudinary(buffer, image.name);
    if (!uploadData) throw new ApiError(402, "Failed to upload avatar");

    if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
    }

    user.avatar = uploadData.url;
    user.save({ validateBeforeSave: false });

    return NextResponse.json(new ApiResponse(200, user, "Avatar updated"));
})

// reset password
export const genearteResetPasswordToken = asyncHandler(async (req: NextRequest) => {
    const { email } = await req.json();
    const user = await User.findOne({ email });

    if (!user) throw new ApiError(402, "User not found");

    const token = await user.generatePasswordResetToken();
    if (!token) throw new ApiError(401, "Unable to get token");

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 32px 24px; background: #fafbfc;">
      <h2 style="color: #1a202c; margin-bottom: 16px;">Reset your Buckwise password</h2>
      <p style="color: #333; margin-bottom: 24px;">
        We received a request to reset your Buckwise account password. Click the button below to set a new password. This link will expire in <b>1 hour</b>.
      </p>
      <a href="${process.env.CORS_ORIGIN}/update-password/reset?token=${token}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
        Reset Password
      </a>
      <p style="color: #555; margin-top: 24px;">
        Or copy and paste this link into your browser:<br>
        <a href="${process.env.CORS_ORIGIN}/update-password/reset?token=${token}" style="color: #2563eb;">
          ${process.env.CORS_ORIGIN}/update-password/reset?token=${token}
        </a>
      </p>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;">
      <div style="color: #aaa; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} Buckwise
      </div>
    </div>
    `
    await sendMail({
        subject: "Reset your Buckwise password",
        sendTo: email,
        html: emailHtml
    });

    return NextResponse.json(new ApiResponse(200, {}, "Email send successfully"));
});

export const validateAndResetPassword = asyncHandler(async (req: NextRequest) => {
    const { token, password } = await req.json();

    if (!token || !password) throw new ApiError(400, "Token is required");

    const decodedToken = await jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET);

    if (!decodedToken) throw new ApiError(401, "Invalid token");

    const user = await User.findById(decodedToken as JwtPayload);

    if (!user) throw new ApiError(402, "Token Expired");

    user.password = password;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json(new ApiResponse(200, {}, "Password reset successfully"));
});

// queries
export const getUserById = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id')

    if (!userId) throw new ApiError(400, "userid is required");

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) throw new ApiError(402, "User not found");

    return NextResponse.json(new ApiResponse(200, user, "User fetched"));
})

// fetch current user
export const getCurrentUser = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) if (!user) throw new ApiError(402, "User not authorised");

    // get unread notification counts
    const notificationCounts = await Notification.aggregate([
        {
            $match: {
                notifiedTo: new mongoose.Types.ObjectId(user._id),
                isRead: false
            }
        },
        {
            $count: "counts"
        },
        {
            $project: {
                counts: 1
            }
        }
    ]);

    let unreadNotifications = 0;
    if (notificationCounts.length > 0)
        unreadNotifications = notificationCounts[0].counts;

    // Convert user to a plain object to add unreadNotifications
    const userObj = user.toObject();
    userObj.unreadNotifications = unreadNotifications;

    return NextResponse.json(new ApiResponse(200, userObj, "User fetched"));
});

// get all users list
export const getUsersList = asyncHandler(async (req: NextRequest, context: MiddlewareContext | undefined) => {
    const { userId } = context!;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const userList = await User.aggregate([
        {
            $match: {
                _id: { $ne: userIdObj }
            }
        },
        {
            // checks if there any connection exists 
            $lookup: {
                from: 'connections',
                let: { otherUserId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [userIdObj, "$members"]
                            }
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $in: ["$$otherUserId", "$members"]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: "existingConnection"
            }
        },
        {
            $match: {
                "existingConnection": { $size: 0 }
            }
        },
        {
            $lookup: {
                from: 'connectionrequests',
                let: { crUserId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$from", userIdObj] },
                                    { $eq: ["$to", "$$crUserId"] }
                                ]
                            }
                        }
                    },
                    { $limit: 1 }
                ],
                as: "connectionRequest"
            }
        },
        {
            $addFields: {
                connectionRequest: { $arrayElemAt: ["$connectionRequest", 0] }
            }
        },
        {
            $project: {
                _id: 1,
                userName: 1,
                email: 1,
                avatar: 1,
                request: {
                    id: '$connectionRequest._id',
                    status: '$connectionRequest.status'
                }
            }
        }
    ]);


    return NextResponse.json(new ApiResponse(200, userList, "User fetched"));
});