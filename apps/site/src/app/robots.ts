import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: ["/admin", "/api/", "/announcements/", "/sandbox"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
