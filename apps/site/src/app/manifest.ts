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
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
