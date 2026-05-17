import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createConversation, getConversationById, getUserConversations } from "../controllers/conversationController.js";

const router = express.Router();

router.post("/createConversation", protect, createConversation)
router.get("/getUserConversations", protect, getUserConversations);
router.get("/:conversationId", protect, getConversationById);

export default router;