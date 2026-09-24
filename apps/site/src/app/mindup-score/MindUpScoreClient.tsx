"use client";

import dynamic from "next/dynamic";
import "./mindup-score.css";

const MindUpGame = dynamic(() => import("@/components/mindup-score/MindUpGame"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#fffdf2] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d21a1] border-t-transparent" />
    </div>
  ),
});

export default function MindUpScoreClient() {
  return <MindUpGame />;
}
