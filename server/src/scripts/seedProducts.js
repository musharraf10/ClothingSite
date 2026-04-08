import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

dotenv.config();

const SIZE_SET = ["S", "M", "L", "XL"];
const CATEGORY_LIST = [
  "T-Shirts",
  "Shirts",
  "Polos",
  "Jeans",
  "Trousers",
  "Hoodies",
  "Jackets",
  "Sweatshirts",
];

async function seedCategories() {
  const categories = [];
  for (let i = 0; i < CATEGORY_LIST.length; i += 1) {
    const name = CATEGORY_LIST[i];
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    let category = await Category.findOne({ slug });

    if (!category) {
      category = await Category.create({
        name,
        slug,
        image: `https://picsum.photos/seed/madvira-cat-${i}/480/600`,
        isActive: true,
      });
    }
    categories.push(category);
  }
  return categories;
}

function sizeStocks() {
  return SIZE_SET.map((size) => ({
    size,
    stock: Math.floor(Math.random() * 20) + 4,
  }));
}

function generateProducts(count, categories) {
  const products = [];
  const adjectives = ["Premium", "Minimal", "Signature", "Luxe", "Tailored", "Classic"];
  const types = ["Tee", "Shirt", "Polo", "Hoodie", "Jacket", "Trouser", "Denim", "Sweatshirt"];

  for (let i = 1; i <= count; i += 1) {
    const category = categories[i % categories.length];
    const adjective = adjectives[i % adjectives.length];
    const type = types[i % types.length];
    const name = `MADVIRA ${adjective} ${type} ${i}`;
    const slug = `madvira-${adjective}-${type}-${i}`.toLowerCase().replace(/\s+/g, "-");

    products.push({
      name,
      slug,
      description:
        "Refined silhouette with premium fabric, engineered for comfort and elevated everyday luxury.",
      basePrice: 3499 + (i % 8) * 500,
      images: Array.from({ length: 6 }, (_, idx) => `https://picsum.photos/seed/madvira-${i}-${idx}/900/1200`),
      sizes: sizeStocks(),
      sizeChart: {
        text: "Fits true to size. For a relaxed luxury fit, choose one size up.",
        image: "",
      },
      category: category._id,
      isNewCollection: i % 3 === 0,
      isUpcoming: i % 9 === 0,
      isActive: true,
      averageRating: Number((3.8 + (i % 12) * 0.1).toFixed(1)),
      numReviews: Math.floor(Math.random() * 160),
    });
  }

  return products;
}

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/noorfit";
    await mongoose.connect(uri);
    console.log("✅ DB Connected");

    const categories = await seedCategories();
    const products = generateProducts(80, categories);
    await Product.deleteMany();
    await Product.insertMany(products);

    console.log(`🔥 ${products.length} MADVIRA products inserted successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seed();
