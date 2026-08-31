const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const generationRoutes = require("./routes/generationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable("x-powered-by");

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
        extended: true,
        limit: "2mb"
    })
);

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "NexaAI backend is running.",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/generations", generationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

app.use((error, req, res, next) => {
    console.error("Unhandled server error:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(error.status || 500).json({
        success: false,
        message:
            error.message ||
            "Internal server error."
    });
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            `NexaAI backend running on http://localhost:${PORT}`
        );
    });
};

if (require.main === module) {
    startServer().catch((error) => {
        console.error(
            "Failed to start backend:",
            error
        );
        process.exit(1);
    });
}

module.exports = app;
