const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        color: {
            type: String,
            default: "#6d5dfb"
        },

        icon: {
            type: String,
            default: "sparkles"
        },

        archived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

projectSchema.index({
    owner: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Project",
    projectSchema
);