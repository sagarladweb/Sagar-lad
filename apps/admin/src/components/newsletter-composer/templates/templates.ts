import { createBlocks, type BlockSpec } from "@/components/newsletter-composer/lib/blockFactory";
import type { Template } from "@/components/newsletter-composer/types/editor";

export type { Template };

export const TEMPLATES: Template[] = [
  /* ================================================================
   *  TEMPLATE 1 — The Complete Issue
   *  Every single block type in one magazine-style newsletter.
   *  Warm gold / deep blue Sagar Lad branding.
   * ================================================================ */
  {
    id: "complete-issue",
    name: "The Complete Issue",
    category: "Sagar Lad Originals",
    description:
      "A full magazine-style issue showcasing every block type — hero, essay, media, data, database blocks, social, and more.",
    tags: ["complete", "showcase", "all-blocks", "magazine"],
    readingTime: 10,
    kind: "original",
    cover: { from: "#FFFBEB", to: "#FFFFFF", accent: "#ffd51d" },
    theme: {
      cover: { from: "#FFFBEB", to: "#FFFFFF", accent: "#ffd51d" },
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
        ["hero", {
          logo: "Sagar Lad", showLogo: true,
          eyebrow: "Issue 40 · The Complete Issue",
          title: "Every block, one newsletter",
          subtitle: "A single issue that showcases every building block available in the composer — from hero to footer.",
          issue: "40", date: "September 20, 2026",
          ctaLabel: "Read the issue", secondaryLabel: "Share this showcase",
        }],
        ["heading", { eyebrow: "The essay", text: "Why every block exists for a reason", level: "h2", highlight: "every block, reason" }],
        ["subheading", { text: "A system designed for real newsletters" }],
        ["paragraph", { text: "The best newsletters are not written in one pass. They're assembled — a strong opening, a well-placed quote, a visual break, a clear call to action. Each block in this issue exists because real creators asked for it." }],
        ["richtext", { html: "<p>Here's what makes a great newsletter issue:</p><ul><li><strong>Structure.</strong> Headings guide the eye, dividers create rhythm.</li><li><strong>Media.</strong> Images, galleries, and video break the text wall.</li><li><strong>Data.</strong> Stats and tables add credibility.</li><li><strong>Personality.</strong> Quotes, tweets, and signature blocks make it yours.</li></ul><p><em>The block system gives you all of these — and more.</em></p>" }],
        ["highlight", { emoji: "💡", text: "Every block in this issue can be reordered, restyled, or removed with a single click." }],
        ["divider", { variant: "solid" }],
        ["stats", { items: [{ value: "42", label: "Block types" }, { value: "6", label: "Database blocks" }, { value: "100%", label: "Customizable" }] }],
        ["columns2", { columns: [{ heading: "Writing blocks", body: "Headings, paragraphs, quotes, lists, code, checklists — everything for long-form content." }, { heading: "Layout blocks", body: "Columns, cards, tables, timelines, FAQs — structure your content visually." }] }],
        ["columns2", { count: 3, columns: [{ heading: "Media", body: "Images, galleries, GIFs, video embeds, and tweet cards." }, { heading: "Newsletter", body: "Hero, subscribe, share, social, author card, and footer." }, { heading: "Database", body: "Books, e-books, quotes, videos, and blog posts from your CMS." }] }],
        ["divider", { variant: "dashed", label: "Layout blocks" }],
        ["callout", { emoji: "👉", tone: "tip", title: "Pro tip", body: "Use the slash command anywhere in the editor to quickly insert any block without leaving your keyboard." }],
        ["card", { eyebrow: "Featured", title: "The composer that thinks like a newsletter", body: "Drag, drop, restyle — no code needed. Every block renders exactly as it sends.", linkLabel: "Try it now", linkUrl: "https://sagarlad.com" }],
        ["featureGrid", { title: "What's inside the composer", columns: "3", items: [{ emoji: "⚡", title: "Quick insert", body: "Hit slash and drop a block in." }, { emoji: "🎯", title: "Live preview", body: "See exactly how it sends." }, { emoji: "🧩", title: "Composable", body: "Swap sections without rewriting." }, { emoji: "📐", title: "Design controls", body: "Type, spacing, color per block." }, { emoji: "🔍", title: "Pre-flight", body: "Contrast and width warnings." }, { emoji: "📈", title: "UTM builder", body: "Track every call to action." }] }],
        ["table", { headers: [{ text: "Block type" }, { text: "Category" }, { text: "Use case" }], rows: [{ cells: "Hero|Newsletter|Issue opening" }, { cells: "Table|Layout|Structured data" }, { cells: "Timeline|Layout|Sequenced milestones" }, { cells: "Card|Layout|Image + text unit" }], striped: true }],
        ["timeline", { items: [{ date: "Step 1", title: "Choose a template", body: "Start with a pre-built layout or blank canvas.", color: "#ffd51d" }, { date: "Step 2", title: "Add your blocks", body: "Drag, drop, and reorder sections.", color: "#B45309" }, { date: "Step 3", title: "Style it", body: "Adjust fonts, colors, and spacing.", color: "#059669" }, { date: "Step 4", title: "Ship it", body: "Preview, check, and send.", color: "#DC2626" }] }],
        ["list", { style: "number", items: [{ text: "Every block supports dark mode rendering" }, { text: "Drag to reorder any section" }, { text: "Inline editing for all text fields" }, { text: "One-click duplicate for any block" }] }],
        ["checklist", { items: [{ text: "Choose a template", done: true }, { text: "Add hero and intro", done: true }, { text: "Insert media blocks", done: true }, { text: "Write the CTA", done: false }, { text: "Run pre-flight checks", done: false }] }],
        ["divider", { variant: "ornament" }],
        ["quote", { quote: "Simplicity is not what's left after you remove things. It's what's left after you decide what the product is for.", author: "Sagar Lad", role: "Author & Speaker", tone: "bar" }],
        ["spacer", { height: 24 }],
        ["heading", { eyebrow: "Media", text: "Visual storytelling", level: "h2", highlight: "Visual, storytelling" }],
        ["image", { caption: "The composer canvas — drag, drop, and design.", credit: "Screenshot: Sagar Lad", ratio: "16/9" }],
        ["banner", { title: "Built for people who ship", subtitle: "A faster canvas, a smarter inspector, real templates.", height: 240, overlay: 0.3 }],
        ["gallery", { columns: "2", items: [{ caption: "The block library — 42 types to choose from." }, { caption: "Live preview shows exactly how it sends." }, { caption: "Drag to reorder any section instantly." }, { caption: "Design controls per block — font, color, spacing." }] }],
        ["gif", { alt: "Drag-and-drop block reordering in the composer", caption: "Reordering blocks is as simple as dragging." }],
        ["video", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Two-minute walkthrough", caption: "See the full composer in action." }],
        ["tweet", { name: "Sagar Lad", handle: "@SagarLad692", body: "Just shipped the complete newsletter composer — 42 block types, every one customizable.", date: "Sep 20, 2026", likes: "2.4K", reposts: "312", url: "https://x.com" }],
        ["divider", { variant: "dotted" }],
        ["code", { language: "typescript", code: 'const issue = await composer.publish({\n  title: "The Complete Issue",\n  blocks: 42,\n  scheduled: "2026-09-20T09:00:00Z",\n});' }],
        ["heading", { eyebrow: "From the library", text: "Your content, pulled automatically", level: "h2" }],
        ["blogPosts", { title: "Latest from the blog", selectedIds: [] }],
        ["divider", { variant: "dashed", label: "Published works" }],
        ["booksPublished", { title: "Published Books", selectedIds: [] }],
        ["booksRead", { title: "Recent Reads", selectedIds: [] }],
        ["ebooks", { title: "Free E-books & Guides", selectedIds: [] }],
        ["divider", { variant: "ornament" }],
        ["videoFeed", { title: "Latest Videos", selectedIds: [] }],
        ["quotes", { title: "Quotes to Live By", selectedIds: [] }],
        ["readingList", { title: "Five things worth your time", items: [{ title: "The cost of context switching", source: "Farnam Street", url: "https://example.com", thumb: "", description: "Why deep work needs longer blocks than you think." }, { title: "Newsletters as a product", source: "Lenny's Newsletter", url: "https://example.com", thumb: "", description: "Treat your list like a real product surface." }, { title: "Writing for skimmers", source: "Dense Discovery", url: "https://example.com", thumb: "", description: "Format the piece so it survives a 40-second skim." }] }],
        ["resources", { title: "Downloadable resources", items: [{ title: "Newsletter launch checklist", type: "PDF", url: "https://example.com", description: "The exact 18-step checklist to launch your list." }, { title: "Editorial calendar template", type: "Notion", url: "https://example.com", description: "Plan twelve issues in about twenty minutes." }] }],
        ["button", { label: "Open the composer", url: "https://sagarlad.com", icon: "external", variant: "primary", align: "center" }],
        ["divider", { variant: "dashed", label: "Stay connected" }],
        ["socialShare", { title: "Follow along & share", subtitle: "Know someone who'd love this? Forward it to them.", url: "https://sagarlad.com/newsletter", ctaLabel: "Share the showcase", alignCenter: true, showShare: true, showSocials: true, platforms: [{ platform: "x", url: "https://x.com/SagarLad692", enabled: true }, { platform: "linkedin", url: "https://www.linkedin.com/in/sagarlad/", enabled: true }, { platform: "instagram", url: "https://www.instagram.com/grow_with__sagar/", enabled: true }, { platform: "youtube", url: "https://www.youtube.com/@Sagarlad692", enabled: true }] }],
        ["subscribe", { title: "Never miss an issue", body: "One idea, one link, one ask. Every week. Free, no spam.", placeholder: "you@company.com", buttonLabel: "Subscribe", note: "Join 12,480 readers" }],
        ["authorCard", { name: "Sagar Lad", role: "Author & Speaker", bio: "Data & AI Architect, TEDx Speaker, and published author of 6+ books. I write about self-awareness, mindset and the intersection of technology and human potential.", twitter: "https://x.com/SagarLad692", linkedin: "https://www.linkedin.com/in/sagarlad/", website: "https://sagarlad.com" }],
        ["signature", { text: "If this resonated, just hit reply — I read everything.", name: "Sagar", role: "Author & Speaker", signatureStyle: true }],
        ["footer", { note: "Sagar Lad · The Complete Issue", address: "Sagar Lad Official, Gujarat, India", copyright: "© 2026 Sagar Lad. All rights reserved." }],
      ] as BlockSpec[]),
  },

  /* ================================================================
   *  TEMPLATE 2 — Weekly Showcase
   *  Every block type in a digest/roundup format.
   *  Deep blue / gold accent. Different flow from Template 1.
   * ================================================================ */
  {
    id: "weekly-showcase",
    name: "Weekly Showcase",
    category: "Creator",
    description:
      "A weekly roundup that uses every block type — curated links, media, data, database content, and community engagement.",
    tags: ["weekly", "showcase", "all-blocks", "roundup"],
    readingTime: 8,
    cover: { from: "#EEF2FF", to: "#FFFFFF", accent: "#0d21a1" },
    theme: {
      cover: { from: "#EEF2FF", to: "#FFFFFF", accent: "#0d21a1" },
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
        ["hero", {
          logo: "Sagar Lad", showLogo: true,
          eyebrow: "Issue 52 · Weekly Showcase",
          title: "The best of this week, all in one place",
          subtitle: "A curated digest featuring every type of content — blogs, videos, books, quotes, and the tools behind them.",
          issue: "52", date: "September 20, 2026",
          ctaLabel: "Jump to the highlights", secondaryLabel: "Forward to a friend",
        }],
        ["banner", { title: "This week in one glance", subtitle: "Everything worth your time, curated and organized.", height: 200, overlay: 0.35 }],
        ["stats", { items: [{ value: "52", label: "Issues shipped" }, { value: "48%", label: "Open rate" }, { value: "12.4K", label: "Readers" }, { value: "3.2x", label: "List growth" }] }],
        ["divider", { variant: "ornament" }],
        ["paragraph", { text: "Short issue this week — I spent most of it polishing the composer and reading. The five things below earned their place anyway. Every block type is represented in this issue as a showcase of what's possible." }],
        ["highlight", { emoji: "🔥", text: "This issue uses every single block type in the composer — 42 blocks total." }],
        ["heading", { eyebrow: "From the blog", text: "Latest posts", level: "h2", highlight: "Latest, posts" }],
        ["subheading", { text: "What I wrote this week" }],
        ["blogPosts", { title: "Fresh from the blog", selectedIds: [] }],
        ["card", { eyebrow: "Deep dive", title: "Systems beat motivation", body: "The reason your best writing happens on a schedule — and how to build the schedule.", linkLabel: "Read the piece", linkUrl: "https://example.com" }],
        ["divider", { variant: "dashed", label: "Watch this week" }],
        ["videoFeed", { title: "Latest Videos", selectedIds: [] }],
        ["video", { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "This week's recommended watch", caption: "A deep dive into newsletter growth strategies." }],
        ["image", { caption: "The newsletter growth curve — consistency compounds.", credit: "Chart: Sagar Lad", ratio: "16/9" }],
        ["gallery", { columns: "3", items: [{ caption: "The new composer canvas." }, { caption: "Block library — 42 types." }, { caption: "Live preview mode." }] }],
        ["gif", { alt: "Quick block insertion via slash command", caption: "Insert any block with the slash command." }],
        ["divider", { variant: "ornament" }],
        ["heading", { eyebrow: "Books", text: "Published works", level: "h2", highlight: "Published, works" }],
        ["booksPublished", { title: "Available now", selectedIds: [] }],
        ["ebooks", { title: "Free downloads", selectedIds: [] }],
        ["booksRead", { title: "Currently reading", selectedIds: [] }],
        ["divider", { variant: "dashed", label: "The list" }],
        ["list", { style: "number", items: [{ text: "A pricing page teardown that changed how I frame plans." }, { text: "The essay on shipping cadence I keep re-reading." }, { text: "A one-hour podcast on distribution, no filler." }, { text: "The Figma plugin that removed a whole afternoon of work." }, { text: "A short book on editing that applies to email." }] }],
        ["columns2", { columns: [{ heading: "Signal", body: "Two long-form reads, one tool I now use daily, and a clear pattern in this week's replies." }, { heading: "Noise", body: "The launch everyone posted about, three AI takes that said nothing, and one podcast I bailed on." }] }],
        ["columns2", { count: 3, columns: [{ heading: "Writing", body: "Ship the smallest useful version." }, { heading: "Reading", body: "One book that changed my week." }, { heading: "Building", body: "The tool that saved me hours." }] }],
        ["featureGrid", { title: "This week's tools", columns: "2", items: [{ emoji: "⚡", title: "Quick insert", body: "Slash command for any block." }, { emoji: "🎯", title: "Live preview", body: "See it before you send it." }, { emoji: "🧩", title: "Composable", body: "Mix and match freely." }, { emoji: "📈", title: "Analytics", body: "Track every interaction." }] }],
        ["table", { headers: [{ text: "Metric" }, { text: "This week" }, { text: "Change" }], rows: [{ cells: "Open rate|48.2%|+2.1" }, { cells: "Click rate|11.4%|+0.8" }, { cells: "Replies|39|+7" }, { cells: "Forwards|24|+12" }], striped: true }],
        ["timeline", { items: [{ date: "Mon", title: "Published new blog", body: "The complete guide to newsletter blocks.", color: "#0d21a1" }, { date: "Wed", title: "Shipped video", body: "Two-minute composer walkthrough.", color: "#3f88c5" }, { date: "Fri", title: "Weekly digest", body: "This issue — every block type showcased.", color: "#059669" }] }],
        ["checklist", { items: [{ text: "Read the latest blog post", done: true }, { text: "Watch the composer walkthrough", done: true }, { text: "Try the new block types", done: false }, { text: "Share with a friend", done: false }] }],
        ["callout", { emoji: "💡", tone: "info", title: "Did you know?", body: "This newsletter now supports 42 block types, including database-backed blocks that auto-populate from your CMS." }],
        ["code", { language: "typescript", code: '// Auto-populate blocks from your CMS\nconst issue = await composer.create({\n  blocks: ["blogPosts", "videoFeed", "quotes"],\n  autoFill: true,\n});' }],
        ["tweet", { name: "Ada Sterling", handle: "@adasterling", body: "Shipped issue 52 today. The trick was never the writing — it was the deadline.", date: "Sep 19, 2026", likes: "1.2K", reposts: "184", url: "https://x.com" }],
        ["quote", { quote: "Consistency beats intensity. Show up every week and the compounding does the rest.", author: "Sagar Lad", role: "Author & Speaker", tone: "centered" }],
        ["richtext", { html: "<p>Three things I would do again, and one I would skip:</p><ul><li><strong>Go at dawn.</strong> Every famous site is a different place before 7am.</li><li><strong>Eat at the counter.</strong> Standing bars had the best food of the trip.</li><li><strong>Carry less.</strong> The bag got lighter every day.</li></ul><p><em>Skip:</em> the bus tour. The train does the same route in half the time.</p>" }],
        ["spacer", { height: 20 }],
        ["readingList", { title: "Five things worth your time", items: [{ title: "The cost of context switching", source: "Farnam Street", url: "https://example.com", thumb: "", description: "Why deep work needs longer blocks than you think." }, { title: "Newsletters as a product", source: "Lenny's Newsletter", url: "https://example.com", thumb: "", description: "Treat your list like a real product surface." }, { title: "Writing for skimmers", source: "Dense Discovery", url: "https://example.com", thumb: "", description: "Format the piece so it survives a 40-second skim." }] }],
        ["resources", { title: "Downloadable resources", items: [{ title: "Newsletter launch checklist", type: "PDF", url: "https://example.com", description: "The exact 18-step checklist to launch your list." }, { title: "Editorial calendar template", type: "Notion", url: "https://example.com", description: "Plan twelve issues in about twenty minutes." }] }],
        ["button", { label: "Read the full roundup", url: "https://sagarlad.com", icon: "arrow", variant: "accent", align: "center" }],
        ["divider", { variant: "dashed", label: "Stay connected" }],
        ["socialShare", { title: "Follow along & share", subtitle: "Know someone who'd love this? Forward it to them.", url: "https://sagarlad.com/newsletter", ctaLabel: "Share the showcase", alignCenter: true, showShare: true, showSocials: true, platforms: [{ platform: "x", url: "https://x.com/SagarLad692", enabled: true }, { platform: "linkedin", url: "https://www.linkedin.com/in/sagarlad/", enabled: true }, { platform: "instagram", url: "https://www.instagram.com/grow_with__sagar/", enabled: true }, { platform: "youtube", url: "https://www.youtube.com/@Sagarlad692", enabled: true }] }],
        ["subscribe", { title: "Never miss a showcase", body: "One curated issue, every week. Free, and easy to unsubscribe from.", placeholder: "you@company.com", buttonLabel: "Subscribe to the showcase", note: "Join 12,480 readers" }],
        ["authorCard", { name: "Sagar Lad", role: "Author & Speaker", bio: "Data & AI Architect, TEDx Speaker, and published author of 6+ books. I write about self-awareness, mindset and the intersection of technology and human potential.", twitter: "https://x.com/SagarLad692", linkedin: "https://www.linkedin.com/in/sagarlad/", website: "https://sagarlad.com" }],
        ["signature", { text: "If this resonated, just hit reply — I read everything.", name: "Sagar", role: "Author & Speaker", signatureStyle: true }],
        ["footer", { note: "Sagar Lad · Weekly Showcase", address: "Sagar Lad Official, Gujarat, India", copyright: "© 2026 Sagar Lad. All rights reserved." }],
      ] as BlockSpec[]),
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
