import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductReviews } from "../components/products/ProductReviews.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { SeoMeta } from "../components/seo/SeoMeta.jsx";
import {
  STALE_TIME_SECONDS,
  useGetProductBySlugQuery,
  useGetProductsQuery,
  useGetReviewsQuery,
} from "../store/apis/catalogApi.js";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [localWishlisted, setLocalWishlisted] = useState(null);

  const queryOptions = useMemo(
    () => ({
      refetchOnMountOrArgChange: STALE_TIME_SECONDS,
    }),
    [],
  );

  const { data: productData, isLoading: productLoading } = useGetProductBySlugQuery(slug, {
    ...queryOptions,
    skip: !slug,
  });

  const product = useMemo(() => {
    if (!productData) return null;
    if (localWishlisted === null) return productData;
    return { ...productData, isWishlisted: localWishlisted };
  }, [localWishlisted, productData]);

  const productId = productData?._id;
  const { data: reviewsData } = useGetReviewsQuery(productId, {
    ...queryOptions,
    skip: !productId,
  });

  const { data: recommendedSource, isLoading: recommendedLoading } = useGetProductsQuery(
    { limit: 10, sort: "newest" },
    queryOptions,
  );

  const recommendedItems = useMemo(() => {
    const items = recommendedSource?.items || [];
    if (!productId) return items.slice(0, 10);
    return items.filter((entry) => entry._id !== productId).slice(0, 10);
  }, [productId, recommendedSource]);

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!productData) return;

    setQty(1);
    const firstInStock = (productData.variants || []).find((variant) => Number(variant.stock || 0) > 0);
    setSize(firstInStock?.size || "");
    setLocalWishlisted(null);
  }, [productData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return product.images || [];
  }, [product]);

  const seoMeta = useMemo(() => {
    if (!product) return null;

    const summary =
      product.summary ||
      product.shortDescription ||
      product.description ||
      "Premium MADVIRA product crafted for all-day comfort.";
    const imageSource =
      product.thumbnail ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.variants?.find((variant) => Array.isArray(variant.images) && variant.images.length > 0)?.images?.[0];

    return {
      title: `${product.name} | MADVIRA`,
      description: summary,
      canonicalUrl: `/product/${slug}`,
      type: "product",
      image: imageSource,
    };
  }, [product, slug]);

  if (productLoading || !product) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] w-full max-w-4xl h-96" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full mx-auto px-4 -mt-2 md:-mt-3 space-y-8">
      {seoMeta && (
        <SeoMeta
          title={seoMeta.title}
          description={seoMeta.description}
          canonicalUrl={seoMeta.canonicalUrl}
          type={seoMeta.type}
          image={seoMeta.image}
        />
      )}
      <section className="grid w-full gap-4 lg:grid-cols-[0.62fr_0.38fr] lg:min-h-[72vh]">
        <div className="w-full h-full max-h-[72vh]">
          <ProductGallery key={product._id} images={galleryImages} alt={product.name} variantKey={product._id} />
          {(!galleryImages || galleryImages.length === 0) && (
            <p className="text-sm text-muted">Fallback product media is shown.</p>
          )}
        </div>

        <div className="w-full h-full max-h-[72vh] overflow-hidden flex flex-col gap-4">
          <ProductInfo
            product={product}
            size={size}
            qty={qty}
            setSize={setSize}
            setQty={setQty}
            sizeChart={product.sizeChart}
            onWishlistChange={(isWishlisted) => {
              setLocalWishlisted(isWishlisted);
            }}
          />

          <div className="flex-1 min-h-0 overflow-hidden rounded-[28px] border border-border pb-2 bg-card">
            <div className="flex flex-wrap justify-around border-b px-4 py-3">
              {[
                { key: "details", label: "Details" },
                { key: "washCare", label: "Washcare" },
                { key: "shipping", label: "Shipping" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-semibold transition ${activeTab === tab.key
                    ? "text-fg shadow-sm"
                    : "text-muted hover:bg-primary"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="h-full min-h-0 overflow-auto px-4 py-4 text-sm text-muted max-h-[42vh]">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-fg mb-2">Details</h3>
                    {product.description ? (
                      product.description.split("\n").map((line, index) => (
                        <p key={index} className="leading-6 text-fg">
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="leading-6 text-fg">No details available for this product.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "washCare" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg">WashCare</h3>
                  {product.washCare ? (
                    product.washCare.split("\n").map((line, index) => (
                      <p key={index} className="leading-6 text-fg">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="leading-6 text-fg">Wash care instructions are not available for this product.</p>
                  )}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg">Shipping</h3>
                  <p className="leading-6 text-fg">
                    Free standard shipping on orders above ₹1999. Delivery typically takes 4-7 business days.
                  </p>
                  <p className="leading-6 text-fg">
                    Orders are processed within 24 hours and shipped from our Mumbai warehouse.
                  </p>
                  <p className="leading-6 text-fg">
                    Returns are accepted within 14 days of delivery for eligible items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product._id}
        reviews={reviewsData?.reviews || []}
        ratingsAverage={product.ratingsAverage}
        ratingsCount={product.ratingsCount}
        canReview={Boolean(reviewsData?.canReview)}
      />

      <section className="space-y-4">
        <h3 className="text-base md:text-lg font-semibold text-fg">
          You may Like these
        </h3>
        {recommendedLoading ? (
          <div className="rounded-xl bg-card p-6 text-sm text-muted">Loading products...</div>
        ) : (
          <ProductGrid className="md:grid-cols-3 lg:grid-cols-5">
            {recommendedItems.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </ProductGrid>
        )}
      </section>
    </motion.div>
  );
}
