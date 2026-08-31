
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

        type: {
            type: String,
            enum: [
                "blog",
                "marketing",
                "social",
                "email",
                "summary",
                "general"
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
            default: "nexa-mock-v1"
        },

        tokensUsed: {
            type: Number,
            default: 0,
            min: 0
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
