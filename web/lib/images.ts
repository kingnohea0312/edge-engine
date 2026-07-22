/** Client-safe image URL helpers (no server imports). */
export const headshotUrl = (id: string | number) =>
  `https://a.espncdn.com/i/headshots/mma/players/full/${id}.png`;
export const stanceUrl = (id: string | number, side: "left" | "right") =>
  `https://a.espncdn.com/i/headshots/mma/players/stance/${side}/${id}.png`;
export const SILHOUETTE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="none"/><circle cx="50" cy="34" r="16" fill="#2a2529"/><path d="M18 92c2-22 15-32 32-32s30 10 32 32z" fill="#2a2529"/></svg>`,
  );
