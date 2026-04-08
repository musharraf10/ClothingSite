export const COLOR_SWATCH_MAP = {
  black: "#000000",
  white: "#ffffff",
};

export function getColorSwatch(color) {
  return COLOR_SWATCH_MAP[String(color || "").trim().toLowerCase()] || "#888888";
}

export function normalizeImages(input) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") return input ? [input] : [];
  if (input && typeof input === "object") return Object.values(input).filter(Boolean);
  return [];
}

export function getColorImageSet(product, color) {
  if (product?.colorImages && color) {
    const normalizedColor = String(color || "").trim();
    const variantImages = normalizeImages(product.colorImages?.[normalizedColor]);
    if (variantImages.length) return variantImages;
  }
  return normalizeImages(product?.images);
}

export function getDisplayPrice(product, color) {
  void color;
  return Number(product?.basePrice ?? product?.price) || 0;
}

export function getVariantInventory(product, color) {
  void color;
  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes.reduce((sum, entry) => sum + (Number(entry?.stock) || 0), 0);
  }
  return (product?.variants || []).reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
}

export function getProductColors(product) {
  const variantColors = (product?.variants || []).map((variant) => variant.color).filter(Boolean);
  const colorImageKeys = Object.keys(product?.colorImages || {}).filter(Boolean);
  return [...new Set([...variantColors, ...colorImageKeys])];
}

export function getProductRoute(product, color) {
  const search = color ? `?color=${encodeURIComponent(color)}` : "";
  return `/product/${product.slug}${search}`;
}

export function expandProductByVariant(product) {
  if (!product) return [];

  const fallbackImages = normalizeImages(product.images);
  return [{
    ...product,
    displayColor: "",
    displayImage: fallbackImages[0] || "",
    displayImages: fallbackImages,
    displayPrice: getDisplayPrice(product),
    variantKey: `${product._id || product.slug}-default`,
    variantInventory: getVariantInventory(product),
    routeTo: getProductRoute(product),
  }];
}

export function expandProductsByVariant(products = []) {
  return products.flatMap(expandProductByVariant);
}
