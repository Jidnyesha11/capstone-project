const mongoose = require("mongoose");

const Project = require("../models/Project");
const Usage = require("../models/Usage");

const ownershipFilter = (userId) => ({
    $or: [
        { owner: userId },
        { createdBy: userId }
    ]
});

const getProjects = async (req, res) => {
    try {
        const projects =
            await Project.find({
                ...ownershipFilter(
                    req.user._id
                ),
                archived: false
            })
                .sort({
                    createdAt: -1
                })
                .lean();

        return res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error(
            "GET PROJECTS:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load projects."
        });
    }
};

const getProjectById =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid project ID."
                });
            }

            const project =
                await Project.findOne({
                    _id: req.params.id,
                    ...ownershipFilter(
                        req.user._id
                    )
                });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found."
                });
            }

            return res.json({
                success: true,
                data: project
            });
        } catch (error) {
            console.error(
                "GET PROJECT:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load project."
            });
        }
    };

const createProject =
    async (req, res) => {
        try {
            const {
                name,
                description = "",
                color = "#705cf6",
                icon = "sparkles"
            } = req.body;

            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Project name is required."
                });
            }

            const project =
                await Project.create({
                    name:
                        name.trim().slice(
                            0,
                            100
                        ),

                    description:
                        typeof description ===
                        "string"
                            ? description
                                .trim()
                                .slice(
                                    0,
                                    500
                                )
                            : "",

                    owner:
                        req.user._id,

                    createdBy:
                        req.user._id,

                    color:
                        typeof color ===
                        "string"
                            ? color
                            : "#705cf6",

                    icon:
                        typeof icon ===
                        "string"
                            ? icon
                            : "sparkles"
                });

            await Usage.findOneAndUpdate(
                {
                    user: req.user._id
                },
                {
                    $setOnInsert: {
                        user:
                            req.user._id
                    },
                    $inc: {
                        projectsCreated: 1
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            return res.status(201).json({
                success: true,
                message:
                    "Project created successfully.",
                data: project
            });
        } catch (error) {
            console.error(
                "CREATE PROJECT:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create project."
            });
        }
    };

const updateProject =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid project ID."
                });
            }

            const project =
                await Project.findOne({
                    _id: req.params.id,
                    ...ownershipFilter(
                        req.user._id
                    )
                });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found."
                });
            }

            const {
                name,
                description,
                color,
                icon,
                archived
            } = req.body;

            if (
                name !== undefined
            ) {
                if (
                    typeof name !==
                        "string" ||
                    !name.trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Project name cannot be empty."
                    });
                }

                project.name =
                    name.trim().slice(
                        0,
                        100
                    );
            }

            if (
                description !==
                undefined
            ) {
                project.description =
                    typeof description ===
                    "string"
                        ? description
                            .trim()
                            .slice(
                                0,
                                500
                            )
                        : "";
            }

            if (
                typeof color ===
                "string"
            ) {
                project.color =
                    color;
            }

            if (
                typeof icon ===
                "string"
            ) {
                project.icon =
                    icon;
            }

            if (
                typeof archived ===
                "boolean"
            ) {
                project.archived =
                    archived;
            }

            await project.save();

            return res.json({
                success: true,
                data: project
            });
        } catch (error) {
            console.error(
                "UPDATE PROJECT:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to update project."
            });
        }
    };

const deleteProject =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid project ID."
                });
            }

            const project =
                await Project.findOneAndUpdate(
                    {
                        _id:
                            req.params.id,
                        ...ownershipFilter(
                            req.user._id
                        ),
                        archived: false
                    },
                    {
                        archived: true
                    },
                    {
                        new: true
                    }
                );

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found."
                });
            }

            return res.json({
                success: true,
                message:
                    "Project archived."
            });
        } catch (error) {
            console.error(
                "DELETE PROJECT:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to archive project."
            });
        }
    };

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};
