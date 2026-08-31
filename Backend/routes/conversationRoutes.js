const express = require("express");

const {
    protect
} = require(
    "../middleware/authMiddleware"
);

const {
    listConversations,
    getConversation,
    createConversation,
    deleteConversation
} = require(
    "../controllers/conversationController"
);

const router = express.Router();

router.use(protect);

router.get(
    "/",
    listConversations
);

router.post(
    "/",
    createConversation
);

router.get(
    "/:id",
    getConversation
);

router.delete(
    "/:id",
    deleteConversation
);

module.exports = router;