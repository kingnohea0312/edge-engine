"use client";
import { useEffect } from "react";

/** Fire-and-forget: locks the upcoming card's picks the first time anyone views it
 *  (pre-event, so it's a genuine pre-fight snapshot). No-op once locked. */
export default function LockOnView({ evId }: { evId: string }) {
  useEffect(() => {
    fetch(`/api/lock/${evId}`).catch(() => {});
  }, [evId]);
  return null;
}
