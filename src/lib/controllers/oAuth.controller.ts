import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asynchandler";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "../utils/error-handler";
import { User } from "../models/user.model";
import { cookieOptions, generateAccessAndRefrehToken } from "./user.controller";
import { cookies } from "next/headers";
import { ApiResponse } from "../utils/response-handler";

const client_secret = process.env.OAUTH_CLIENT_SECRET
const client_id = process.env.OAUTH_CLIENT_ID
const redirectUri = `${process.env.OAUTH_CLIENT_ORIGIN}/api/oauth/callback`;

const oAuth2Client = new OAuth2Client(client_id, client_secret, redirectUri);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

export const authenticateUser = asyncHandler(async (req: NextRequest) => {
    const authorisedUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes
    })

    return NextResponse.redirect(authorisedUrl);
});

export const registerOrLoginUser = asyncHandler(async (req: NextRequest) => {
    const searchParams = new URL(req.url).searchParams;
    const code = searchParams.get('code');

    if (!code) throw new ApiError(400, 'Missing code');

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const userinfoResponse = await oAuth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });

    const userinfo = userinfoResponse.data as GoogleUserInfo;

    if (!userinfo) throw new ApiError(500, "Unable to get user");

    // generates random password
    const genPass = (l = 12) => [...'aA0!'].map((c, i) => c[Math.random() * c.length | 0])
        .concat([...Array(l - 4)].map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'[Math.random() * 68 | 0]))
        .sort(() => Math.random() - .5).join('');
    const password = genPass();

    // create user or find existed user;
    let user = await User.findOne({ email: userinfo.email });

    if (!user) {
        user = await User.create({
            userName: userinfo.name,
            email: userinfo.email,
            authBy: 'google',
            password
        })
    };

    if (!user) throw new ApiError(402, "Google log in failed");

    // login user
    const { accessToken, refreshToken } = await generateAccessAndRefrehToken(user._id);
    (await cookies()).set('accessToken', accessToken, cookieOptions);
    (await cookies()).set('refreshToken', refreshToken, cookieOptions);

    return NextResponse.redirect(`${process.env.OAUTH_CLIENT_ORIGIN}`)
})