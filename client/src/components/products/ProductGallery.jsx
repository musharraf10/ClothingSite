import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export function ProductGallery({ images = [], alt, variantKey }) {
  const safeImages = useMemo(() => images.filter(Boolean).slice(0, 6), [images]);

  const fixedIndex = 0; // Always the first image in grid 2
  const [primaryIndex, setPrimaryIndex] = useState(safeImages[1] ? 1 : 0);

  useEffect(() => {
    setPrimaryIndex(safeImages[1] ? 1 : 0);
  }, [variantKey, safeImages.join("|")]);

  const thumbnails = useMemo(
    () => safeImages
      .map((img, index) => ({ img, index }))
      .filter(({ index }) => index !== primaryIndex && index !== fixedIndex),
    [safeImages, primaryIndex, fixedIndex],
  );

  const handleSelectImage = (index) => {
    if (index === primaryIndex || index === fixedIndex) return;
    setPrimaryIndex(index);
  };

  return (
    <div className="max-h-[72vh] h-full min-h-0">
      <div className="grid gap-3 h-full min-h-0 lg:grid-cols-[1.25fr_1.25fr_0.7fr]">
        {safeImages[fixedIndex] ? (
          <div className="rounded-[10px] overflow-hidden bg-neutral-900 min-h-0">
            <img src={safeImages[fixedIndex]} className="w-full h-full object-cover" alt={alt} />
          </div>
        ) : null}

        {safeImages[primaryIndex] ? (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-[10px] overflow-hidden bg-neutral-900 min-h-0"
          >
            <img src={safeImages[primaryIndex]} className="w-full h-full object-cover" alt={alt} />
          </motion.div>
        ) : null}

        <div className="grid gap-3 h-full min-h-0 auto-rows-fr">
          {thumbnails.map(({ img, index }) => (
            <motion.button
              key={`${img}-${index}`}
              type="button"
              onClick={() => handleSelectImage(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className=" overflow-hidden"
            >
              <div className="aspect-square overflow-hidden bg-neutral-900">
                <img src={img} className="w-full h-full object-cover" alt={alt} />
              </div>
            </motion.button>
          ))}
          {Array.from({ length: Math.max(0, 4 - thumbnails.length) }).map((_, emptyIndex) => (
            <div key={`empty-${emptyIndex}`} className="rounded-2xl bg-neutral-900 aspect-square" />
          ))}
        </div>
      </div>
    </div>
  );
}