
const mongoose = require("mongoose");

const Generation =
    require("../models/Generation");

const Project =
    require("../models/Project");

const Usage =
    require("../models/Usage");

const {
    generateMockContent
} = require("../services/aiService");

const getGenerations = async (
    req,
    res
) => {
    const {
        project,
        type,
        search,
        page = 1,
        limit = 10
    } = req.query;

    const currentPage =
        Math.max(
            Number(page) || 1,
            1
        );

    const pageLimit =
        Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            50
        );

    const filter = {
        user: req.user._id
    };

    if (
        project &&
        mongoose.isValidObjectId(project)
    ) {
        filter.project = project;
    }

    if (type) {
        filter.type = type;
    }

    if (search?.trim()) {
        filter.$or = [
            {
                prompt: {
                    $regex:
                        search.trim(),
                    $options: "i"
                }
            },
            {
                result: {
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
        generations,
        total
    ] = await Promise.all([
        Generation.find(filter)
            .populate(
                "project",
                "name color"
            )
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(pageLimit),

        Generation.countDocuments(
            filter
        )
    ]);

    return res.status(200).json({
        success: true,
        data: generations,
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

const createGeneration =
    async (req, res) => {
        const {
            projectId,
            type = "general",
            prompt
        } = req.body;

        if (
            !projectId ||
            !mongoose.isValidObjectId(
                projectId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid projectId is required."
            });
        }

        if (!prompt?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Prompt is required."
            });
        }

        if (prompt.trim().length > 5000) {
            return res.status(400).json({
                success: false,
                message:
                    "Prompt cannot exceed 5000 characters."
            });
        }

        const project =
            await Project.findOne({
                _id: projectId,
                owner: req.user._id
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found."
            });
        }

        const result =
            generateMockContent({
                type,
                prompt,
                userName:
                    req.user.name
            });

        const tokensUsed =
            Math.ceil(
                (
                    prompt.length +
                    result.length
                ) / 4
            );

        const generation =
            await Generation.create({
                user: req.user._id,
                project: project._id,
                type,
                prompt:
                    prompt.trim(),
                result,
                model:
                    "nexa-mock-v1",
                tokensUsed
            });

        await Usage.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                $inc: {
                    generations: 1,
                    tokensUsed
                },
                $set: {
                    lastGenerationAt:
                        new Date()
                }
            },
            {
                upsert: true
            }
        );

        const populatedGeneration =
            await generation.populate(
                "project",
                "name color"
            );

        return res.status(201).json({
            success: true,
            message:
                "Content generated successfully.",
            data: populatedGeneration
        });
    };

const getGenerationById =
    async (req, res) => {
        if (
            !mongoose.isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid generation ID."
            });
        }

        const generation =
            await Generation.findOne({
                _id: req.params.id,
                user: req.user._id
            }).populate(
                "project",
                "name color"
            );

        if (!generation) {
            return res.status(404).json({
                success: false,
                message:
                    "Generation not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: generation
        });
    };

const deleteGeneration =
    async (req, res) => {
        if (
            !mongoose.isValidObjectId(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid generation ID."
            });
        }

        const generation =
            await Generation.findOne({
                _id: req.params.id,
                user: req.user._id
            });

        if (!generation) {
            return res.status(404).json({
                success: false,
                message:
                    "Generation not found."
            });
        }

        await generation.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "Generation deleted successfully."
        });
    };

module.exports = {
    getGenerations,
    createGeneration,
    getGenerationById,
    deleteGeneration
};

