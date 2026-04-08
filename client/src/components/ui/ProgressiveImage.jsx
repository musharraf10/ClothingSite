import { useState } from "react";

export function ProgressiveImage({ src, alt, className = "", ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`transition duration-500 ${loaded ? "scale-100 blur-0 opacity-100" : "scale-[1.02] blur-sm opacity-75"} ${className}`}
      {...props}
    />
  );
}

