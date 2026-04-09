import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    short: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    text: { type: String, trim: true },
    type: {
      type: String,
      enum: ["offer", "announcement", "coupon", "general"],
      default: "announcement",
    },
    active: { type: Boolean, default: true },
    name: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    category: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
