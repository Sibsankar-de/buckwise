import mongoose, { Schema, models } from "mongoose";

const dueSchema = new Schema(
    {
        roomId: {
            type: mongoose.Types.ObjectId,
            ref: "Connection",
            required: true
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        dueTo: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        dueFrom: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["due"],
            required: true,
            default: "due"
        },
        content: {
            totalAmount: {
                type: Number,
                required: true
            },
            dueAmount: {
                type: Number,
                required: true
            },
            paidAmount: {
                type: Number,
                required: true,
                default: 0
            },
            remarks: {
                type: String
            },
            status: {
                type: String,
                required: true
            }
        },
        isDue: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    { timestamps: true }
);


const falgSchema = new Schema({
    roomId: {
        type: mongoose.Types.ObjectId,
        ref: "Connection",
        required: true
    },
    type: {
        type: String,
        enum: ["flag"],
        required: true,
        default: "flag"
    },
    content: {
        message: {
            type: String,
            required: true
        }
    }
}, { timestamps: true })

// Setting dev mode
if (process.env.NODE_ENV === 'development' && (models.Due || models.Flag)) {
    delete models.Due;
    delete models.Flag;
}

const Due = models.Due || mongoose.model("Due", dueSchema);
const Flag = models.Flag || mongoose.model("Flag", falgSchema);

export {
    Due, Flag
}