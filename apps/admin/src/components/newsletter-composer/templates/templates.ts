import { createBlocks, type BlockSpec } from "@/components/newsletter-composer/lib/blockFactory";
import type { Template } from "@/components/newsletter-composer/types/editor";

export type { Template };

export const TEMPLATES: Template[] = [
  {
    id: "deep-dive",
    name: "Deep Dive",
    category: "Sagar Lad Originals",
    description:
      "One long-form essay: hero, argument, pull quote, data, reading list and sign-off.",
    tags: ["essay", "long-form", "hero", "reading list"],
    readingTime: 8,
    kind: "original",
    theme: {
      cover: { from: "#EEF2FF", to: "#FFFFFF", accent: "#1D4ED8" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Issue 04 · Deep dive",
            title: "The quiet power of shipping small",
            subtitle:
              "Why the smallest possible release is the only reliable way to learn what your audience actually wants.",
            issue: "04",
            date: "September 13, 2026",
            ctaLabel: "Read the issue",
            secondaryLabel: "Share",
          },
        ],
        [
          "heading",
          {
            eyebrow: "The idea",
            text: "Small beats impressive, every single time",
            level: "h2",
            highlight: "Small, impressive",
          },
        ],
        [
          "paragraph",
          {
            text: "There's a version of ambition that looks like writing a manifesto. And there's a version that looks like shipping a two-paragraph email on a Tuesday afternoon. Only one of them compounds.",
          },
        ],
        ["heading", { text: "Small beats impressive", level: "h2", eyebrow: "The idea" }],
        [
          "paragraph",
          {
            text: "Every extra week of polish is a week where nobody tells you the thing you most need to hear: that the idea is either working or it isn't. Small releases are not a compromise on quality — they're a bet on feedback speed.",
          },
        ],
        [
          "quote",
          {
            quote: "You don't learn from the draft. You learn from the send button.",
            author: "Ada Sterling",
            role: "Editor, The Long Game",
            tone: "bar",
          },
        ],
        ["heading", { text: "What the numbers say", level: "h3" }],
        [
          "stats",
          {
            items: [
              { value: "12", label: "Issues shipped" },
              { value: "48%", label: "Avg. open rate" },
              { value: "3.2x", label: "List growth" },
            ],
          },
        ],
        [
          "callout",
          {
            emoji: "👉",
            title: "Worth trying this week",
            body: "Open your last issue and delete the first two paragraphs. The real opening is almost always on line three.",
            tone: "tip",
          },
        ],
        ["divider", { variant: "ornament" }],
        ["heading", { text: "Also worth reading", level: "h3", eyebrow: "Reading list" }],
        [
          "readingList",
          {
            title: "Five links that shaped this issue",
            items: [
              {
                title: "The cost of context switching",
                source: "Farnam Street",
                url: "https://example.com",
                description: "Why deep work needs longer blocks than you think.",
              },
              {
                title: "Newsletters as a product",
                source: "Lenny's Newsletter",
                url: "https://example.com",
                description: "Treat your list like a real product surface, not a broadcast.",
              },
              {
                title: "Writing for skimmers",
                source: "Dense Discovery",
                url: "https://example.com",
                description: "Format the piece so it survives a 40-second skim.",
              },
            ],
          },
        ],
        [
          "button",
          { label: "Read the full essay", url: "https://example.com", icon: "arrow", align: "center" },
        ],
        [
          "signature",
          {
            text: "Thanks for reading — see you next Tuesday.",
            name: "Sagar",
            role: "Sagar Lad",
          },
        ],
        ["footer", {}],
      ] as BlockSpec[]),
  },

  {
    id: "weekly-roundup",
    name: "Weekly Roundup",
    category: "Creator",
    description:
      "A curation issue: the short list, one featured piece, the week's signal and noise, plus resources.",
    tags: ["roundup", "curation", "links", "weekly"],
    readingTime: 5,
    featured: true,
    cover: { from: "#FDF9EA", to: "#FFFFFF", accent: "#B45309" },
    theme: {
      cover: { from: "#FDF9EA", to: "#FFFFFF", accent: "#B45309" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Issue 27 · Roundup",
            title: "Five things worth your attention this week",
            subtitle:
              "Everything I read, used or argued with over the last seven days — cut down to what actually mattered.",
            issue: "27",
            date: "September 13, 2026",
            ctaLabel: "Skip to the list",
            secondaryLabel: "Forward this",
          },
        ],
        [
          "paragraph",
          {
            text: "<p>Short issue this week — I spent most of it rewriting the onboarding flow and far too little of it reading. The five things below earned their place anyway.</p>",
          },
        ],
        [
          "heading",
          { eyebrow: "The list", text: "Start here", level: "h2" },
        ],
        [
          "list",
          {
            style: "number",
            items: [
              { text: "A pricing page teardown that changed how I frame plans." },
              { text: "The essay on shipping cadence I keep re-reading." },
              { text: "A one-hour podcast on distribution, no filler." },
              { text: "The Figma plugin that removed a whole afternoon of work." },
              { text: "A short book on editing that applies to email." },
            ],
          },
        ],
        [
          "card",
          {
            eyebrow: "This week's featured",
            title: "Systems beat motivation",
            body: "The reason your best writing happens on a schedule and not when you feel ready — and how to build the schedule.",
            linkLabel: "Read the piece",
            linkUrl: "https://example.com",
          },
        ],
        [
          "columns2",
          {
            columns: [
              {
                heading: "Signal",
                body: "Two long-form reads, one tool I now use daily, and a clear pattern in this week's replies.",
              },
              {
                heading: "Noise",
                body: "The launch everyone posted about, three AI takes that said nothing, and one podcast I bailed on.",
              },
            ],
          },
        ],
        [
          "tweet",
          {
            name: "Ada Sterling",
            handle: "@adasterling",
            body: "Shipped issue 52 today. The trick was never the writing — it was the deadline.",
            date: "Sep 12, 2026",
            likes: "1.2K",
            reposts: "184",
            url: "https://x.com",
          },
        ],
        [
          "resources",
          {
            title: "Things you can take with you",
            items: [
              {
                title: "Newsletter launch checklist",
                type: "PDF",
                url: "https://example.com",
                description: "The exact eighteen steps used to launch this list.",
              },
              {
                title: "Editorial calendar template",
                type: "Notion",
                url: "https://example.com",
                description: "Plan twelve issues in about twenty minutes.",
              },
            ],
          },
        ],
        ["divider", { variant: "dashed", label: "That's the week" }],
        ["spacer", { height: 32 }],
        [
          "social",
          {
            title: "Find me elsewhere",
            alignCenter: true,
            items: [
              { platform: "x", url: "https://x.com" },
              { platform: "linkedin", url: "https://linkedin.com" },
              { platform: "website", url: "https://example.com" },
            ],
          },
        ],
        [
          "subscribe",
          {
            title: "Never miss a roundup",
            body: "One short list, every Tuesday. Free, and easy to unsubscribe from.",
            placeholder: "you@company.com",
            buttonLabel: "Subscribe",
            note: "Join 12,480 readers",
          },
        ],
        [
          "footer",
          {
            note: "Sagar Lad · Weekly Roundup",
            unsubscribeLabel: "Unsubscribe",
            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },

  {
    id: "founder-letter",
    name: "Founder Letter",
    category: "Personal",
    description:
      "A candid note from the desk: progress, one hard lesson, a short timeline and a personal close.",
    tags: ["personal", "founder", "letter", "behind the scenes"],
    readingTime: 4,
    featured: true,
    cover: { from: "#F5F3FF", to: "#FFFFFF", accent: "#7C3AED" },
    theme: {
      cover: { from: "#F5F3FF", to: "#FFFFFF", accent: "#7C3AED" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "A note from the desk",
            title: "We deleted the feature everyone asked for",
            subtitle:
              "Twelve weeks of work, one honest conversation with users, and the decision that finally made the product feel simple.",
            issue: "11",
            date: "September 13, 2026",
            ctaLabel: "Read the note",
            secondaryLabel: "Reply to me",
          },
        ],
        [
          "heading",
          { eyebrow: "The context", text: "Why we built it in the first place", level: "h2" },
        ],
        [
          "paragraph",
          {
            text: "<p>For most of this year the roadmap was set by the loudest request in the inbox. It shipped, people clicked it once, and nobody came back to it a second time.</p><p><em>The feature was not broken. It was simply in the way.</em></p>",
          },
        ],
        [
          "highlight",
          {
            emoji: "💡",
            text: "The best product decision we made this year was a deletion.",
          },
        ],
        [
          "image",
          {
            caption: "The old flow, four screens long, versus the one we shipped.",
            credit: "Photo: Sagar Lad",
            ratio: "16/9",
          },
        ],
        [
          "timeline",
          {
            items: [
              {
                date: "January",
                title: "Started building",
                body: "Two weeks of design, then straight into code.",
                color: "#1D4ED8",
              },
              {
                date: "April",
                title: "First honest feedback",
                body: "Six calls. Nobody described the feature unprompted.",
                color: "#F5C542",
              },
              {
                date: "July",
                title: "Decided to cut it",
                body: "The hardest meeting of the quarter, and the shortest.",
                color: "#DC2626",
              },
              {
                date: "September",
                title: "Shipped the simple version",
                body: "Onboarding time dropped from nine minutes to two.",
                color: "#059669",
              },
            ],
          },
        ],
        [
          "quote",
          {
            quote:
              "Simplicity is not what's left after you remove things. It's what's left after you decide what the product is for.",
            author: "Sagar Lad",
            role: "Author & Speaker",
            tone: "centered",
          },
        ],
        [
          "heading",
          { eyebrow: "What's next", text: "Three things I'm doing differently", level: "h3" },
        ],
        [
          "checklist",
          {
            items: [
              { text: "Ask what people stopped using, not what they want next", done: true },
              { text: "Ship the smallest version behind a flag", done: true },
              { text: "Write the changelog before the code", done: false },
            ],
          },
        ],
        [
          "button",
          {
            label: "Read the full changelog",
            url: "https://example.com",
            icon: "arrow",
            variant: "outline",
            align: "left",
          },
        ],
        [
          "authorCard",
          {
            name: "Sagar Lad",
            role: "Author & Speaker",
            bio: "Building a small studio in public. I write one honest letter a month about what broke and what worked.",
            twitter: "https://x.com",
            linkedin: "https://linkedin.com",
          },
        ],
        [
          "signature",
          {
            text: "If this resonated, just hit reply — I read everything.",
            name: "Sagar",
            role: "Author & Speaker",
            signatureStyle: true,
          },
        ],
        [
          "footer",
          {
            note: "Sagar Lad · Founder Letter",            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },


  {
    id: "product-launch",
    name: "Product Launch",
    category: "Startup",
    description:
      "An announcement issue: hero banner, what's new, feature grid, comparison table, demo video and a clear CTA.",
    tags: ["launch", "announcement", "product", "features"],
    readingTime: 6,
    featured: true,
    cover: { from: "#EFF6FF", to: "#FFFFFF", accent: "#1D4ED8" },
    theme: {
      cover: { from: "#EFF6FF", to: "#FFFFFF", accent: "#1D4ED8" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Launch day",
            title: "Composer 2.0 is live",
            subtitle:
              "Drag any block, restyle it without touching code, and publish an issue you're proud of in under ten minutes.",
            issue: "30",
            date: "September 13, 2026",
            ctaLabel: "Try it now",
            secondaryLabel: "Watch the demo",
          },
        ],
        [
          "banner",
          {
            title: "Built for the people who ship",
            subtitle: "A faster canvas, a smarter inspector and a template library that reads like a magazine.",
            height: 260,
            overlay: 0.3,
          },
        ],
        ["heading", { eyebrow: "What's new", text: "Three changes you'll feel immediately", level: "h2" }],
        [
          "columns3",
          {
            columns: [
              { heading: "Faster canvas", body: "Drag, drop and reorder without the jitter." },
              { heading: "Smarter inspector", body: "Only the controls that block actually needs." },
              { heading: "Real templates", body: "Finished issues, not empty placeholders." },
            ],
          },
        ],
        [
          "featureGrid",
          {
            title: "Everything in the box",
            columns: "3",
            items: [
              { emoji: "⚡", title: "Quick insert", body: "Hit slash anywhere and drop a block in." },
              { emoji: "🎯", title: "Live editing", body: "Every change renders exactly as it sends." },
              { emoji: "🧩", title: "Composable", body: "Swap sections without rewriting the issue." },
              { emoji: "📐", title: "Design controls", body: "Type, spacing and color, block by block." },
              { emoji: "🔍", title: "Pre-flight checks", body: "Contrast, alt text and width warnings." },
              { emoji: "📈", title: "Built to measure", body: "UTM builder for every call to action." },
            ],
          },
        ],
        [
          "table",
          {
            headers: [{ text: "Capability" }, { text: "Composer 1" }, { text: "Composer 2" }],
            rows: [
              { cells: "Blocks|28|36" },
              { cells: "Templates|4|5 curated" },
              { cells: "Undo depth|10|80 steps" },
              { cells: "Publish time|~25 min|~8 min" },
            ],
            striped: true,
          },
        ],
        [
          "video",
          {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            title: "Two-minute walkthrough",
            caption: "See the new canvas, inspector and template library.",
          },
        ],
        [
          "callout",
          {
            emoji: "ℹ️",
            tone: "info",
            title: "Migration is automatic",
            body: "Existing issues open with the same layout, content and links. Nothing to move by hand.",
          },
        ],
        [
          "checklist",
          {
            items: [
              { text: "Duplicate an issue to keep a template", done: true },
              { text: "Set your UTM defaults once", done: true },
              { text: "Run the pre-flight checks before sending", done: false },
            ],
          },
        ],
        [
          "heading",
          { eyebrow: "For developers", text: "Same API, same webhooks", level: "h3" },
        ],
        [
          "code",
          {
            language: "typescript",
            code: `const issue = await composer.publish({
  title: "Composer 2.0 is live",
  blocks: 36,
  scheduled: "2026-09-15T09:00:00Z",
});`,
          },
        ],
        [
          "button",
          {
            label: "Open Composer 2.0",
            url: "https://example.com",
            icon: "external",
            variant: "primary",
            align: "center",
          },
        ],
        [
          "subscribe",
          {
            title: "Get the launch notes",
            body: "Product updates and the occasional peak behind the build. One email a month.",
            placeholder: "you@company.com",
            buttonLabel: "Keep me posted",
            note: "No spam — unsubscribe in one click",
          },
        ],
        [
          "footer",
          {
            note: "Sagar Lad · Newsletter",
            address: "123 Market Street, Suite 400, San Francisco, CA",
            unsubscribeLabel: "Unsubscribe",
            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },

  {
    id: "travel-journal",
    name: "Travel Journal",
    category: "Travel",
    description:
      "A visual field diary: photo grid, animated frames, a route timeline, reader questions and a share prompt.",
    tags: ["travel", "photos", "journal", "gallery"],
    readingTime: 7,
    cover: { from: "#ECFDF5", to: "#FFFFFF", accent: "#059669" },
    theme: {
      cover: { from: "#ECFDF5", to: "#FFFFFF", accent: "#059669" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Field notes · Kyoto",
            title: "Eleven days in Kyoto, one carry-on bag",
            subtitle:
              "Notes on temples at 6am, the best convenience-store coffee in Japan, and why I stopped photographing everything.",
            issue: "18",
            date: "September 13, 2026",
            ctaLabel: "Start the diary",
            secondaryLabel: "Share the route",
          },
        ],
        ["heading", { eyebrow: "Day one", text: "Arriving without a plan", level: "h2" }],
        [
          "paragraph",
          {
            text: "<p>I landed at Kansai with a list of eleven places and no bookings. The list lasted about four hours. What replaced it was better: walking until something looked worth stopping for.</p>",
          },
        ],
        [
          "gallery",
          {
            columns: "2",
            items: [
              { caption: "Fushimi Inari at 6:40am — nobody else there." },
              { caption: "The alley behind Nishiki market." },
              { caption: "Platform 3, Arashiyama line." },
              { caption: "Rain, and the best udon of the trip." },
            ],
          },
        ],
        [
          "gif",
          {
            alt: "Lanterns swaying outside a Gion teahouse",
            caption: "Lanterns, Gion — the only animation I kept.",
          },
        ],
        [
          "image",
          {
            caption: "Philosopher's Path, an hour before the crowds.",
            credit: "Photo: Sagar Lad",
            ratio: "16/9",
          },
        ],
        [
          "timeline",
          {
            items: [
              { date: "Day 1–3", title: "Kyoto central", body: "Temples, markets, and far too much walking.", color: "#059669" },
              { date: "Day 4–6", title: "Arashiyama", body: "Bamboo, river boats, and a quiet ryokan.", color: "#1D4ED8" },
              { date: "Day 7–9", title: "Nara day trips", body: "Deer, a five-storey pagoda and no crowds.", color: "#F5C542" },
              { date: "Day 10–11", title: "Osaka", body: "Street food, then the flight home.", color: "#DC2626" },
            ],
          },
        ],
        [
          "richtext",
          {
            html: "<p>Three things I would do again, and one I would skip:</p><ul><li><strong>Go at dawn.</strong> Every famous site is a different place before 7am.</li><li><strong>Eat at the counter.</strong> Standing bars had the best food of the trip.</li><li><strong>Carry less.</strong> The bag got lighter every day.</li></ul><p><em>Skip:</em> the bus tour. The train does the same route in half the time.</p>",
          },
        ],
        ["divider", { variant: "dotted" }],
        ["subheading", { text: "Reader questions" }],
        [
          "faq",
          {
            title: "Asked and answered",
            style: "bordered",
            expandFirst: true,
            items: [
              {
                question: "What did the whole trip cost?",
                answer:
                  "About $2,100 including flights, staying in small ryokans rather than hotels.",
              },
              {
                question: "How did you shoot the photos?",
                answer:
                  "One 35mm prime on a mirrorless body. No tripod, no edits beyond cropping.",
              },
              {
                question: "Would you go in September again?",
                answer:
                  "Yes — shoulder season meant shorter queues and cooler mornings.",
              },
            ],
          },
        ],
        ["spacer", { height: 24 }],
        [
          "share",
          {
            title: "Know someone going to Japan?",
            body: "Forward this issue — it's the shortlist I wish I'd had before booking.",
            url: "https://sagarlad.com/newsletter",
            networks: "x,linkedin,email",
            ctaLabel: "Share the diary",
          },
        ],
        [
          "social",
          {
            title: "More frames on the networks",
            alignCenter: false,
            items: [
              { platform: "instagram", url: "https://instagram.com" },
              { platform: "x", url: "https://x.com" },
              { platform: "youtube", url: "https://youtube.com" },
            ],
          },
        ],
        [
          "readingList",
          {
            title: "If you're planning a trip",
            items: [
              {
                title: "The 11-day Kyoto itinerary",
                source: "Sagar Lad Notes",
                url: "https://example.com",
                description: "Every stop from this issue, in order, with times.",
              },
              {
                title: "Packing for one carry-on",
                source: "Pack Light",
                url: "https://example.com",
                description: "The list I actually used, twice.",
              },
            ],
          },
        ],
        [
          "footer",
          {
            note: "Sagar Lad · Travel Journal",
            address: "123 Market Street, Suite 400, San Francisco, CA",
            unsubscribeLabel: "Unsubscribe",
            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },

  /* ================================================================
   *  TEMPLATE 6 — The Weekly Digest
   *  A comprehensive weekly roundup showcasing everything Sagar creates:
   *  blogs, videos, published books, reading list, quotes, social.
   *  Editorial blue/indigo theme. Perfect for subscribers who want
   *  the full picture in one issue.
   * ================================================================ */
  {
    id: "weekly-digest",
    name: "The Weekly Digest",
    category: "Featured",
    description:
      "A comprehensive weekly roundup: latest blogs, videos, published books, reading list, quotes and social links — everything in one issue.",
    tags: ["weekly", "digest", "roundup", "comprehensive", "all-content"],
    readingTime: 6,
    featured: true,
    cover: { from: "#EEF2FF", to: "#FFFFFF", accent: "#1D4ED8" },
    theme: {
      cover: { from: "#EEF2FF", to: "#FFFFFF", accent: "#1D4ED8" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        /* ── 1. Hero ── */
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Issue 32 · Weekly Digest",
            title: "Everything you might have missed this week",
            subtitle:
              "A single issue covering blogs, videos, books, quotes and more — curated so you don't have to scroll.",
            issue: "32",
            date: "September 15, 2026",
            ctaLabel: "Jump to what's new",
            secondaryLabel: "Forward this digest",
          },
        ],

        /* ── 2. Opening note ── */
        [
          "paragraph",
          {
            text: "Quick note before we dive in — I've been writing more frequently lately and the library keeps growing. This digest is the shortcut: one issue, everything new, zero scrolling required.",
          },
        ],

        /* ── 3. Stats ── */
        [
          "stats",
          {
            items: [
              { value: "6+", label: "Books published" },
              { value: "120+", label: "Blog posts" },
              { value: "50+", label: "Videos created" },
              { value: "48%", label: "Avg. open rate" },
            ],
          },
        ],

        ["divider", { variant: "ornament" }],

        /* ── 4. Latest Blog Posts (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "From the blog",
            text: "Latest posts",
            level: "h2",
            highlight: "Latest, posts",
          },
        ],
        [
          "blogPosts",
          {
            title: "Fresh from the blog",
            selectedIds: [],
          },
        ],

        ["divider", { variant: "dashed" }],

        /* ── 5. Featured Video (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Watch this week",
            text: "Featured video",
            level: "h2",
          },
        ],
        [
          "videoFeed",
          {
            title: "Latest videos",
            selectedIds: [],
          },
        ],

        ["divider", { variant: "ornament" }],

        /* ── 6. Published Books (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Books I Published",
            text: "Available now",
            level: "h2",
            highlight: "Available, now",
          },
        ],
        [
          "booksPublished",
          {
            title: "Published Books",
            selectedIds: [],
          },
        ],

        /* ── 7. Reading List (with thumbnails) ── */
        [
          "heading",
          {
            eyebrow: "What I'm reading",
            text: "This week's reading list",
            level: "h3",
          },
        ],
        [
          "readingList",
          {
            title: "Five things worth your time",
            items: [
              {
                title: "The cost of context switching",
                source: "Farnam Street",
                url: "https://example.com",
                thumb: "",
                description: "Why deep work needs longer blocks than you think.",
              },
              {
                title: "Newsletters as a product",
                source: "Lenny's Newsletter",
                url: "https://example.com",
                thumb: "",
                description: "Treat your list like a real product surface, not a broadcast.",
              },
              {
                title: "Writing for skimmers",
                source: "Dense Discovery",
                url: "https://example.com",
                thumb: "",
                description: "Format the piece so it survives a 40-second skim.",
              },
            ],
          },
        ],

        ["divider", { variant: "dashed" }],

        /* ── 8. Quotes (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Words of belief",
            text: "Quotes to live by",
            level: "h2",
          },
        ],
        [
          "quotes",
          {
            title: "Quotes to Live By",
            selectedIds: [],
          },
        ],

        ["spacer", { height: 16 }],

        /* ── 9. Social Links ── */
        [
          "social",
          {
            title: "Find me on the platforms",
            alignCenter: true,
            items: [
              { platform: "instagram", url: "https://www.instagram.com/grow_with__sagar/" },
              { platform: "youtube", url: "https://www.youtube.com/@Sagarlad692" },
              { platform: "linkedin", url: "https://www.linkedin.com/in/sagarlad/" },
              { platform: "x", url: "https://x.com/SagarLad692" },
            ],
          },
        ],

        /* ── 10. Subscribe ── */
        [
          "subscribe",
          {
            title: "Never miss a digest",
            body: "One issue, everything new, every week. Free, and easy to unsubscribe from.",
            placeholder: "you@company.com",
            buttonLabel: "Subscribe to the digest",
            note: "Join 12,480 readers",
          },
        ],

        /* ── 11. Footer ── */
        [
          "footer",
          {
            note: "Sagar Lad · Weekly Digest",
            address: "Sagar Lad Official, Mumbai, India",
            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },

  /* ================================================================
   *  TEMPLATE 7 — Mind Up Monthly
   *  A personal, thoughtful monthly letter from Sagar. Warm amber/gold
   *  theme. Includes: hero, personal essay, published books, e-books,
   *  videos I've watched, a quote, author card, and social links.
   *  Designed for depth over breadth — one idea explored properly.
   * ================================================================ */
  {
    id: "mind-up-monthly",
    name: "Mind Up Monthly",
    category: "Sagar Lad Originals",
    description:
      "A personal monthly letter: one essay, published books, e-books, videos, quotes and a behind-the-scenes author card. Warm, thoughtful, in-depth.",
    tags: ["monthly", "personal", "essay", "books", "mind-up"],
    readingTime: 7,
    cover: { from: "#FFFBEB", to: "#FFFFFF", accent: "#B45309" },
    theme: {
      cover: { from: "#FFFBEB", to: "#FFFFFF", accent: "#B45309" },
      spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
      typography: {
        fontFamily: "sans",
        headingFontFamily: "serif",
        bodySize: 17,
        headingSize: 40,
        lineHeight: 1.7,
      },
    },
    blocks: () =>
      createBlocks([
        /* ── 1. Hero ── */
        [
          "hero",
          {
            logo: "Sagar Lad",
            showLogo: true,
            eyebrow: "Mind Up Monthly · Issue 09",
            title: "The one skill that changes everything",
            subtitle:
              "Why self-awareness is not a soft skill — it's the operating system every other skill runs on.",
            issue: "09",
            date: "September 15, 2026",
            ctaLabel: "Read the letter",
            secondaryLabel: "Share with a friend",
          },
        ],

        /* ── 2. Personal note ── */
        [
          "paragraph",
          {
            text: "I've been thinking about something all month — the gap between knowing something and actually living it. We all have that gap. Mine has been embarrassing lately. I teach self-awareness and I still catch myself reacting on autopilot at least twice a day.",
          },
        ],

        /* ── 3. Highlight ── */
        [
          "highlight",
          {
            emoji: "💡",
            text: "Self-awareness is not about being perfect. It's about noticing when you're not — and choosing differently next time.",
          },
        ],

        /* ── 4. Published Books (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Books I Published",
            text: "My published works",
            level: "h2",
            highlight: "published, works",
          },
        ],
        [
          "booksPublished",
          {
            title: "Available now",
            selectedIds: [],
          },
        ],

        ["divider", { variant: "dashed", label: "From the library" }],

        /* ── 5. E-books (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Free downloads",
            text: "E-books & guides",
            level: "h2",
          },
        ],
        [
          "ebooks",
          {
            title: "Free E-books",
            selectedIds: [],
          },
        ],

        /* ── 6. Video (database-backed) ── */
        [
          "heading",
          {
            eyebrow: "Watch",
            text: "A video that stuck with me",
            level: "h2",
          },
        ],
        [
          "videoFeed",
          {
            title: "Worth watching",
            selectedIds: [],
          },
        ],

        ["divider", { variant: "ornament" }],

        /* ── 7. Quote ── */
        [
          "quote",
          {
            quote:
              "You don't become what you want. You become what you believe you deserve. And what you believe is shaped by the stories you tell yourself every single day.",
            author: "Sagar Lad",
            role: "Author & Speaker",
            tone: "card",
          },
        ],

        /* ── 8. What I'm reading ── */
        [
          "heading",
          {
            eyebrow: "Reading list",
            text: "What I read this month",
            level: "h3",
          },
        ],
        [
          "readingList",
          {
            title: "Monthly reads",
            items: [
              {
                title: "The Psychology of Money",
                source: "Morgan Housel",
                url: "https://example.com",
                thumb: "",
                description: "Timeless lessons on wealth, greed and happiness.",
              },
              {
                title: "Atomic Habits",
                source: "James Clear",
                url: "https://example.com",
                thumb: "",
                description: "An easy & proven way to build good habits & break bad ones.",
              },
            ],
          },
        ],

        /* ── 9. Author Card ── */
        [
          "authorCard",
          {
            name: "Sagar Lad",
            role: "Author & Speaker",
            bio: "Data & AI Architect, TEDx Speaker, and published author of 6+ books. I write about self-awareness, mindset and the intersection of technology and human potential.",
            twitter: "https://x.com/SagarLad692",
            linkedin: "https://www.linkedin.com/in/sagarlad/",
            website: "https://sagarlad.com",
          },
        ],

        /* ── 10. Share ── */
        [
          "share",
          {
            title: "Know someone who needs this?",
            body: "Forward this issue — it might be the nudge they need this month.",
            url: "https://sagarlad.com/newsletter",
            networks: "x,linkedin,email",
            ctaLabel: "Share this letter",
          },
        ],

        /* ── 11. Social Links ── */
        [
          "social",
          {
            title: "Connect with me",
            alignCenter: true,
            items: [
              { platform: "instagram", url: "https://www.instagram.com/grow_with__sagar/" },
              { platform: "youtube", url: "https://www.youtube.com/@Sagarlad692" },
              { platform: "linkedin", url: "https://www.linkedin.com/in/sagarlad/" },
              { platform: "x", url: "https://x.com/SagarLad692" },
            ],
          },
        ],

        /* ── 12. Signature ── */
        [
          "signature",
          {
            text: "If this resonated, just hit reply — I read everything.",
            name: "Sagar",
            role: "Author & Speaker",
            signatureStyle: true,
          },
        ],

        /* ── 13. Footer ── */
        [
          "footer",
          {
            note: "Sagar Lad · Mind Up Monthly",
            address: "Sagar Lad Official, Mumbai, India",
            copyright: "© 2026 Sagar Lad. All rights reserved.",
          },
        ],
      ] as BlockSpec[]),
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
