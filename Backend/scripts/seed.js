
require("dotenv").config();

const mongoose = require("mongoose");

const User =
    require("../models/User");

const Project =
    require("../models/Project");

const Generation =
    require("../models/Generation");

const Usage =
    require("../models/Usage");

const connectDB =
    require("../config/db");

const seed = async () => {
    try {
        await connectDB();

        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Generation.deleteMany({}),
            Usage.deleteMany({})
        ]);

        const admin =
            await User.create({
                name: "Nexa Admin",
                email:
                    "admin@nexaai.com",
                password:
                    "Admin@123",
                role: "admin",
                plan: "pro",
                bio:
                    "NexaAI platform administrator."
            });

        const user =
            await User.create({
                name: "Demo User",
                email:
                    "user@nexaai.com",
                password:
                    "User@123",
                role: "user",
                plan: "free",
                bio:
                    "Demo NexaAI workspace user."
            });

        const [
            adminProject,
            userProject
        ] = await Project.create([
            {
                name: "Admin Workspace",
                description:
                    "Administrative AI workspace.",
                owner: admin._id,
                createdBy: admin._id,
                color: "#111111"
            },
            {
                name: "Marketing Content",
                description:
                    "Generate marketing and social content.",
                owner: user._id,
                createdBy: user._id,
                color: "#6D5DFB"
            }
        ]);

        await Generation.create({
            user: user._id,
            project: userProject._id,
            type: "marketing",
            prompt:
                "Create a launch campaign for a modern productivity application.",
            result:
                "Launch your productivity potential with a smarter, cleaner workflow.",
            model:
                "gemini-3.1-flash-lite",
            tokensUsed: 42
        });

        await Usage.create([
            {
                user: admin._id,
                generations: 0,
                tokensUsed: 0,
                projectsCreated: 1
            },
            {
                user: user._id,
                generations: 1,
                tokensUsed: 42,
                projectsCreated: 1
            }
        ]);

        console.log("");
        console.log(
            "================================"
        );
        console.log(
            "NexaAI database seeded successfully"
        );
        console.log(
            "================================"
        );
        console.log("");
        console.log(
            "Admin:"
        );
        console.log(
            "Email: admin@nexaai.com"
        );
        console.log(
            "Password: Admin@123"
        );
        console.log("");
        console.log(
            "User:"
        );
        console.log(
            "Email: user@nexaai.com"
        );
        console.log(
            "Password: User@123"
        );
        console.log("");
        console.log(
            `Admin project: ${adminProject._id}`
        );
        console.log(
            `User project: ${userProject._id}`
        );
        console.log("");

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error(
            "Seed failed:",
            error
        );

        await mongoose.connection.close();

        process.exit(1);
    }
};

seed();