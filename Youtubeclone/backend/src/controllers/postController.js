import path from "path";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ owner: req.user._id })
    .populate("owner", "name avatar")
    .sort({ createdAt: -1 });

  res.json(posts);
});

export const createPost = asyncHandler(async (req, res) => {
  const description = req.body.description?.trim() || "";
  const status = req.body.status === "draft" ? "draft" : "published";
  let pollOptions = [];

  if (req.body.pollOptions) {
    try {
      const parsed = JSON.parse(req.body.pollOptions);
      pollOptions = Array.isArray(parsed)
        ? parsed.map((option) => String(option).trim()).filter(Boolean).map((text) => ({ text }))
        : [];
    } catch {
      throw new ApiError(400, "Invalid poll options");
    }
  }

  let mediaUrl = "";
  let mediaType = "none";
  if (req.file) {
    mediaUrl = `/uploads/${path.basename(req.file.path)}`;
    mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
  }

  if (!description && !mediaUrl && !pollOptions.length) {
    throw new ApiError(400, "Add a description, media, or poll to post");
  }

  const post = await Post.create({
    owner: req.user._id,
    description,
    mediaUrl,
    mediaType,
    status,
    pollOptions
  });

  const populated = await post.populate("owner", "name avatar");
  res.status(201).json(populated);
});

export const updatePostStatus = asyncHandler(async (req, res) => {
  const allowed = ["published", "draft", "archived"];
  const { status } = req.body;
  if (!allowed.includes(status)) throw new ApiError(400, "Invalid post status");

  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { status },
    { new: true }
  ).populate("owner", "name avatar");

  if (!post) throw new ApiError(404, "Post not found");
  res.json(post);
});
