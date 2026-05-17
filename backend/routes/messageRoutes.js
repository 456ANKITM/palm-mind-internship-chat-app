import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getConversationMessages, getUnreadMessagesCount, markMessagesAsSeen, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/sendMessage", protect, sendMessage)
router.get("/unread-count", protect, getUnreadMessagesCount);
router.get("/:conversationId", protect, getConversationMessages);
router.put("/seen/:conversationId", protect, markMessagesAsSeen);

export default router;