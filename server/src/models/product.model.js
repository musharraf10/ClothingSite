import mongoose from "mongoose";

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, enum: ["S", "M", "L", "XL"] },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.filter(Boolean).length === 6;
        },
        message: "Exactly 6 product images are required",
      },
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    sizes: {
      type: [sizeStockSchema],
      required: true,
      validate: {
        validator(value) {
          if (!Array.isArray(value) || value.length !== 4) return false;
          const set = new Set(value.map((entry) => entry.size));
          return ["S", "M", "L", "XL"].every((size) => set.has(size));
        },
        message: "sizes must include S, M, L and XL stock entries",
      },
    },
    sizeChart: {
      text: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    washCare: { type: String, default: "" },
    isNewCollection: { type: Boolean, default: false },
    isUpcoming: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
