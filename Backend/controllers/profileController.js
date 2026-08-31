const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Usage = require("../models/Usage");
const Project = require("../models/Project");
const Generation = require("../models/Generation");

const buildProfile = async (user) => {
    const [
        usage,
        projectsCreated,
        generationStats
    ] = await Promise.all([
        Usage.findOne({
            user: user._id
        }).lean(),

        Project.countDocuments({
            owner: user._id,
            archived: false
        }),

        Generation.aggregate([
            {
                $match: {
                    user: user._id
                }
            },
            {
                $group: {
                    _id: null,
                    generations: {
                        $sum: 1
                    },
                    tokensUsed: {
                        $sum: {
                            $ifNull: [
                                "$tokensUsed",
                                0
                            ]
                        }
                    }
                }
            }
        ])
    ]);

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        plan: user.plan,
        isActive: user.isActive,
        createdAt: user.createdAt,
        usage: {
            generations:
                usage?.generations ??
                generationStats[0]?.generations ??
                0,

            tokensUsed:
                usage?.tokensUsed ??
                generationStats[0]?.tokensUsed ??
                0,

            projectsCreated:
                projectsCreated,

            lastGenerationAt:
                usage?.lastGenerationAt ??
                null
        }
    };
};

const getProfile = async (req, res) => {
    const profile =
        await buildProfile(req.user);

    return res.status(200).json({
        success: true,
        data: profile
    });
};

const updateProfile = async (req, res) => {
    const {
        name,
        email,
        bio,
        avatar
    } = req.body;

    const user =
        await User.findById(
            req.user._id
        );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name cannot be empty."
            });
        }

        user.name = name.trim();
    }

    if (email !== undefined) {
        if (
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email cannot be empty."
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: normalizedEmail,
                _id: {
                    $ne: user._id
                }
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "Email is already in use."
            });
        }

        user.email =
            normalizedEmail;
    }

    if (bio !== undefined) {
        user.bio =
            typeof bio === "string"
                ? bio.trim().slice(0, 300)
                : "";
    }

    if (avatar !== undefined) {
        user.avatar =
            typeof avatar === "string"
                ? avatar.trim()
                : "";
    }

    await user.save();

    const profile =
        await buildProfile(user);

    return res.status(200).json({
        success: true,
        message:
            "Profile updated successfully.",
        data: profile
    });
};

const changePassword = async (req, res) => {
    const {
        currentPassword,
        newPassword
    } = req.body;

    if (
        !currentPassword ||
        !newPassword
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Current and new passwords are required."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message:
                "New password must contain at least 6 characters."
        });
    }

    const user =
        await User.findById(
            req.user._id
        ).select("+password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    const matches =
        await bcrypt.compare(
            currentPassword,
            user.password
        );

    if (!matches) {
        return res.status(401).json({
            success: false,
            message:
                "Current password is incorrect."
        });
    }

    user.password =
        newPassword;

    await user.save();

    return res.status(200).json({
        success: true,
        message:
            "Password changed successfully."
    });
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
