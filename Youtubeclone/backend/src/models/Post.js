import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, default: "", trim: true },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["none", "image", "video"], default: "none" },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    pollOptions: [pollOptionSchema]
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
