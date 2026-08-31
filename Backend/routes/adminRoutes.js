
const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    authorize
} = require("../middleware/roleMiddleware");

const {
    getDashboard,
    getUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser
} = require("../controllers/adminController");

const router =
    express.Router();

router.use(
    protect,
    authorize("admin")
);

router.get(
    "/dashboard",
    getDashboard
);

router.get(
    "/users",
    getUsers
);

router.put(
    "/users/:id/role",
    updateUserRole
);

router.put(
    "/users/:id/status",
    updateUserStatus
);

router.delete(
    "/users/:id",
    deleteUser
);

module.exports = router;
