import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:id/read", protect, markNotificationRead);

export default router;
