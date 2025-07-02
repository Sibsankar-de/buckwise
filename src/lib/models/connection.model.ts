import mongoose, { Schema, model, models } from "mongoose";

const connectionSchema = new Schema(
    {
        members: [
            { type: mongoose.Types.ObjectId, ref: "User", required: true }
        ],
        messageCount: {
            type: Number,
            default: 0
        },
        lastMessageId: {
            type: mongoose.Types.ObjectId,
            ref: 'Due'
        }
    },
    { timestamps: true }
);

if (process.env.NODE_ENV === 'development' && models.Connection) {
    delete models.Connection;
}

export const Connection = models.Connection || model('Connection', connectionSchema);