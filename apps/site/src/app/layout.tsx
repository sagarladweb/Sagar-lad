import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFrame } from "@/components/SiteFrame";
import { BrandingProvider } from "@/components/BrandingProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SITE } from "@/lib/site";
import { brandColors } from "@/lib/brand-colors";
import { HeartbeatMarker } from "@/components/HeartbeatMarker";
import { prisma } from "@/lib/db";

// Self-hosted fonts — never depend on Google Fonts being reachable at build
// or serve time, so CSS always loads. Files in src/app/fonts/.
const beVietnamPro = localFont({
  variable: "--font-be-vietnam-pro",
  src: [
    { path: "./fonts/bvp-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/bvp-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/bvp-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/bvp-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const rethinkSans = localFont({
  variable: "--font-rethink-sans",
  src: [
    { path: "./fonts/rethink-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/rethink-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/rethink-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/rethink-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/rethink-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

const greatVibes = localFont({
  variable: "--font-great-vibes",
  src: [
    { path: "./fonts/greatvibes-400.woff2", weight: "400", style: "normal" },
  ],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: brandColors.blue.hex,
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  keywords: [
    "Sagar Lad",
    "Author",
    "Keynote Speaker",
    "TEDx Speaker",
    "MIND UP",
    "Books",
    "Mentorship",
    "Human Potential Advocate",
  ],
  metadataBase: new URL(SITE.url),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": `${SITE.url}/rss.xml`,
    },
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary",
    title: SITE.title,
    description: SITE.description,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "theme-color": brandColors.blue.hex,
    "msapplication-TileColor": brandColors.blue.hex,
    "msapplication-navbutton-color": brandColors.blue.hex,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let announcement = null;
  try {
    announcement = await prisma.announcement.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        showBar: true,
        barText: true,
        barLink: true,
        buttonLink: true,
        barStyle: true,
        barSpeed: true,
        barBgColor: true,
        barColor: true,
      },
    });
  } catch {
    // DB unreachable — render without announcement bar
  }

  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${rethinkSans.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sagar Lad",
              url: "https://sagarlad.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://sagarlad.com/blog?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SiteNavigationElement",
              name: [
                "Home",
                "About",
                "Blog",
                "Books",
                "Speaking",
                "Mentorship",
                "Videos",
                "Newsletter",
                "Contact",
              ],
              url: [
                "https://sagarlad.com",
                "https://sagarlad.com/about",
                "https://sagarlad.com/blog",
                "https://sagarlad.com/books",
                "https://sagarlad.com/speaking",
                "https://sagarlad.com/mentorship",
                "https://sagarlad.com/videos",
                "https://sagarlad.com/newsletter",
                "https://sagarlad.com/contact",
              ],
            }),
          }}
        />
        <Script
          id="chunk-reload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  var target = e.target;
                  var isCssError = target && target.tagName === 'LINK' && target.rel === 'stylesheet';
                  var isScriptError = target && target.tagName === 'SCRIPT' && target.src && target.src.indexOf('/_next/static/') !== -1;
                  var isChunkMsg = e && e.message && (
                    e.message.indexOf('Loading chunk') !== -1 ||
                    e.message.indexOf('ChunkLoadError') !== -1 ||
                    e.message.indexOf('Loading CSS chunk') !== -1 ||
                    e.message.indexOf('Refused to apply style') !== -1
                  );
                  if (isCssError || isScriptError || isChunkMsg) {
                    var now = Date.now();
                    var last = parseInt(sessionStorage.getItem('chunk_reload_ts') || '0', 10);
                    if (now - last > 5000) {
                      sessionStorage.setItem('chunk_reload_ts', String(now));
                      window.location.reload();
                    }
                  }
                }, true);
              }
            `,
          }}
        />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ScrollToTop />
        <HeartbeatMarker />
        <BrandingProvider>
          <SiteFrame announcement={announcement}>{children}</SiteFrame>
        </BrandingProvider>
      </body>
    </html>
  );
}
