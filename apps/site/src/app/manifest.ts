import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sagar Lad — Author & Keynote Speaker",
    short_name: "Sagar Lad",
    description:
      "Official website of Sagar Lad — Published Author of 6+ books, TEDx Speaker, and Data & AI Architect.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d21a1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
