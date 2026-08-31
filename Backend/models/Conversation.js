const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        tokensUsed: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },

        title: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "New conversation"
        },

        messages: {
            type: [messageSchema],
            default: []
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.index({
    user: 1,
    project: 1,
    lastMessageAt: -1
});

module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);