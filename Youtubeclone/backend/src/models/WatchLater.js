import mongoose from "mongoose";

const watchLaterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true }
  },
  { timestamps: true }
);

watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

const WatchLater = mongoose.model("WatchLater", watchLaterSchema);
export default WatchLater;
