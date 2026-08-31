
const User =
    require("../models/User");

const Project =
    require("../models/Project");

const Generation =
    require("../models/Generation");

const Usage =
    require("../models/Usage");

const getDashboard =
    async (req, res) => {
        const [
            totalUsers,
            activeUsers,
            totalProjects,
            totalGenerations,
            usage
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({
                isActive: true
            }),

            Project.countDocuments(),

            Generation.countDocuments(),

            Usage.aggregate([
                {
                    $group: {
                        _id: null,
                        generations: {
                            $sum:
                                "$generations"
                        },
                        tokensUsed: {
                            $sum:
                                "$tokensUsed"
                        },
                        projectsCreated: {
                            $sum:
                                "$projectsCreated"
                        }
                    }
                }
            ])
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalProjects,
                totalGenerations,
                totalTokensUsed:
                    usage[0]
                        ?.tokensUsed || 0,
                totalProjectsCreated:
                    usage[0]
                        ?.projectsCreated || 0
            }
        });
    };

const getUsers = async (
    req,
    res
) => {
    const {
        search,
        role,
        page = 1,
        limit = 20
    } = req.query;

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );

    const filter = {};

    if (role) {
        filter.role = role;
    }

    if (search?.trim()) {
        filter.$or = [
            {
                name: {
                    $regex:
                        search.trim(),
                    $options: "i"
                }
            },
            {
                email: {
                    $regex:
                        search.trim(),
                    $options: "i"
                }
            }
        ];
    }

    const skip =
        (currentPage - 1) *
        pageLimit;

    const [
        users,
        total
    ] = await Promise.all([
        User.find(filter)
            .select(
                "-password"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(pageLimit),

        User.countDocuments(filter)
    ]);

    return res.status(200).json({
        success: true,
        data: users,
        pagination: {
            page: currentPage,
            limit: pageLimit,
            total,
            totalPages:
                Math.ceil(
                    total /
                        pageLimit
                )
        }
    });
};

const updateUserRole =
    async (req, res) => {
        const {
            role
        } = req.body;

        if (
            !["user", "admin"].includes(
                role
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Role must be user or admin."
            });
        }

        if (
            req.params.id ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot change your own role."
            });
        }

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        user.role = role;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "User role updated successfully.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    };

const updateUserStatus =
    async (req, res) => {
        if (
            req.params.id ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot disable your own account."
            });
        }

        const {
            isActive
        } = req.body;

        if (
            typeof isActive !==
            "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "isActive must be a boolean."
            });
        }

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        user.isActive =
            isActive;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "User status updated successfully."
        });
    };

const deleteUser =
    async (req, res) => {
        if (
            req.params.id ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot delete your own account."
            });
        }

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        await Promise.all([
            User.findByIdAndDelete(
                req.params.id
            ),
            Project.deleteMany({
                owner:
                    req.params.id
            }),
            Generation.deleteMany({
                user:
                    req.params.id
            }),
            Usage.findOneAndDelete({
                user:
                    req.params.id
            })
        ]);

        return res.status(200).json({
            success: true,
            message:
                "User and associated data deleted successfully."
        });
    };

module.exports = {
    getDashboard,
    getUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser
};

