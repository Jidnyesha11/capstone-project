const express = require("express");

const {
    protect
} = require(
    "../middleware/authMiddleware"
);

const {
    getGenerations,
    getUsage,
    createGeneration,
    streamGeneration,
    regenerateGeneration,
    deleteGeneration
} = require(
    "../controllers/generationController"
);

const router = express.Router();

router.use(protect);

router.get(
    "/usage",
    getUsage
);

router.get(
    "/",
    getGenerations
);

router.post(
    "/",
    createGeneration
);

router.post(
    "/stream",
    streamGeneration
);

router.post(
    "/:id/regenerate",
    regenerateGeneration
);

router.delete(
    "/:id",
    deleteGeneration
);

module.exports = router;