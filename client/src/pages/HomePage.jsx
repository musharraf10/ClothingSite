import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductListItem } from "../components/products/ProductListItem.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { GridListToggle } from "../components/ui/GridListToggle.jsx";
import Categories from "../pages/CategoryPage.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";
import { SeoMeta } from "../components/seo/SeoMeta.jsx";
import { ProductStack3D } from "../components/ProductStack3D.jsx";
import {
  STALE_TIME_SECONDS,
  useGetCategoriesQuery,
  useGetHomeReviewsQuery,
  useGetProductsQuery,
} from "../store/apis/catalogApi.js";

const CATALOG_LIMIT = 11;

export function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("product_view_mode") || "grid");
  const [announcements, setAnnouncements] = useState([]);

  const queryOptions = useMemo(() => ({ refetchOnMountOrArgChange: STALE_TIME_SECONDS }), []);

  const allProductsQuery = useGetProductsQuery({ limit: 20, sort: "newest" }, queryOptions);
  const newDropsQuery = useGetProductsQuery({ onlyNewDrops: true, limit: 20 }, queryOptions);
  const upcomingQuery = useGetProductsQuery({ onlyUpcoming: true, limit: 20 }, queryOptions);
  const categoriesQuery = useGetCategoriesQuery(undefined, queryOptions);
  const homeReviewsQuery = useGetHomeReviewsQuery(14, queryOptions);
  const catalogQuery = useGetProductsQuery(
    { limit: CATALOG_LIMIT, page: catalogPage, ...(selectedCategory ? { category: selectedCategory } : {}) },
    queryOptions,
  );

  useEffect(() => {
    localStorage.setItem("product_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    let mounted = true;
    api.get("/announcements")
      .then(({ data }) => {
        if (mounted) setAnnouncements(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setAnnouncements([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const heroProductsSource = allProductsQuery.data?.items || [];
  const newDrops = (newDropsQuery.data?.items || []).filter((p) => !p.isUpcoming);
  const upcomingItems = upcomingQuery.data?.items || [];
  const categories = categoriesQuery.data || [];
  const homeReviews = homeReviewsQuery.data?.reviews || [];
  const catalogProducts = (catalogQuery.data?.items || []).filter((p) => !p.isUpcoming);
  const catalogPages = catalogQuery.data?.totalPages || 1;
  const catalogTotal = catalogQuery.data?.total || 0;

  const loading = allProductsQuery.isLoading || newDropsQuery.isLoading || upcomingQuery.isLoading || categoriesQuery.isLoading;
  const catalogLoading = catalogQuery.isLoading;
  const backendError = allProductsQuery.isError || newDropsQuery.isError || upcomingQuery.isError || categoriesQuery.isError || catalogQuery.isError
    ? "Unable to load products right now. Please refresh in a moment."
    : "";

  const heroProducts = useMemo(() => (newDrops.length ? newDrops : heroProductsSource).slice(0, 6), [heroProductsSource, newDrops]);
  const expandedNewDrops = useMemo(() => expandProductsByVariant(newDrops), [newDrops]);
  const expandedUpcoming = useMemo(() => expandProductsByVariant(upcomingItems), [upcomingItems]);
  const allCollections = useMemo(() => expandedNewDrops.filter((p) => !p.isUpcoming), [expandedNewDrops]);
  const expandedCatalogProducts = useMemo(() => expandProductsByVariant(catalogProducts), [catalogProducts]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-12">
      <SeoMeta title="MADVIRA | Luxury Minimal Fashion" description="Discover MADVIRA premium essentials and upcoming drops." canonicalUrl="/" />

      <section className="py-2 md:py-6">
        <ProductStack3D
          images={heroProducts.map((product) => product?.images?.[0]).filter(Boolean)}
          captions={heroProducts.map((product) => product?.name || "")}
          onCenterClick={(index) => {
            const target = heroProducts[index];
            if (target?.slug) navigate(`/product/${target.slug}`);
          }}
        />
      </section>

      <Categories categories={categories} withSeo={false} />

      <section>
        <SectionHeader title="New Collection" subtitle="Fresh styles for the premium wardrobe" />
        {loading ? <ProductGridSkeleton count={10} /> : (
          <ProductGrid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {expandedNewDrops.map((product) => (
              <ProductCard key={product.variantKey || `${product._id}-default`} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 md:p-6 overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-fg">Announcement</h3>
          <span className="text-xs text-muted uppercase tracking-[0.2em]">Madvira Notice</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(announcements.length ? announcements : [{ text: "Free shipping on orders above ₹2000" }, { text: "Premium drop every Friday at 7 PM" }, { text: "Luxury essentials, minimal design" }])
            .slice(0, 3)
            .map((item, idx) => (
              <motion.article
                key={`${item.text}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                className="rounded-xl border border-border bg-primary p-4"
              >
                <p className="text-sm text-fg">{item.text}</p>
              </motion.article>
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Reviews" subtitle="Slow moving customer stories" />
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <motion.div
            className="flex gap-3"
            animate={{ x: homeReviews.length > 4 ? ["0%", "-24%", "0%"] : "0%" }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {homeReviews.map((review) => (
              <Link key={review._id} to={`/product/${review.product.slug}`} className="min-w-[84%] sm:min-w-[48%] md:min-w-[30%] rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  {review.product.image ? (
                    <img src={review.product.image} alt={review.product.name} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg border border-border bg-primary" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{review.product.name}</p>
                    <p className="text-xs text-muted">{review.user?.name || "Customer"} • {review.rating}/5</p>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted">{review.comment || "Loved the fit and quality."}</p>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      <section>
        <SectionHeader title="Collection" subtitle="T-Shirts, Pants, Inners, Jeans and more" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.slice(0, 10).map((category) => (
            <button
              key={category._id}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(category.slug)}`)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-left"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-32 w-full bg-primary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-white">
                  {category.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Upcoming Collection" subtitle="Only upcoming products" />
        {loading ? <ProductGridSkeleton count={10} /> : (
          <ProductGrid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {expandedUpcoming.map((product) => (
              <ProductCard key={product.variantKey || `${product._id}-default`} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="All Collection Products"
          subtitle={catalogTotal > 0 ? `${catalogTotal} product${catalogTotal === 1 ? "" : "s"}` : "Explore everything in MADVIRA"}
          action={<GridListToggle viewMode={viewMode} onChange={setViewMode} />}
        />

        {backendError && <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{backendError}</div>}

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setCatalogPage(1);
            }}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategory === "" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => {
                setSelectedCategory(category._id);
                setCatalogPage(1);
              }}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategory === category._id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {catalogLoading ? (
          <ProductGridSkeleton count={CATALOG_LIMIT} />
        ) : expandedCatalogProducts.length ? (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <ProductGrid key="grid" className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5 transition-all duration-200">
                {expandedCatalogProducts.map((product) => (
                  <motion.div key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </ProductGrid>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 transition-all duration-200">
                {expandedCatalogProducts.map((product) => (
                  <ProductListItem key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="rounded-xl border border-border bg-card py-10 text-center text-muted">No products found.</div>
        )}

        {catalogPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <button type="button" disabled={catalogPage <= 1} onClick={() => setCatalogPage((prev) => prev - 1)} className="rounded-xl border border-border px-4 py-2 text-sm text-fg disabled:cursor-not-allowed disabled:opacity-50">
              Previous
            </button>
            <span className="px-2 py-2 text-sm text-muted">Page {catalogPage} of {catalogPages}</span>
            <button type="button" disabled={catalogPage >= catalogPages} onClick={() => setCatalogPage((prev) => prev + 1)} className="rounded-xl border border-border px-4 py-2 text-sm text-fg disabled:cursor-not-allowed disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </section>
    </motion.div>
  );
}

