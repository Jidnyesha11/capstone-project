
const mongoose = require("mongoose");

const Project = require("../models/Project");
const Usage = require("../models/Usage");

const getProjects = async (
    req,
    res
) => {
    const projects =
        await Project.find({
            owner: req.user._id
        }).sort({
            createdAt: -1
        });

    return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
};

const getProjectById = async (
    req,
    res
) => {
    if (
        !mongoose.isValidObjectId(
            req.params.id
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID."
        });
    }

    const project =
        await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found."
        });
    }

    return res.status(200).json({
        success: true,
        data: project
    });
};

const createProject = async (
    req,
    res
) => {
    const {
        name,
        description,
        color
    } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({
            success: false,
            message:
                "Project name is required."
        });
    }

    const project =
        await Project.create({
            name: name.trim(),
            description:
                description?.trim() || "",
            color:
                color?.trim() ||
                "#111111",
            owner: req.user._id
        });

    await Usage.findOneAndUpdate(
        {
            user: req.user._id
        },
        {
            $inc: {
                projectsCreated: 1
            }
        },
        {
            upsert: true
        }
    );

    return res.status(201).json({
        success: true,
        message:
            "Project created successfully.",
        data: project
    });
};

const updateProject = async (
    req,
    res
) => {
    if (
        !mongoose.isValidObjectId(
            req.params.id
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID."
        });
    }

    const project =
        await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found."
        });
    }

    const {
        name,
        description,
        color,
        isArchived
    } = req.body;

    if (name !== undefined) {
        if (!name.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Project name cannot be empty."
            });
        }

        project.name =
            name.trim();
    }

    if (
        description !== undefined
    ) {
        project.description =
            description.trim();
    }

    if (color !== undefined) {
        project.color =
            color.trim();
    }

    if (
        isArchived !== undefined
    ) {
        project.isArchived =
            Boolean(isArchived);
    }

    await project.save();

    return res.status(200).json({
        success: true,
        message:
            "Project updated successfully.",
        data: project
    });
};

const deleteProject = async (
    req,
    res
) => {
    if (
        !mongoose.isValidObjectId(
            req.params.id
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID."
        });
    }

    const project =
        await Project.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found."
        });
    }

    await project.deleteOne();

    return res.status(200).json({
        success: true,
        message:
            "Project deleted successfully."
    });
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};

