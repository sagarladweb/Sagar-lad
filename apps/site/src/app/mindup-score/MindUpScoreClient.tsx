"use client";

import dynamic from "next/dynamic";

const MindUpApp = dynamic(() => import("@/components/mindup-score/MindUpApp"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2454d9] border-t-transparent" />
    </div>
  ),
});

export function MindUpScoreClient() {
  return <MindUpApp />;
}
