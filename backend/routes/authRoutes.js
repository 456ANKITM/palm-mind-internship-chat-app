import express from "express";
import { uploadFields } from "../middleware/upload.js";
import { getMe, login, logout,  searchUsers, signup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/signup", uploadFields, signup)
router.post("/login", login)
router.get("/getMe", protect, getMe)
router.post("/logout", protect, logout)
router.get("/search", searchUsers);

export default router;