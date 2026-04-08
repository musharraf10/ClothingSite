export function cloudinaryTransform(src, { w } = {}) {
  if (!src) return "";
  if (!w || typeof src !== "string") return src;

  if (src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/w_${w},c_fill,q_auto,f_auto/`);
  }

  return src;
}

