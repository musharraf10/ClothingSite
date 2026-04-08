import { useMemo, useState } from "react";
import { SizeChartModal } from "./SizeChartModal.jsx";

export function ProductVariants({
  variants = [],
  size,
  setSize,
  sizeChart,
}) {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants],
  );

  const orderedSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

  const sortedSizes = useMemo(() => {
    return [...allSizes].sort((a, b) => {
      const ai = orderedSizes.indexOf(a);
      const bi = orderedSizes.indexOf(b);

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;

      return ai - bi;
    });
  }, [allSizes]);

  const isOutOfStockForSize = (selectedSize) => {
    const relevant = variants.filter((variant) => variant.size === selectedSize);
    return relevant.length === 0 || relevant.reduce((sum, variant) => sum + (variant.stock || 0), 0) < 1;
  };

  return (
    <div className="space-y-4 text-sm font-sans">
      {sortedSizes.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-wider text-muted">Size</p>
            <button
              type="button"
              onClick={() => setShowSizeChart(true)}
              className="text-[11px] font-medium text-accent hover:opacity-80"
            >
              Size chart
            </button>
          </div>

          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(64px,1fr))]">
            {sortedSizes.map((variantSize) => {
              const out = isOutOfStockForSize(variantSize);
              const selected = size === variantSize;

              return (
                <button
                  key={variantSize}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSize((currentSize) => (currentSize === variantSize ? "" : variantSize));
                  }}
                  className={`min-h-[2.5rem] rounded-xl px-3 text-[11px] font-semibold transition-all ${selected
                    ? "bg-accent text-primary"
                    : "bg-card text-muted hover:text-fg"
                    } ${out ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                >
                  {variantSize}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SizeChartModal
        open={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        sizeChart={sizeChart}
      />
    </div>
  );
}
