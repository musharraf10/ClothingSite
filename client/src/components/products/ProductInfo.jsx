import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiStar, HiOutlineHeart, HiHeart, HiShare } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { useToast } from "../ui/ToastProvider.jsx";

export function ProductInfo({
  product,
  size,
  qty,
  setSize,
  setQty,
  sizeChart,
  onWishlistChange,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(Boolean(product?.isWishlisted));
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setLiked(Boolean(product?.isWishlisted));
  }, [product?.isWishlisted, product?._id]);

  const selectedVariant = useMemo(
    () => (product.variants || []).find((variant) => variant.size === size),
    [product.variants, size],
  );

  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedImage = product.images?.[0] || "";
  const hasVariantData = (product.variants || []).length > 0;

  const canAdd = hasVariantData ? Boolean(selectedVariant && size) : true;

  const discount =
    product.originalPrice && product.originalPrice > selectedPrice
      ? Math.round(((product.originalPrice - selectedPrice) / product.originalPrice) * 100)
      : 0;

  const stock = selectedVariant?.stock ?? 0;

  const add = async () => {
    if (!canAdd) {
      notify("Please select size", "error");
      return;
    }

    if (qty > stock) {
      notify("Requested quantity exceeds stock", "error");
      return;
    }

    setAdding(true);

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: selectedPrice,
        image: selectedImage,
        qty,
        size,
        color: "",
        sku: selectedVariant?.sku,
      }),
    );

    notify("Added to cart");

    setTimeout(() => setAdding(false), 600);
  };

  const buyNow = () => {
    if (!canAdd) {
      notify("Please select size", "error");
      return;
    }

    if (qty > stock || stock < 1) {
      notify("Requested quantity exceeds stock", "error");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNow: true,
        selected: [
          {
            product: product._id,
            name: product.name,
            price: selectedPrice,
            image: selectedImage,
            qty,
            size,
            color: "",
            sku: selectedVariant?.sku,
          },
        ],
      },
    });
  };

  const toggleWishlist = async () => {
    if (wishlistLoading) return;

    const nextLiked = !liked;
    setWishlistLoading(true);

    try {
      if (liked) {
        await api.delete(`/users/wishlist/${product._id}`);
        notify("Removed from wishlist");
      } else {
        await api.post(`/users/wishlist/${product._id}`);
        notify("Added to wishlist");
      }

      setLiked(nextLiked);
      onWishlistChange?.(nextLiked);
    } catch {
      notify("Please sign in to manage wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const buildShareUrl = () => {
    const shareUrl = new URL(`/product/${product.slug}`, window.location.origin);

    // UTM params for analytics attribution on shared visits.
    shareUrl.searchParams.set("utm_source", "share");
    shareUrl.searchParams.set("utm_medium", "product_share");
    shareUrl.searchParams.set("utm_campaign", "product_detail");

    return shareUrl.toString();
  };

  const copyToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const shareProduct = async () => {
    if (sharing) return;

    const url = buildShareUrl();
    setSharing(true);

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: product.name,
          text: "Check out this product I found.",
          url,
        });
        return;
      }

      await copyToClipboard(url);
      notify("Product link copied to clipboard");
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await copyToClipboard(url);
        notify("Product link copied to clipboard");
      } catch {
        notify("Unable to share right now. Please try again.", "error");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <h3 className="text-xl pt-2 md:text-[1.5rem] sm:text-[0.95rem] font-semibold font-sans tracking-tight text-fg">
          {product.name}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xl md:text-xl font-semibold font-sans text-fg">
          ₹{selectedPrice.toFixed(2)}
        </span>

        {product.originalPrice > selectedPrice && (
          <>
            <span className="text-muted line-through">
              ₹{product.originalPrice.toFixed(2)}
            </span>

            {discount > 0 && (
              <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-2.5 py-1">
                {discount}% OFF
              </span>
            )}
          </>
        )}
      </div>

      {canAdd && stock > 0 && stock <= 3 && (
        <p className="text-amber-400 text-sm font-medium">
          Only {stock} left
        </p>
      )}

      {canAdd && stock < 1 && (
        <p className="text-red-400 text-sm font-medium">
          Out of stock
        </p>
      )}

      <div className="bg-primary rounded-2xl p-4 transition-all duration-200">
        <ProductVariants
          variants={product.variants}
          size={size}
          setSize={setSize}
          sizeChart={sizeChart}
        />
      </div>

      <div className="space-y-3 w-full">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 h-12 rounded-2xl overflow-hidden bg-primary text-sm">

            {/* Decrease */}
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex-1 flex items-center justify-center text-muted hover:text-fg transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* Quantity */}
            <div className="flex-1 flex items-center justify-center text-fg font-medium">
              {qty}
            </div>

            {/* Increase */}
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex-1 flex items-center justify-center text-muted hover:text-fg transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>

          </div>

          <button
            type="button"
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl text-fg hover:bg-primary transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {liked ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={shareProduct}
            disabled={sharing}
            aria-label="Share this product"
            className="h-12 px-4 shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl text-fg hover:bg-primary transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <HiShare className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={add}
            disabled={!canAdd || stock < 1 || adding}
            className="h-12 w-full rounded-2xl bg-accent text-primary px-4 text-sm font-semibold shadow-[0_8px_24px_rgba(166,210,56,0.22)] hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={adding ? "inline-block animate-pulse" : "inline-block"}>
              {adding ? "Adding..." : "Add to cart"}
            </span>
          </button>

          <button
            type="button"
            onClick={buyNow}
            disabled={!canAdd || stock < 1}
            className="h-12 w-full rounded-2xl bg-primary text-fg px-4 text-sm font-semibold hover:bg-card active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy now
          </button>
        </div>
      </div>

      {selectedImage ? (
        <p className="text-xs text-muted">Cart uses selected media.</p>
      ) : null}

    </div>
  );
}
