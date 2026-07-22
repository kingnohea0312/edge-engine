import { cached, HOUR } from "@/lib/cache";
import { aggregate } from "@/lib/engine/aggregate";
import type { Profile } from "@/lib/engine/types";
import { getBio, getHistory } from "./espn";

/**
 * Server-side profile cache: the per-fighter archive sweep (≤20 fights) runs once
 * and is shared across every visitor, so a matchup page loads instantly on repeat
 * views. Ports the original client `profCache`.
 */
export async function getProfile(id: string): Promise<Profile> {
  return cached<Profile>("profile:" + id, 6 * HOUR, async () => {
    const [bio, hist] = await Promise.all([getBio(id), getHistory(id)]);
    return { bio, hist, agg: aggregate(hist.fights) };
  });
}
