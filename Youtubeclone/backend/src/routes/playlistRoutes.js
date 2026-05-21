import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist
} from "../controllers/playlistController.js";

const router = Router();

router.get("/", protect, getMyPlaylists);
router.post("/", protect, createPlaylist);
router.get("/:id", protect, getPlaylistById);
router.post("/:id/videos", protect, addVideoToPlaylist);
router.delete("/:id/videos/:videoId", protect, removeVideoFromPlaylist);

export default router;
