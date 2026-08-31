
const notFound = (
    req,
    res
) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

const errorHandler = (
    error,
    req,
    res,
    next
) => {
    console.error(error);

    if (
        error.name ===
        "ValidationError"
    ) {
        return res.status(400).json({
            success: false,
            message: Object.values(
                error.errors
            )
                .map(
                    (item) =>
                        item.message
                )
                .join(", ")
        });
    }

    if (
        error.code === 11000
    ) {
        const field =
            Object.keys(
                error.keyPattern || {}
            )[0] || "field";

        return res.status(409).json({
            success: false,
            message: `${field} already exists.`
        });
    }

    if (
        error.name ===
        "CastError"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID."
        });
    }

    const statusCode =
        res.statusCode >= 400
            ? res.statusCode
            : 500;

    res.status(statusCode).json({
        success: false,
        message:
            error.message ||
            "Internal server error."
    });
};

module.exports = {
    notFound,
    errorHandler
};

