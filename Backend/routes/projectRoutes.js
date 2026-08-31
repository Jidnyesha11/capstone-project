
const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const router =
    express.Router();

router.use(protect);

router.get(
    "/",
    getProjects
);

router.get(
    "/:id",
    getProjectById
);

router.post(
    "/",
    createProject
);

router.put(
    "/:id",
    updateProject
);

router.delete(
    "/:id",
    deleteProject
);

module.exports = router;