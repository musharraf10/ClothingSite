import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { useToast } from "../ui/ToastProvider.jsx";
import { cloudinaryTransform } from "../../utils/cloudinary.js";
import { ProgressiveImage } from "../ui/ProgressiveImage.jsx";

function uniq(arr) {
  return Array.from(new Set(arr));
}

function pickInitialVariant(variants) {
  const inStock = variants.find((v) => Number(v.stock || 0) > 0);
  return inStock || variants[0];
}

export function ProductCard({ product, onOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notify } = useToast();

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const safeFallbackVariant = variants[0] || { size: "S", color: "Default", stock: 0, price: Number(product?.basePrice || 0) };

  const sizes = useMemo(() => uniq(variants.map((v) => v.size).filter(Boolean)), [variants]);
  const colors = useMemo(() => uniq(variants.map((v) => v.color).filter(Boolean)), [variants]);

  const [activeSize, setActiveSize] = useState(() => pickInitialVariant(variants)?.size || safeFallbackVariant.size);
  const [activeColor, setActiveColor] = useState(() => pickInitialVariant(variants)?.color || safeFallbackVariant.color);
  const [wished, setWished] = useState(Boolean(product?.isWishlisted));

  const activeVariant = useMemo(() => {
    return (
      variants.find((v) => v.size === activeSize && v.color === activeColor) ||
      variants.find((v) => v.size === activeSize) ||
      variants.find((v) => v.color === activeColor) ||
      safeFallbackVariant
    );
  }, [variants, activeSize, activeColor, safeFallbackVariant]);

  const images = useMemo(() => {
    const fromVariant = Array.isArray(activeVariant?.images) ? activeVariant.images.filter(Boolean) : [];
    const fromProduct = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
    if (fromVariant.length > 0) return fromVariant;
    if (fromProduct.length > 0) return fromProduct;
    return [""];
  }, [activeVariant?.images, product?.images]);

  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    setWished(Boolean(product?.isWishlisted));
  }, [product?.isWishlisted, product?._id]);

  const startCycle = useCallback(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImgIndex((p) => (p + 1) % images.length);
    }, 1500);
  }, [images.length]);

  const stopCycle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setImgIndex(0);
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );

  useEffect(() => {
    setImgIndex(0);
  }, [activeVariant]);

  const currentSrc = cloudinaryTransform(images[imgIndex] || "", { w: 600 });
  const isValidSrc = (images[imgIndex] || "").startsWith("http") || (images[imgIndex] || "").startsWith("/");
  const isUpcoming = Boolean(product?.isUpcoming || product?.showComingSoonTag);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 28) {
      setImgIndex((p) => (diff > 0 ? (p + 1) % images.length : (p - 1 + images.length) % images.length));
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpcoming) return;

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: Number(activeVariant?.price ?? product.basePrice ?? 0),
        image: images[imgIndex] || product.images?.[0] || "",
        qty: 1,
        size: activeVariant?.size || activeSize,
        color: activeVariant?.color || "",
        sku: activeVariant?.sku,
        isUpcoming,
      }),
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (wished) {
        await api.delete(`/users/wishlist/${product._id}`);
        setWished(false);
      } else {
        await api.post(`/users/wishlist/${product._id}`);
        setWished(true);
      }
    } catch {
      notify("Sign in to manage wishlist", "error");
    }
  };

  const isOos = (size) => variants.find((v) => v.size === size)?.stock === 0;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="flex flex-col cursor-pointer bg-transparent border-none p-0 w-full"
      onMouseEnter={() => {
        setIsHovered(true);
        startCycle();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        stopCycle();
      }}
      onClick={() => (onOpen ? onOpen(product.slug) : navigate(`/product/${product.slug}`))}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <div
        className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-black dark:bg-zinc-950 flex-shrink-0 shadow-[0_14px_28px_rgba(0,0,0,0.18)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={imgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div animate={{ scale: isHovered ? 1.05 : 1 }} transition={{ duration: 0.45, ease: "easeOut" }} className="h-full w-full">
              <ProgressiveImage
                src={isValidSrc ? currentSrc : undefined}
                alt={product.name}
                className="w-full h-full object-cover block will-change-transform transition-transform duration-500"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {(product.isNewArrival || product.isNewCollection || isUpcoming) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {(product.isNewArrival || product.isNewCollection) && (
              <span className="bg-white text-black text-[9px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
            {isUpcoming && (
              <span className="bg-red-600 text-white text-[9px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border border-red-500/80">
                SOON
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 border border-white/20 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
          aria-pressed={wished}
        >
          <motion.svg
            key={wished ? "on" : "off"}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={15}
            height={15}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            {wished ? (
              <path
                fill="white"
                d="M5 3h14a1 1 0 0 1 1 1v17.27a.5.5 0 0 1-.78.42L12 17.27l-7.22 4.42A.5.5 0 0 1 4 21.27V4a1 1 0 0 1 1-1Z"
              />
            ) : (
              <path
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3h14a1 1 0 0 1 1 1v17.27a.5.5 0 0 1-.78.42L12 17.27l-7.22 4.42A.5.5 0 0 1 4 21.27V4a1 1 0 0 1 1-1Z"
              />
            )}
          </motion.svg>
        </button>
      </div>

      <div className="flex gap-[3px] pt-1 px-0.5 text-black dark:text-white">
        {images.map((_, idx) => (
          <motion.span
            key={idx}
            className="flex-1 h-0.5 rounded cursor-pointer transition-colors bg-current"
            animate={{
              opacity: idx === imgIndex ? 1 : isHovered ? 0.4 : 0.2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setImgIndex(idx);
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5 pt-1.5 px-0.5 text-black dark:text-white">
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-[11px] font-medium tracking-[0.01em] line-clamp-1 flex-1">{product.name}</p>
          <p className="text-[12px] font-semibold whitespace-nowrap">
            ₹
            {Number(activeVariant?.price ?? product.basePrice ?? 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-[3px] flex-wrap">
            {sizes.slice(0, 5).map((s) => {
              const oos = isOos(s);
              return (
                <button
                  key={s}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!oos) setActiveSize(s);
                  }}
                  disabled={oos}
                  className={`
                    text-[9px] font-semibold tracking-[0.03em] px-1.5 py-0.5 rounded border transition-all
                    ${s === activeSize
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : oos
                        ? "opacity-30 line-through border-black/20 dark:border-white/20 text-black/40 dark:text-white/40 cursor-not-allowed"
                        : "border-black/30 dark:border-white/30 text-black/70 dark:text-white/70 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                    }
                  `}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAdd}
            disabled={isUpcoming}
            className={`
              flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center border-[1.5px] transition-all
              ${added
                ? "bg-black dark:bg-white border-black dark:border-white"
                : "border-black/30 dark:border-white/30 hover:border-black dark:hover:border-white hover:bg-black/10 dark:hover:bg-white/10"
              }
            `}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.svg
                  key="check"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="plus"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M12 5v14M5 12h14"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {colors.length > 1 && (
          <div className="flex gap-1">
            {colors.slice(0, 5).map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveColor(c);
                }}
                className={`
                  w-2.5 h-2.5 rounded-full border transition-transform
                  ${c === activeColor
                    ? "scale-125 border-black dark:border-white bg-black dark:bg-white"
                    : "bg-black/30 dark:bg-white/30 border-black/20 dark:border-white/20"
                  }
                `}
                title={c}
              />
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

