import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: ["comment", "like", "subscription", "upload"]
    },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", default: null },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
