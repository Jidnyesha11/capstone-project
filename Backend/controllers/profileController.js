
const bcrypt = require("bcryptjs");

const User =
    require("../models/User");

const Usage =
    require("../models/Usage");

const getProfile = async (
    req,
    res
) => {
    const usage =
        await Usage.findOne({
            user: req.user._id
        });

    return res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar,
            bio: req.user.bio,
            plan: req.user.plan,
            createdAt:
                req.user.createdAt,
            usage: usage || {
                generations: 0,
                tokensUsed: 0,
                projectsCreated: 0,
                lastGenerationAt:
                    null
            }
        }
    });
};

const updateProfile = async (
    req,
    res
) => {
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
            message:
                "User not found."
        });
    }

    if (name !== undefined) {
        if (!name.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Name cannot be empty."
            });
        }

        user.name =
            name.trim();
    }

    if (email !== undefined) {
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
            bio.trim();
    }

    if (avatar !== undefined) {
        user.avatar =
            avatar.trim();
    }

    await user.save();

    return res.status(200).json({
        success: true,
        message:
            "Profile updated successfully.",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            plan: user.plan
        }
    });
};

const changePassword =
    async (req, res) => {
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
