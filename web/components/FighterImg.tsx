"use client";
import { useState } from "react";
import { headshotUrl, stanceUrl, SILHOUETTE } from "@/lib/images";

/** Image with the original fallback chain: stance → headshot → silhouette. */
export default function FighterImg({
  id,
  variant = "headshot",
  side = "left",
  alt = "",
  className,
}: {
  id: string;
  variant?: "headshot" | "stance";
  side?: "left" | "right";
  alt?: string;
  className?: string;
}) {
  const chain =
    variant === "stance"
      ? [stanceUrl(id, side), headshotUrl(id), SILHOUETTE]
      : [headshotUrl(id), SILHOUETTE];
  const [i, setI] = useState(0);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={chain[i]}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setI((x) => Math.min(x + 1, chain.length - 1))}
    />
  );
}
