const mongoose = require("mongoose");

const getCurrentPeriodStart = () =>
    new Date(
        Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            1
        )
    );

const usageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        periodStart: {
            type: Date,
            default: getCurrentPeriodStart,
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

        tokensReserved: {
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
