"use client";

import { useState } from "react";

function LeafPlaceholder() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <rect width="200" height="200" fill="#F7F8F4" />
      <path
        d="M100 160 C100 110, 60 90, 45 45 C95 55, 115 90, 115 130 C115 145, 108 155, 100 160 Z"
        fill="#A4B089"
      />
      <path
        d="M100 160 C100 105, 145 85, 160 40 C110 50, 90 85, 90 125 C90 142, 95 153, 100 160 Z"
        fill="#6B7A54"
      />
      <path
        d="M100 160 L100 60"
        stroke="#3D4A31"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export default function PlantGallery({
  images,
  alt,
  categoryLabel,
  outOfStock,
}: {
  images: string[];
  alt: string;
  categoryLabel: string | null;
  outOfStock: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-soft">
        <LeafPlaceholder />
        {categoryLabel && (
          <span className="absolute left-4 top-4 rounded-full bg-bg/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-sage-deep">
            {categoryLabel}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-4 top-4 rounded-full bg-forest/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={alt}
          className="h-full w-full object-cover"
        />
        {categoryLabel && (
          <span className="absolute left-4 top-4 rounded-full bg-bg/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-sage-deep">
            {categoryLabel}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-4 top-4 rounded-full bg-forest/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white">
            Sold out
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === activeIndex}
              className={`aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                i === activeIndex
                  ? "border-sage-deep"
                  : "border-transparent hover:border-sage/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
