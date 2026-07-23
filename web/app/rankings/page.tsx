import type { Metadata } from "next";
import RankingsClient from "@/components/RankingsClient";

export const metadata: Metadata = {
  title: "UFC Rankings",
  description: "Official UFC divisional rankings and champions, with pound-for-pound.",
};

export default function RankingsPage() {
  return (
    <main>
      <div className="wrap wrap-narrow">
        <RankingsClient />
      </div>
    </main>
  );
}
