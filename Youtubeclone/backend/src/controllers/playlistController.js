import Playlist from "../models/Playlist.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate({
      path: "videos",
      select: "title thumbnailUrl videoUrl duration views createdAt owner",
      populate: { path: "owner", select: "name avatar" }
    })
    .sort({ updatedAt: -1 });

  res.json(playlists);
});

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Playlist name is required");

  const playlist = await Playlist.create({
    owner: req.user._id,
    name: name.trim(),
    description: description?.trim() || ""
  });

  res.status(201).json(playlist);
});

export const getPlaylistById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id })
    .populate("owner", "name avatar")
    .populate({
      path: "videos",
      populate: { path: "owner", select: "name avatar" }
    });

  if (!playlist) throw new ApiError(404, "Playlist not found");
  res.json(playlist);
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) throw new ApiError(400, "videoId is required");

  const video = await Video.findById(videoId).select("_id");
  if (!video) throw new ApiError(404, "Video not found");

  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
  if (!playlist) throw new ApiError(404, "Playlist not found");

  const alreadyAdded = playlist.videos.some((id) => String(id) === String(video._id));
  if (!alreadyAdded) {
    playlist.videos.push(video._id);
    await playlist.save();
  }

  res.json({ added: true, playlist });
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
  if (!playlist) throw new ApiError(404, "Playlist not found");

  playlist.videos = playlist.videos.filter((id) => String(id) !== String(req.params.videoId));
  await playlist.save();
  res.json({ removed: true });
});
