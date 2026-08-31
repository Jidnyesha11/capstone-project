
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        avatar: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            maxlength: 300
        },

        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre(
    "save",
    async function (next) {
        if (!this.isModified("password")) {
            return next();
        }

        this.password = await bcrypt.hash(
            this.password,
            12
        );

        next();
    }
);

userSchema.methods.comparePassword =
    async function (candidatePassword) {
        return bcrypt.compare(
            candidatePassword,
            this.password
        );
    };

module.exports = mongoose.model(
    "User",
    userSchema
);
