const mongoose = require("mongoose");

const Generation =
    require("../models/Generation");

const Conversation =
    require("../models/Conversation");

const Project =
    require("../models/Project");

const {
    createStreamingResponse,
    generateContent
} = require("../services/aiService");

const {
    getUsageSnapshot,
    reserveGeneration,
    finalizeGeneration,
    releaseGeneration,
    UsageLimitError
} = require("../services/usageService");

const sendEvent = (
    res,
    event,
    data
) => {
    if (res.writableEnded) {
        return;
    }

    res.write(
        `event: ${event}\n`
    );

    res.write(
        `data: ${JSON.stringify(data)}\n\n`
    );
};

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
            ],

            archived: false
        });
    };

const getGenerations =
    async (req, res) => {
        try {
            const search =
                typeof req.query.search ===
                "string"
                    ? req.query.search.trim()
                    : "";

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

            if (search) {
                filter.$or = [
                    {
                        prompt: {
                            $regex:
                                search,
                            $options:
                                "i"
                        }
                    },
                    {
                        result: {
                            $regex:
                                search,
                            $options:
                                "i"
                        }
                    }
                ];
            }

            const generations =
                await Generation.find(
                    filter
                )
                    .populate(
                        "project",
                        "name"
                    )
                    .populate(
                        "conversation",
                        "title"
                    )
                    .sort({
                        createdAt: -1
                    })
                    .limit(100)
                    .lean();

            return res.json({
                success: true,
                data: generations
            });
        } catch (error) {
            console.error(
                "GET GENERATIONS:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load history."
            });
        }
    };

const getUsage =
    async (req, res) => {
        try {
            const usage =
                await getUsageSnapshot(
                    req.user._id,
                    req.user.plan
                );

            return res.json({
                success: true,
                data: usage
            });
        } catch (error) {
            console.error(
                "GET USAGE:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load usage."
            });
        }
    };

const createGeneration =
    async (req, res) => {
        let reservation = null;

        try {
            const {
                projectId,
                type = "general",
                prompt,
                conversationId
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
                        "Project not found or does not belong to you."
                });
            }

            let conversation =
                null;

            if (conversationId) {
                conversation =
                    await Conversation.findOne(
                        {
                            _id:
                                conversationId,

                            user:
                                req.user._id,

                            project:
                                project._id
                        }
                    );

                if (!conversation) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Conversation not found."
                    });
                }
            }

            reservation =
                await reserveGeneration({
                    userId:
                        req.user._id,

                    plan:
                        req.user.plan,

                    prompt:
                        prompt.trim()
                });

            const history =
                conversation
                    ? conversation.messages
                    : [];

            const result =
                await generateContent({
                    history,
                    prompt:
                        prompt.trim(),
                    type,
                    userName:
                        req.user.name,
                    maxOutputTokens:
                        reservation.maxOutputTokens
                });

            if (conversation) {
                conversation.messages.push({
                    role: "user",
                    content:
                        prompt.trim()
                });

                conversation.messages.push({
                    role: "assistant",
                    content:
                        result.text,
                    tokensUsed:
                        result.totalTokens
                });

                conversation.lastMessageAt =
                    new Date();

                if (
                    conversation.title ===
                    "New conversation"
                ) {
                    conversation.title =
                        prompt
                            .trim()
                            .slice(0, 80);
                }

                await conversation.save();
            }

            const generation =
                await Generation.create({
                    user:
                        req.user._id,

                    project:
                        project._id,

                    conversation:
                        conversation?._id ||
                        null,

                    type,

                    prompt:
                        prompt.trim(),

                    result:
                        result.text,

                    model:
                        result.model,

                    inputTokens:
                        result.inputTokens,

                    outputTokens:
                        result.outputTokens,

                    tokensUsed:
                        result.totalTokens
                });

            await finalizeGeneration({
                userId:
                    req.user._id,

                reservationTokens:
                    reservation.reservationTokens,

                actualTokens:
                    result.totalTokens
            });

            reservation = null;

            return res.status(201).json({
                success: true,

                data: {
                    generation,
                    result:
                        result.text
                }
            });
        } catch (error) {
            if (reservation) {
                await releaseGeneration({
                    userId:
                        req.user._id,

                    reservationTokens:
                        reservation.reservationTokens
                });
            }

            if (
                error instanceof
                UsageLimitError
            ) {
                return res.status(429).json({
                    success: false,
                    message:
                        error.message,
                    details:
                        error.details
                });
            }

            console.error(
                "CREATE GENERATION:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "AI generation failed."
            });
        }
    };

const streamGeneration =
    async (req, res) => {
        let reservation = null;

        let generatedText = "";

        let finalized = false;

        try {
            const {
                projectId,
                type = "chat",
                prompt,
                conversationId
            } = req.body;

            if (
                !projectId ||
                !prompt?.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Project and prompt are required."
                });
            }

            const project =
                await getOwnedProject(
                    projectId,
                    req.user._id
                );

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found or does not belong to you."
                });
            }

            let conversation =
                null;

            if (conversationId) {
                conversation =
                    await Conversation.findOne(
                        {
                            _id:
                                conversationId,

                            user:
                                req.user._id,

                            project:
                                project._id
                        }
                    );
            }

            if (!conversation) {
                conversation =
                    await Conversation.create({
                        user:
                            req.user._id,

                        project:
                            project._id,

                        title:
                            prompt
                                .trim()
                                .slice(0, 80),

                        messages: []
                    });
            }

            const history =
                conversation.messages.map(
                    (message) => ({
                        role:
                            message.role,

                        content:
                            message.content
                    })
                );

            reservation =
                await reserveGeneration({
                    userId:
                        req.user._id,

                    plan:
                        req.user.plan,

                    prompt:
                        prompt.trim()
                });

            res.status(200);

            res.setHeader(
                "Content-Type",
                "text/event-stream; charset=utf-8"
            );

            res.setHeader(
                "Cache-Control",
                "no-cache, no-transform"
            );

            res.setHeader(
                "Connection",
                "keep-alive"
            );

            res.setHeader(
                "X-Accel-Buffering",
                "no"
            );

            if (
                typeof res.flushHeaders ===
                "function"
            ) {
                res.flushHeaders();
            }

            sendEvent(
                res,
                "meta",
                {
                    conversationId:
                        conversation._id,

                    model:
                        process.env.GEMINI_MODEL ||
                        "gemini-3.1-flash-lite"
                }
            );

            const stream =
                await createStreamingResponse({
                    history,
                    prompt:
                        prompt.trim(),
                    type,
                    userName:
                        req.user.name,
                    maxOutputTokens:
                        reservation.maxOutputTokens
                });

            let usageMetadata = null;

            for await (
                const chunk of stream
            ) {
                const text =
                    chunk.text || "";

                if (text) {
                    generatedText +=
                        text;

                    sendEvent(
                        res,
                        "delta",
                        {
                            delta: text
                        }
                    );
                }

                if (
                    chunk.usageMetadata
                ) {
                    usageMetadata =
                        chunk.usageMetadata;
                }
            }

            const inputTokens =
                Number(
                    usageMetadata
                        ?.promptTokenCount
                ) || 0;

            const outputTokens =
                Number(
                    usageMetadata
                        ?.candidatesTokenCount
                ) || 0;

            const totalTokens =
                Number(
                    usageMetadata
                        ?.totalTokenCount
                ) ||
                inputTokens +
                    outputTokens;

            conversation.messages.push({
                role: "user",
                content:
                    prompt.trim()
            });

            conversation.messages.push({
                role: "assistant",
                content:
                    generatedText,

                tokensUsed:
                    totalTokens
            });

            conversation.lastMessageAt =
                new Date();

            if (
                conversation.title ===
                "New conversation"
            ) {
                conversation.title =
                    prompt
                        .trim()
                        .slice(0, 80);
            }

            await conversation.save();

            const generation =
                await Generation.create({
                    user:
                        req.user._id,

                    project:
                        project._id,

                    conversation:
                        conversation._id,

                    type,

                    prompt:
                        prompt.trim(),

                    result:
                        generatedText,

                    model:
                        process.env.GEMINI_MODEL ||
                        "gemini-3.1-flash-lite",

                    inputTokens,

                    outputTokens,

                    tokensUsed:
                        totalTokens
                });

            await finalizeGeneration({
                userId:
                    req.user._id,

                reservationTokens:
                    reservation.reservationTokens,

                actualTokens:
                    totalTokens
            });

            reservation = null;

            finalized = true;

            const usage =
                await getUsageSnapshot(
                    req.user._id,
                    req.user.plan
                );

            /*
             * IMPORTANT:
             * Send the complete generated text
             * with the done event.
             *
             * The frontend must NOT replace
             * its output with undefined.
             */
            sendEvent(
                res,
                "done",
                {
                    generationId:
                        generation._id,

                    conversationId:
                        conversation._id,

                    result:
                        generatedText,

                    tokensUsed:
                        totalTokens,

                    usage
                }
            );

            res.end();
        } catch (error) {
            if (reservation) {
                try {
                    await releaseGeneration({
                        userId:
                            req.user._id,

                        reservationTokens:
                            reservation.reservationTokens
                    });

                    reservation = null;
                } catch (
                    releaseError
                ) {
                    console.error(
                        "RELEASE ERROR:",
                        releaseError
                    );
                }
            }

            if (
                res.headersSent
            ) {
                sendEvent(
                    res,
                    "error",
                    {
                        message:
                            error instanceof
                            UsageLimitError
                                ? error.message
                                : error.message ||
                                  "AI generation failed."
                    }
                );

                return res.end();
            }

            if (
                error instanceof
                UsageLimitError
            ) {
                return res.status(429).json({
                    success: false,
                    message:
                        error.message,
                    details:
                        error.details
                });
            }

            console.error(
                "STREAM GENERATION:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "AI streaming failed."
            });
        } finally {
            if (
                !finalized &&
                reservation
            ) {
                try {
                    await releaseGeneration({
                        userId:
                            req.user._id,

                        reservationTokens:
                            reservation.reservationTokens
                    });
                } catch (error) {
                    console.error(
                        "FINAL RELEASE:",
                        error
                    );
                }
            }
        }
    };

const regenerateGeneration =
    async (req, res) => {
        let reservation = null;

        try {
            const original =
                await Generation.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                });

            if (!original) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Generation not found."
                });
            }

            const project =
                await getOwnedProject(
                    original.project,
                    req.user._id
                );

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Project not found."
                });
            }

            reservation =
                await reserveGeneration({
                    userId:
                        req.user._id,

                    plan:
                        req.user.plan,

                    prompt:
                        original.prompt
                });

            const result =
                await generateContent({
                    history: [],
                    prompt:
                        original.prompt,
                    type:
                        original.type,
                    userName:
                        req.user.name,
                    maxOutputTokens:
                        reservation.maxOutputTokens
                });

            const generation =
                await Generation.create({
                    user:
                        req.user._id,

                    project:
                        project._id,

                    conversation:
                        original.conversation,

                    type:
                        original.type,

                    prompt:
                        original.prompt,

                    result:
                        result.text,

                    model:
                        result.model,

                    inputTokens:
                        result.inputTokens,

                    outputTokens:
                        result.outputTokens,

                    tokensUsed:
                        result.totalTokens
                });

            await finalizeGeneration({
                userId:
                    req.user._id,

                reservationTokens:
                    reservation.reservationTokens,

                actualTokens:
                    result.totalTokens
            });

            reservation = null;

            return res.status(201).json({
                success: true,
                data: generation
            });
        } catch (error) {
            if (reservation) {
                await releaseGeneration({
                    userId:
                        req.user._id,

                    reservationTokens:
                        reservation.reservationTokens
                });
            }

            if (
                error instanceof
                UsageLimitError
            ) {
                return res.status(429).json({
                    success: false,
                    message:
                        error.message
                });
            }

            console.error(
                "REGENERATE:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to regenerate."
            });
        }
    };

const deleteGeneration =
    async (req, res) => {
        try {
            const generation =
                await Generation.findOneAndDelete(
                    {
                        _id:
                            req.params.id,

                        user:
                            req.user._id
                    }
                );

            if (!generation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Generation not found."
                });
            }

            return res.json({
                success: true,
                message:
                    "Generation deleted."
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete generation."
            });
        }
    };

module.exports = {
    getGenerations,
    getUsage,
    createGeneration,
    streamGeneration,
    regenerateGeneration,
    deleteGeneration
};