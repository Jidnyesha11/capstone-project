
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Usage = require("../models/Usage");

const createToken = (
    userId
) => {
    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const sanitizeUser = (
    user
) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    plan: user.plan,
    isActive: user.isActive,
    createdAt: user.createdAt
});

const register = async (
    req,
    res
) => {
    const {
        name,
        email,
        password
    } = req.body;

    if (
        !name ||
        !email ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Name, email, and password are required."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message:
                "Password must contain at least 6 characters."
        });
    }

    const normalizedEmail =
        email.toLowerCase().trim();

    const existingUser =
        await User.findOne({
            email: normalizedEmail
        });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message:
                "An account with this email already exists."
        });
    }

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password
    });

    await Usage.create({
        user: user._id
    });

    const token =
        createToken(user._id);

    return res.status(201).json({
        success: true,
        message:
            "Account created successfully.",
        token,
        user: sanitizeUser(user)
    });
};

const login = async (
    req,
    res
) => {
    const {
        email,
        password
    } = req.body;

    if (
        !email ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Email and password are required."
        });
    }

    const user =
        await User.findOne({
            email:
                email.toLowerCase().trim()
        }).select("+password");

    if (!user) {
        return res.status(401).json({
            success: false,
            message:
                "Invalid email or password."
        });
    }

    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message:
                "Your account is disabled."
        });
    }

    const passwordMatches =
        await user.comparePassword(
            password
        );

    if (!passwordMatches) {
        return res.status(401).json({
            success: false,
            message:
                "Invalid email or password."
        });
    }

    const token =
        createToken(user._id);

    return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: sanitizeUser(user)
    });
};

const getCurrentUser = async (
    req,
    res
) => {
    return res.status(200).json({
        success: true,
        user: sanitizeUser(
            req.user
        )
    });
};

module.exports = {
    register,
    login,
    getCurrentUser
};