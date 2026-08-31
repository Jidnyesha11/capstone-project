
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB =
    require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const projectRoutes =
    require("./routes/projectRoutes");

const generationRoutes =
    require("./routes/generationRoutes");

const profileRoutes =
    require("./routes/profileRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

if (!process.env.JWT_SECRET) {
    console.error(
        "JWT_SECRET is missing from .env"
    );

    process.exit(1);
}

const app =
    express();

connectDB();

app.disable(
    "x-powered-by"
);

const allowedOrigins = [
    process.env.CLIENT_URL ||
        "http://localhost:5173"
];

app.use(
    cors({
        origin: (
            origin,
            callback
        ) => {
            if (
                !origin ||
                allowedOrigins.includes(
                    origin
                )
            ) {
                return callback(
                    null,
                    true
                );
            }

            return callback(
                new Error(
                    "CORS policy: origin not allowed."
                )
            );
        },
        credentials: true
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

app.use(
    morgan("dev")
);

app.get(
    "/",
    (req, res) => {
        res.status(200).json({
            success: true,
            name: "NexaAI API",
            version: "1.0.0",
            message:
                "NexaAI backend is running."
        });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            status: "healthy",
            timestamp:
                new Date().toISOString()
        });
    }
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/projects",
    projectRoutes
);

app.use(
    "/api/generations",
    generationRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    notFound
);

app.use(
    errorHandler
);

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `NexaAI API running on http://localhost:${PORT}`
        );
    }
);

