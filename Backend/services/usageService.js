const Usage = require("../models/Usage");

const PLAN_LIMITS = {
    free: {
        generations: 10,
        tokens: 20000,
        maxOutputTokens: 2048
    },
    pro: {
        generations: 100,
        tokens: 200000,
        maxOutputTokens: 4096
    },
    enterprise: {
        generations: 1000,
        tokens: 2000000,
        maxOutputTokens: 8192
    }
};

class UsageLimitError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "UsageLimitError";
        this.statusCode = 429;
        this.details = details;
    }
}

const getPeriodStart = () => {
    const now = new Date();

    return new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1
        )
    );
};

const getPlanLimits = (plan) => {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

const ensureCurrentUsage = async (userId) => {
    const periodStart = getPeriodStart();

    let usage = await Usage.findOne({
        user: userId
    });

    if (!usage) {
        usage = await Usage.create({
            user: userId,
            periodStart,
            generations: 0,
            tokensUsed: 0,
            tokensReserved: 0
        });

        return usage;
    }

    if (
        !usage.periodStart ||
        usage.periodStart.getTime() !==
            periodStart.getTime()
    ) {
        usage.periodStart = periodStart;
        usage.generations = 0;
        usage.tokensUsed = 0;
        usage.tokensReserved = 0;
        usage.lastGenerationAt = null;

        await usage.save();
    }

    return usage;
};

const getUsageSnapshot = async (
    userId,
    plan
) => {
    const usage =
        await ensureCurrentUsage(userId);

    const limits =
        getPlanLimits(plan);

    const generationsUsed =
        usage.generations || 0;

    const tokensUsed =
        usage.tokensUsed || 0;

    /*
     * Reserved tokens are intentionally not shown
     * as consumed tokens in the UI.
     */
    const tokensRemaining = Math.max(
        limits.tokens - tokensUsed,
        0
    );

    return {
        plan,

        limits: {
            generations:
                limits.generations,

            tokens:
                limits.tokens,

            maxOutputTokens:
                limits.maxOutputTokens
        },

        generationsUsed,

        generationsRemaining:
            Math.max(
                limits.generations -
                    generationsUsed,
                0
            ),

        tokensUsed,

        tokensReserved:
            usage.tokensReserved || 0,

        tokensRemaining,

        periodStart:
            usage.periodStart,

        lastGenerationAt:
            usage.lastGenerationAt || null
    };
};

const estimateInputTokens = (
    prompt
) => {
    return Math.max(
        Math.ceil(prompt.length / 4),
        32
    );
};

const reserveGeneration = async ({
    userId,
    plan,
    prompt
}) => {
    const usage =
        await ensureCurrentUsage(userId);

    const limits =
        getPlanLimits(plan);

    const generationsUsed =
        usage.generations || 0;

    const tokensUsed =
        usage.tokensUsed || 0;

    /*
     * IMPORTANT:
     *
     * Do not permanently block requests because
     * of an old reservation from a failed stream.
     *
     * The actual usage limit is based on tokensUsed.
     */
    if (
        generationsUsed >=
        limits.generations
    ) {
        throw new UsageLimitError(
            "Monthly generation limit reached.",
            {
                limitType: "generations",
                limit:
                    limits.generations,
                used:
                    generationsUsed,
                remaining: 0
            }
        );
    }

    if (
        tokensUsed >=
        limits.tokens
    ) {
        throw new UsageLimitError(
            "Monthly token limit reached.",
            {
                limitType: "tokens",
                limit:
                    limits.tokens,
                used:
                    tokensUsed,
                remaining: 0
            }
        );
    }

    const estimatedInputTokens =
        estimateInputTokens(prompt);

    const availableTokens =
        Math.max(
            limits.tokens -
                tokensUsed,
            0
        );

    const maxOutputTokens =
        Math.min(
            limits.maxOutputTokens,

            Math.max(
                availableTokens -
                    estimatedInputTokens,

                128
            )
        );

    if (
        availableTokens <=
        estimatedInputTokens
    ) {
        throw new UsageLimitError(
            "Not enough token allowance for this request.",
            {
                limitType: "tokens",
                limit:
                    limits.tokens,
                used:
                    tokensUsed,
                remaining:
                    availableTokens
            }
        );
    }

    /*
     * We reserve only the expected maximum output.
     * The reservation is released/finalized after
     * the OpenAI stream finishes.
     */
    const reservationTokens =
        estimatedInputTokens +
        maxOutputTokens;

    const updated =
        await Usage.findOneAndUpdate(
            {
                user: userId,

                periodStart:
                    usage.periodStart,

                generations: {
                    $lt:
                        limits.generations
                },

                tokensUsed: {
                    $lt:
                        limits.tokens
                }
            },
            {
                $inc: {
                    generations: 1,

                    tokensReserved:
                        reservationTokens
                }
            },
            {
                new: true
            }
        );

    if (!updated) {
        throw new UsageLimitError(
            "Usage limit reached. Please try again.",
            {
                limitType: "usage"
            }
        );
    }

    return {
        reservationTokens,
        estimatedInputTokens,
        maxOutputTokens,
        periodStart:
            usage.periodStart
    };
};

const finalizeGeneration = async ({
    userId,
    reservationTokens,
    actualTokens
}) => {
    const safeActualTokens =
        Math.max(
            Number(actualTokens) || 0,
            0
        );

    const usage =
        await Usage.findOneAndUpdate(
            {
                user: userId
            },
            {
                $inc: {
                    tokensReserved:
                        -reservationTokens,

                    tokensUsed:
                        safeActualTokens
                },

                $set: {
                    lastGenerationAt:
                        new Date()
                }
            },
            {
                new: true
            }
        );

    if (!usage) {
        throw new Error(
            "Unable to finalize AI usage."
        );
    }

    /*
     * Never allow a failed/old reservation to
     * leave the account permanently blocked.
     */
    if (
        usage.tokensReserved < 0
    ) {
        usage.tokensReserved = 0;
        await usage.save();
    }

    return usage;
};

const releaseGeneration = async ({
    userId,
    reservationTokens
}) => {
    const usage =
        await Usage.findOneAndUpdate(
            {
                user: userId,

                generations: {
                    $gt: 0
                }
            },
            {
                $inc: {
                    generations: -1,

                    tokensReserved:
                        -reservationTokens
                }
            },
            {
                new: true
            }
        );

    if (
        usage &&
        usage.tokensReserved < 0
    ) {
        usage.tokensReserved = 0;
        await usage.save();
    }

    return usage;
};

const resetStaleReservations =
    async (userId) => {
        const usage =
            await Usage.findOne({
                user: userId
            });

        if (!usage) {
            return null;
        }

        usage.tokensReserved = 0;

        await usage.save();

        return usage;
    };

module.exports = {
    PLAN_LIMITS,
    UsageLimitError,
    getPlanLimits,
    getUsageSnapshot,
    reserveGeneration,
    finalizeGeneration,
    releaseGeneration,
    resetStaleReservations
};