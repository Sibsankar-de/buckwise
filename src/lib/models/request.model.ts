import mongoose, { models, Schema } from "mongoose";

const ConnectionRequestSchema = new Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    isChecked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

if (process.env.NODE_ENV === 'development' && models.ConnectionRequest) {
    delete models.ConnectionRequest;
}

export const ConnectionRequest = models.ConnectionRequest || mongoose.model('ConnectionRequest', ConnectionRequestSchema);