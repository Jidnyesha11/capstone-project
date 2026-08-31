const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const generationRoutes = require("./routes/generationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
 * Database
 */
connectDB();

/*
 * Middleware
 */
app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        credentials: true
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

/*
 * Health check
 */
app.get(
    "/api/health",
    (req, res) => {
        res.json({
            success: true,
            message:
                "NexaAI backend is running."
        });
    }
);

/*
 * API routes
 *
 * IMPORTANT:
 * app must already exist before
 * calling app.use().
 */
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
    "/api/conversations",
    conversationRoutes
);

/*
 * 404 handler
 */
app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/*
 * Global error handler
 */
app.use(
    (error, req, res, next) => {
        console.error(
            "GLOBAL ERROR:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        return res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error."
        });
    }
);

/*
 * Start server
 */
app.listen(
    PORT,
    () => {
        console.log(
            `NexaAI backend running on http://localhost:${PORT}`
        );
    }
);