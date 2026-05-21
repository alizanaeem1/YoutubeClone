import { Router } from "express";
import { createPost, getMyPosts, updatePostStatus } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", protect, getMyPosts);
router.post("/", protect, upload.single("media"), createPost);
router.patch("/:id/status", protect, updatePostStatus);

export default router;
