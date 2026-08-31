const mongoose = require("mongoose");

const Conversation =
    require("../models/Conversation");

const Project =
    require("../models/Project");

const getOwnedProject =
    async (
        projectId,
        userId
    ) => {
        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {
            return null;
        }

        return Project.findOne({
            _id: projectId,

            $or: [
                {
                    owner: userId
                },
                {
                    createdBy: userId
                }
            ]
        });
    };

const listConversations =
    async (req, res) => {
        try {
            const filter = {
                user: req.user._id
            };

            if (
                req.query.projectId &&
                mongoose.Types.ObjectId.isValid(
                    req.query.projectId
                )
            ) {
                filter.project =
                    req.query.projectId;
            }

            const conversations =
                await Conversation.find(
                    filter
                )
                    .populate(
                        "project",
                        "name"
                    )
                    .sort({
                        lastMessageAt:
                            -1
                    })
                    .lean();

            return res.json({
                success: true,
                data: conversations
            });
        } catch (error) {
            console.error(
                "LIST CONVERSATIONS:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load conversations."
            });
        }
    };

const getConversation =
    async (req, res) => {
        try {
            const conversation =
                await Conversation.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                }).populate(
                    "project",
                    "name"
                );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Conversation not found."
                });
            }

            return res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error(
                "GET CONVERSATION:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load conversation."
            });
        }
    };

const createConversation =
    async (req, res) => {
        try {
            const {
                projectId,
                title = "New conversation"
            } = req.body;

            const project =
                await getOwnedProject(
                    projectId,
                    req.user._id
                );

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found."
                });
            }

            const conversation =
                await Conversation.create({
                    user:
                        req.user._id,

                    project:
                        project._id,

                    title:
                        title.trim() ||
                        "New conversation",

                    messages: []
                });

            return res.status(201).json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error(
                "CREATE CONVERSATION:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create conversation."
            });
        }
    };

const deleteConversation =
    async (req, res) => {
        try {
            const conversation =
                await Conversation.findOneAndDelete(
                    {
                        _id:
                            req.params.id,

                        user:
                            req.user._id
                    }
                );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Conversation not found."
                });
            }

            return res.json({
                success: true,
                message:
                    "Conversation deleted."
            });
        } catch (error) {
            console.error(
                "DELETE CONVERSATION:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete conversation."
            });
        }
    };

module.exports = {
    listConversations,
    getConversation,
    createConversation,
    deleteConversation,
    getOwnedProject
};