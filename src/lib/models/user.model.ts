import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    userName: string;
    email: string;
    password: string;
    avatar?: string;
    refreshToken?: string;
    authBy: "local" | "google";
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    checkPassword(password: string): Promise<boolean>;
    generatePasswordResetToken(): Promise<string>;
    getAccessToken(): Promise<string>;
    getRefreshToken(): Promise<string>;
}

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    refreshToken: {
        type: String
    },
    authBy: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.checkPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generatePasswordResetToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.PASSWORD_RESET_TOKEN_SECRET,
        {
            expiresIn: '1h'
        }
    )
}

userSchema.methods.getAccessToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.getRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// setting devmode
if (process.env.NODE_ENV === 'development' && models.User) {
    delete models.User;
}

export const User = models.User || mongoose.model<IUser>('User', userSchema);