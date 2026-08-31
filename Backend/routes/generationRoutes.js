
const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    getGenerations,
    createGeneration,
    getGenerationById,
    deleteGeneration
} = require("../controllers/generationController");

const router =
    express.Router();

router.use(protect);

router.get(
    "/",
    getGenerations
);

router.post(
    "/",
    createGeneration
);

router.get(
    "/:id",
    getGenerationById
);

router.delete(
    "/:id",
    deleteGeneration
);

module.exports = router;

