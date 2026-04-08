import jwt from "jsonwebtoken";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { SiteSetting } from "../models/siteSetting.model.js";
import { Category } from "../models/category.model.js";

let productIndexInitPromise;

async function ensureProductTextIndex() {
  if (!productIndexInitPromise) {
    productIndexInitPromise = Product.init();
  }
  await productIndexInitPromise;
}

function withDerivedFields(productDoc, options = {}) {
  const { wishlistedProductIds = [] } = options;
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  const normalizedSizes = (product.sizes || [])
    .map((entry) => ({
      size: String(entry?.size || "").toUpperCase(),
      stock: Number(entry?.stock) || 0,
    }))
    .filter((entry) => entry.size);
  const inventoryCount = normalizedSizes.reduce((sum, entry) => sum + entry.stock, 0);
  const variants = normalizedSizes.map((entry) => ({
    size: entry.size,
    color: "Default",
    stock: entry.stock,
    price: Number(product.basePrice) || 0,
    sku: `${String(product.slug || "MADVIRA").toUpperCase()}-${entry.size}`,
  }));

  return {
    ...product,
    price: Number(product.basePrice) || 0,
    basePrice: Number(product.basePrice) || 0,
    ratingsAverage: product.averageRating || 0,
    ratingsCount: product.numReviews || 0,
    sizes: normalizedSizes,
    colors: [],
    images: Array.isArray(product.images) ? product.images : [],
    colorImages: {},
    isVisible: Boolean(product.isActive),
    isNewDrop: Boolean(product.isNewCollection),
    inventoryCount,
    variants,
    isWishlisted: wishlistedProductIds.includes(String(product._id)),
  };
}

async function getRequestUserId(req) {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

async function getRequestWishlistProductIds(req) {
  const userId = await getRequestUserId(req);
  if (!userId) return [];

  const user = await User.findById(userId).select("wishlist");
  if (!user) return [];
  return (user.wishlist || []).map((id) => String(id));
}

async function getRequestWishlistState(req, productId) {
  const userId = await getRequestUserId(req);
  if (!userId) return false;

  const isWishlisted = await User.exists({
    _id: userId,
    wishlist: productId,
  });

  return Boolean(isWishlisted);
}

export async function listProducts(req, res) {
  const {
    page = 1,
    limit = 16,
    category,
    minPrice,
    maxPrice,
    size,
    sort = "newest",
    onlyNewDrops,
    onlyUpcoming,
  } = req.query;

  const filters = { isActive: true };
  if (category) {
    if (/^[a-f\d]{24}$/i.test(String(category))) {
      filters.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: String(category).trim() }).select("_id");
      if (categoryDoc?._id) {
        filters.category = categoryDoc._id;
      }
    }
  }
  if (minPrice) filters.basePrice = { ...(filters.basePrice || {}), $gte: Number(minPrice) };
  if (maxPrice) filters.basePrice = { ...(filters.basePrice || {}), $lte: Number(maxPrice) };
  if (size) filters["sizes.size"] = String(size).toUpperCase();
  if (onlyNewDrops === "true") filters.isNewCollection = true;
  if (onlyUpcoming === "true") filters.isUpcoming = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { basePrice: 1 };
  if (sort === "price_desc") sortOption = { basePrice: -1 };
  if (sort === "rating") sortOption = { averageRating: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total, wishlistedProductIds] = await Promise.all([
    Product.find(filters).populate("category", "name slug").sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filters),
    getRequestWishlistProductIds(req),
  ]);

  res.json({
    items: items.map((item) => withDerivedFields(item, { wishlistedProductIds })),
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  });
}

export async function getProductBySlug(req, res) {
  const [product, siteSettings] = await Promise.all([
    Product.findOne({ slug: req.params.slug }).populate("category", "name slug"),
    SiteSetting.findOne({ key: "global" }).select("sizeChartRows sizeChartUnit sizeChartNotes"),
  ]);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  const plainProduct = product.toObject ? product.toObject() : product;

  const isWishlisted = await getRequestWishlistState(req, product._id);

  res.json({
    ...withDerivedFields(plainProduct),
    isWishlisted,
    sizeChart: plainProduct?.sizeChart?.text || plainProduct?.sizeChart?.image
      ? plainProduct.sizeChart
      : {
          text: siteSettings?.sizeChartNotes || "",
          image: "",
        },
  });
}

export async function getRelatedProducts(req, res) {
  const baseProduct = await Product.findById(req.params.productId);
  if (!baseProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  const items = await Product.find({
    _id: { $ne: baseProduct._id },
    isActive: true,
    $or: [{ category: baseProduct.category }, { isNewCollection: true }, { isUpcoming: true }],
  })
    .limit(Number(req.query.limit || 4))
    .sort({ averageRating: -1, createdAt: -1 });

  res.json({ items: items.map((item) => withDerivedFields(item)) });
}

export async function searchProducts(req, res) {
  const { q = "", category, page = 1, limit = 12 } = req.query;
  const trimmedQuery = String(q).trim();
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (pageNumber - 1) * pageLimit;
  const baseFilters = { isActive: true };

  if (category) {
    baseFilters.category = category;
  }

  await ensureProductTextIndex();

  if (!trimmedQuery) {
    const [products, total, wishlistedProductIds] = await Promise.all([
      Product.find(baseFilters)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Product.countDocuments(baseFilters),
      getRequestWishlistProductIds(req),
    ]);

    return res.json({
      products: products.map((item) => withDerivedFields(item, { wishlistedProductIds })),
      total,
      page: pageNumber,
      pages: total > 0 ? Math.ceil(total / pageLimit) : 0,
    });
  }

  const filters = {
    ...baseFilters,
    $text: { $search: trimmedQuery },
  };

  const [products, total, wishlistedProductIds] = await Promise.all([
    Product.find(filters, {
      name: 1,
      slug: 1,
      description: 1,
      basePrice: 1,
      images: 1,
      sizes: 1,
      category: 1,
      sizeChart: 1,
      washCare: 1,
      isActive: 1,
      isNewCollection: 1,
      isUpcoming: 1,
      averageRating: 1,
      numReviews: 1,
      createdAt: 1,
      updatedAt: 1,
      score: { $meta: "textScore" },
    })
      .populate("category", "name slug")
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(pageLimit),
    Product.countDocuments(filters),
    getRequestWishlistProductIds(req),
  ]);

  const pages = total > 0 ? Math.ceil(total / pageLimit) : 0;

  res.json({
    products: products.map((item) => withDerivedFields(item, { wishlistedProductIds })),
    total,
    page: pageNumber,
    pages,
  });
}
