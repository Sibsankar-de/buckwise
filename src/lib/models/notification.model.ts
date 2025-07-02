import mongoose, { models, Schema } from "mongoose";

const notificationSchema = new Schema({
    notifiedTo: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'information'
    },
    content: {
        type: Object,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

if (process.env.NODE_ENV === 'development' && models.Notification) {
    delete models.Notification;
}

export const Notification = models.Notification || mongoose.model('Notification', notificationSchema);