const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema(
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

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
            index: true
        },

        type: {
            type: String,
            enum: [
                "blog",
                "marketing",
                "social",
                "email",
                "summary",
                "general",
                "chat"
            ],
            default: "general"
        },

        prompt: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        result: {
            type: String,
            required: true
        },

        model: {
            type: String,
            default: "gemini-3.1-flash-lite"
        },

        responseId: {
            type: String,
            default: ""
        },

        inputTokens: {
            type: Number,
            default: 0
        },

        outputTokens: {
            type: Number,
            default: 0
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

module.exports = mongoose.model(
    "Generation",
    generationSchema
);