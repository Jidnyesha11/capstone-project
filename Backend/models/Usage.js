
const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        generations: {
            type: Number,
            default: 0,
            min: 0
        },

        tokensUsed: {
            type: Number,
            default: 0,
            min: 0
        },

        projectsCreated: {
            type: Number,
            default: 0,
            min: 0
        },

        lastGenerationAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Usage",
    usageSchema
);

