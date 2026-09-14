import {
  AtSign,
  BookOpen,
  BookMarked,
  BookCheck,
  ChartBar,
  CircleQuestionMark,
  Code,
  Columns2,
  Columns3,
  FileText,
  Quote,
  Film,
  FolderOpen,
  GitCommitVertical,
  Heading1,
  Heading2,
  Highlighter,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Lightbulb,
  List,
  ListChecks,
  Mail,
  MessageCircle,
  Minus,
  MousePointerClick,
  MoveVertical,
  Newspaper,
  PanelTop,
  PenLine,
  Book,
  Share2,
  Square,
  Table,
  TextAlignStart,
  Type,
  User,
  Video,
  Library,
  Rss,
} from "lucide-react";
import type { BlockCategory, BlockDef, BlockType, FieldDef } from "@/components/newsletter-composer/types/editor";

/* ------------------------------------------------------------------ *
 *  Tiny field helpers keep the registry readable
 * ------------------------------------------------------------------ */
const f = (field: FieldDef): FieldDef => field;

const text = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "text", ...extra });
const area = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "textarea", ...extra });
const rich = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "richtext", ...extra });
const pick = (
  key: string,
  label: string,
  options: { label: string; value: string }[],
  extra: Partial<FieldDef> = {},
) => f({ key, label, type: "select", options, ...extra });
const toggle = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "toggle", ...extra });
const img = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "image", ...extra });
const num = (key: string, label: string, extra: Partial<FieldDef> = {}) =>
  f({ key, label, type: "number", ...extra });
const repeat = (
  key: string,
  label: string,
  fields: FieldDef[],
  extra: Partial<FieldDef> = {},
) =>
  f({
    key,
    label,
    type: "repeat",
    fields,
    section: "Items",
    addLabel: "Add item",
    ...extra,
  });

const SOCIALS: FieldDef[] = [
  text("twitter", "X / Twitter"),
  text("linkedin", "LinkedIn"),
  text("website", "Website"),
];

/* ------------------------------------------------------------------ *
 *  Registry
 * ------------------------------------------------------------------ */
export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  /* ---------------------------- Writing ---------------------------- */
  heading: {
    type: "heading",
    label: "Heading",
    description: "Editorial section title",
    category: "Writing",
    icon: Heading1,
    keywords: ["title", "h1", "h2", "serif"],
    swatch: "#1D4ED8",
    defaultData: {
      eyebrow: "",
      text: "The quiet power of shipping small",
      emoji: "",
      highlight: "",
      level: "h1",
      anchor: "",
    },
    fields: [
      text("eyebrow", "Eyebrow label", { placeholder: "Issue 04 · Weekly" }),
      area("text", "Heading text", { placeholder: "Write a heading…" }),
      pick("level", "Heading level", [
        { label: "H1 — Display", value: "h1" },
        { label: "H2 — Section", value: "h2" },
        { label: "H3 — Subsection", value: "h3" },
        { label: "H4 — Minor", value: "h4" },
      ]),
      text("highlight", "Highlight words", {
        placeholder: "small, shipping",
        hint: "Comma-separated words get the accent highlight.",
      }),
      text("emoji", "Emoji or icon", { placeholder: "✨" }),
      text("anchor", "Anchor link", { placeholder: "quiet-power", section: "Advanced" }),
    ],
    styleOverride: {
      fontFamily: "serif",
      fontSize: 40,
      lineHeight: 1.12,
      letterSpacing: -0.4,
      marginTop: 8,
      marginBottom: 4,
    },
  },

  subheading: {
    type: "subheading",
    label: "Subheading",
    description: "Secondary headline",
    category: "Writing",
    icon: Heading2,
    keywords: ["subtitle", "section"],
    swatch: "#3B82F6",
    defaultData: { text: "Why small compounds faster than big" },
    fields: [area("text", "Subheading text")],
    styleOverride: {
      fontFamily: "serif",
      fontSize: 26,
      lineHeight: 1.25,
      fontWeight: 400,
    },
  },

  paragraph: {
    type: "paragraph",
    label: "Paragraph",
    description: "Rich body copy",
    category: "Writing",
    icon: TextAlignStart,
    keywords: ["text", "body", "copy"],
    swatch: "#6B7280",
    defaultData: {
      text: "Every issue starts with one clear idea. Write it down, strip the filler, and let the reader breathe. Good newsletters are edited, not written.",
    },
    fields: [
      rich("text", "Body", {
        hint: "Select text to format. Cmd/Ctrl + B, I, U, K are supported.",
      }),
    ],
    styleOverride: { fontSize: 17, lineHeight: 1.75 },
  },

  richtext: {
    type: "richtext",
    label: "Rich Text",
    description: "Long-form formatted block",
    category: "Writing",
    icon: Type,
    keywords: ["article", "long", "formatted"],
    swatch: "#111827",
    defaultData: {
      html: "<p>Long-form sections work best with subheads, lists and pull quotes. Use the toolbar above to shape the rhythm of the piece.</p><ul><li>Lead with the tension</li><li>Earn the insight</li><li>Close with one action</li></ul>",
    },
    fields: [rich("html", "Rich text")],
    styleOverride: { fontSize: 17, lineHeight: 1.8 },
  },

  highlight: {
    type: "highlight",
    label: "Highlight",
    description: "Pulled-out key line",
    category: "Writing",
    icon: Highlighter,
    keywords: ["marker", "key line", "accent"],
    swatch: "#F5C542",
    defaultData: {
      emoji: "💡",
      text: "The best newsletter is the one you actually send every week.",
    },
    fields: [text("emoji", "Emoji"), area("text", "Highlight text")],
    styleOverride: {
      fontSize: 20,
      fontFamily: "serif",
      backgroundColor: "#FDF9EA",
      paddingTop: 18,
      paddingBottom: 18,
      paddingX: 20,
      radius: 18,
      borderEnabled: true,
      borderColor: "#F3E6BF",
    },
  },

  quote: {
    type: "quote",
    label: "Quote",
    description: "Pull quote with attribution",
    category: "Writing",
    icon: Quote,
    keywords: ["citation", "testimonial"],
    swatch: "#0F766E",
    defaultData: {
      quote:
        "Consistency beats intensity. Show up every week and the compounding does the rest.",
      author: "Ada Sterling",
      role: "Editor, The Long Game",
      avatar: "",
      tone: "bar",
    },
    fields: [
      area("quote", "Quote"),
      text("author", "Author"),
      text("role", "Role / company"),
      img("avatar", "Avatar", { section: "Media" }),
      pick("tone", "Treatment", [
        { label: "Left bar", value: "bar" },
        { label: "Centered serif", value: "centered" },
        { label: "Card", value: "card" },
      ]),
    ],
    styleOverride: { fontFamily: "serif", fontSize: 22, lineHeight: 1.5 },
  },

  divider: {
    type: "divider",
    label: "Divider",
    description: "Section separator",
    category: "Writing",
    icon: Minus,
    keywords: ["rule", "separator", "hr"],
    swatch: "#9CA3AF",
    defaultData: { variant: "solid", label: "" },
    fields: [
      pick("variant", "Style", [
        { label: "Solid line", value: "solid" },
        { label: "Dashed", value: "dashed" },
        { label: "Dotted", value: "dotted" },
        { label: "Ornament", value: "ornament" },
      ]),
      text("label", "Center label", { placeholder: "Continue reading" }),
    ],
    styleOverride: { paddingTop: 16, paddingBottom: 16, borderColor: "#D9D5CB" },
  },

  spacer: {
    type: "spacer",
    label: "Spacer",
    description: "Vertical breathing room",
    category: "Writing",
    icon: MoveVertical,
    keywords: ["gap", "space", "empty"],
    swatch: "#E5E1D8",
    defaultData: { height: 40 },
    fields: [num("height", "Height (px)", { min: 8, max: 240, step: 4 })],
    styleOverride: { paddingTop: 0, paddingBottom: 0 },
  },

  list: {
    type: "list",
    label: "List",
    description: "Bulleted or numbered",
    category: "Writing",
    icon: List,
    keywords: ["bullets", "numbered", "points"],
    swatch: "#2563EB",
    defaultData: {
      style: "bullet",
      items: [
        { text: "One idea per section" },
        { text: "One link per idea" },
        { text: "One call to action per issue" },
      ],
    },
    fields: [
      pick("style", "List style", [
        { label: "Bulleted", value: "bullet" },
        { label: "Numbered", value: "number" },
        { label: "Arrow", value: "arrow" },
      ]),
      repeat("items", "Items", [text("text", "Item")], { itemLabel: "Item" }),
    ],
  },

  checklist: {
    type: "checklist",
    label: "Checklist",
    description: "Trackable to-do list",
    category: "Writing",
    icon: ListChecks,
    keywords: ["todo", "tasks"],
    swatch: "#059669",
    defaultData: {
      items: [
        { text: "Draft the lead", done: true },
        { text: "Add two links", done: true },
        { text: "Write the CTA", done: false },
      ],
    },
    fields: [
      repeat(
        "items",
        "Items",
        [text("text", "Item"), toggle("done", "Done")],
        { itemLabel: "Task" },
      ),
    ],
  },

  code: {
    type: "code",
    label: "Code Snippet",
    description: "Monospace code block",
    category: "Writing",
    icon: Code,
    keywords: ["snippet", "developer", "pre"],
    swatch: "#374151",
    defaultData: {
      language: "typescript",
      code: `const issue = await composer.publish({
  title: "Quiet power",
  sections: 4,
});`,
    },
    fields: [
      text("language", "Language", { placeholder: "typescript" }),
      area("code", "Code", { hint: "Monospace, syntax stays exactly as typed." }),
    ],
    styleOverride: {
      backgroundColor: "#0F172A",
      textColor: "#E2E8F0",
      paddingTop: 18,
      paddingBottom: 18,
      paddingX: 20,
      radius: 16,
      fontFamily: "sans",
      fontSize: 13.5,
      lineHeight: 1.7,
    },
  },

  /* ---------------------------- Layout ----------------------------- */
  columns2: {
    type: "columns2",
    label: "2 Columns",
    description: "Two-up content grid",
    category: "Layout",
    icon: Columns2,
    keywords: ["grid", "side by side"],
    swatch: "#7C3AED",
    defaultData: {
      columns: [
        { heading: "Signal", body: "What actually moved the numbers this week." },
        { heading: "Noise", body: "What everyone else was busy talking about." },
      ],
    },
    fields: [
      repeat(
        "columns",
        "Columns",
        [text("heading", "Heading"), area("body", "Body")],
        { itemLabel: "Column" },
      ),
    ],
    styleOverride: { gap: 20 },
  },

  columns3: {
    type: "columns3",
    label: "3 Columns",
    description: "Three-up content grid",
    category: "Layout",
    icon: Columns3,
    keywords: ["grid", "three"],
    swatch: "#8B5CF6",
    defaultData: {
      columns: [
        { heading: "Build", body: "Ship the smallest useful version." },
        { heading: "Measure", body: "Watch one number that matters." },
        { heading: "Learn", body: "Write down what surprised you." },
      ],
    },
    fields: [
      repeat(
        "columns",
        "Columns",
        [text("heading", "Heading"), area("body", "Body")],
        { itemLabel: "Column" },
      ),
    ],
    styleOverride: { gap: 16 },
  },

  callout: {
    type: "callout",
    label: "Callout",
    description: "Highlighted note or tip",
    category: "Layout",
    icon: Lightbulb,
    keywords: ["note", "tip", "warning"],
    swatch: "#F59E0B",
    defaultData: {
      emoji: "👉",
      title: "Worth trying this week",
      body: "Open your last issue and delete the first two paragraphs. The real opening is almost always on line three.",
      tone: "tip",
    },
    fields: [
      pick("tone", "Tone", [
        { label: "Tip", value: "tip" },
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Success", value: "success" },
      ]),
      text("emoji", "Emoji"),
      text("title", "Title"),
      area("body", "Body"),
    ],
    styleOverride: { paddingTop: 18, paddingBottom: 18, paddingX: 20, radius: 18, gap: 8 },
  },

  card: {
    type: "card",
    label: "Card",
    description: "Image + text unit",
    category: "Layout",
    icon: Square,
    keywords: ["tile", "unit"],
    swatch: "#0EA5E9",
    defaultData: {
      image: "",
      eyebrow: "Deep dive",
      title: "Systems beat motivation",
      body: "A short description of why this card deserves a click.",
      linkLabel: "Read the piece",
      linkUrl: "https://example.com",
    },
    fields: [
      img("image", "Image", { section: "Media" }),
      text("eyebrow", "Eyebrow"),
      text("title", "Title"),
      area("body", "Body"),
      text("linkLabel", "Link label", { section: "Link" }),
      text("linkUrl", "Link URL", { section: "Link" }),
    ],
    styleOverride: {
      borderEnabled: true,
      borderColor: "#ECE9E2",
      radius: 18,
      paddingTop: 18,
      paddingBottom: 18,
      paddingX: 18,
      shadow: "soft",
    },
  },

  featureGrid: {
    type: "featureGrid",
    label: "Feature Grid",
    description: "Icon feature cards",
    category: "Layout",
    icon: LayoutGrid,
    keywords: ["features", "benefits"],
    swatch: "#2563EB",
    defaultData: {
      title: "What's inside",
      columns: 2,
      items: [
        { emoji: "⚡", title: "Fast to send", body: "Draft, review, ship in one sitting." },
        { emoji: "🎯", title: "Focused", body: "One idea per issue, every issue." },
        { emoji: "🧩", title: "Composable", body: "Swap sections without rewriting." },
        { emoji: "📈", title: "Measurable", body: "Track opens, clicks and replies." },
      ],
    },
    fields: [
      text("title", "Section title"),
      pick("columns", "Columns", [
        { label: "2 columns", value: "2" },
        { label: "3 columns", value: "3" },
      ]),
      repeat(
        "items",
        "Features",
        [text("emoji", "Emoji"), text("title", "Title"), area("body", "Body")],
        { itemLabel: "Feature" },
      ),
    ],
    styleOverride: { gap: 14 },
  },

  table: {
    type: "table",
    label: "Table",
    description: "Structured data",
    category: "Layout",
    icon: Table,
    keywords: ["rows", "columns", "data"],
    swatch: "#334155",
    defaultData: {
      headers: [{ text: "Metric" }, { text: "This week" }, { text: "Change" }],
      rows: [
        { cells: "Open rate|48.2%|+2.1" },
        { cells: "Click rate|11.4%|+0.8" },
        { cells: "Replies|39|+7" },
      ],
      striped: true,
    },
    fields: [
      repeat("headers", "Headers", [text("text", "Header")], {
        itemLabel: "Column",
      }),
      repeat(
        "rows",
        "Rows",
        [
          text("cells", "Cells", {
            hint: "Separate columns with a pipe character: Value | 48% | +2",
          }),
        ],
        { itemLabel: "Row" },
      ),
      toggle("striped", "Zebra striping"),
    ],
    styleOverride: { fontSize: 14 },
  },

  stats: {
    type: "stats",
    label: "Stats",
    description: "Big numbers row",
    category: "Layout",
    icon: ChartBar,
    keywords: ["metrics", "numbers", "kpi"],
    swatch: "#1D4ED8",
    defaultData: {
      items: [
        { value: "12,480", label: "Subscribers" },
        { value: "48%", label: "Open rate" },
        { value: "3.2x", label: "Growth" },
      ],
    },
    fields: [
      repeat(
        "items",
        "Stats",
        [text("value", "Value"), text("label", "Label")],
        { itemLabel: "Stat" },
      ),
    ],
    styleOverride: { fontFamily: "serif", gap: 12 },
  },

  timeline: {
    type: "timeline",
    label: "Timeline",
    description: "Sequenced milestones",
    category: "Layout",
    icon: GitCommitVertical,
    keywords: ["steps", "history", "process"],
    swatch: "#7C3AED",
    defaultData: {
      items: [
        { date: "January", title: "First 100 readers", body: "Wrote every week, shared everywhere.", color: "#1D4ED8" },
        { date: "April", title: "Found the format", body: "One essay, one link, one ask.", color: "#F5C542" },
        { date: "September", title: "10,000 readers", body: "The compounding finally showed up.", color: "#059669" },
      ],
    },
    fields: [
      repeat(
        "items",
        "Steps",
        [
          text("date", "Date"),
          text("title", "Title"),
          area("body", "Description"),
          f({ key: "color", label: "Indicator", type: "colorDot" }),
        ],
        { itemLabel: "Step" },
      ),
    ],
    styleOverride: { gap: 18 },
  },

  faq: {
    type: "faq",
    label: "FAQ",
    description: "Expandable Q&A",
    category: "Layout",
    icon: CircleQuestionMark,
    keywords: ["questions", "answers", "accordion"],
    swatch: "#0891B2",
    defaultData: {
      title: "Reader questions",
      expandFirst: true,
      style: "bordered",
      items: [
        {
          question: "How often do you publish?",
          answer: "Every Tuesday, without exception. Consistency is the whole strategy.",
        },
        {
          question: "Can I reply to this email?",
          answer: "Yes — replies land straight in my inbox and I read all of them.",
        },
      ],
    },
    fields: [
      text("title", "Section title"),
      pick("style", "Accordion style", [
        { label: "Bordered", value: "bordered" },
        { label: "Plain", value: "plain" },
        { label: "Cards", value: "cards" },
      ]),
      toggle("expandFirst", "Expand first by default"),
      repeat(
        "items",
        "Questions",
        [text("question", "Question"), area("answer", "Answer")],
        { itemLabel: "Question" },
      ),
    ],
    styleOverride: { gap: 10 },
  },

  /* ----------------------------- Media ----------------------------- */
  image: {
    type: "image",
    label: "Image",
    description: "Single image with caption",
    category: "Media",
    icon: ImageIcon,
    keywords: ["photo", "picture", "upload"],
    swatch: "#0EA5E9",
    defaultData: {
      src: "",
      alt: "",
      caption: "Add a caption to give the image context.",
      credit: "",
      ratio: "auto",
    },
    fields: [
      img("src", "Image", { hint: "Paste a URL or upload from your machine." }),
      text("alt", "Alt text", { hint: "Describe the image for screen readers." }),
      text("caption", "Caption"),
      text("credit", "Image credit", { section: "Advanced" }),
      pick("ratio", "Ratio", [
        { label: "Natural", value: "auto" },
        { label: "16 : 9", value: "16/9" },
        { label: "4 : 3", value: "4/3" },
        { label: "1 : 1", value: "1/1" },
      ]),
    ],
    styleOverride: { radius: 18, gap: 8 },
  },

  banner: {
    type: "banner",
    label: "Banner",
    description: "Full-width image banner",
    category: "Media",
    icon: PanelTop,
    keywords: ["cover", "header image"],
    swatch: "#0284C7",
    defaultData: {
      src: "",
      title: "",
      subtitle: "",
      height: 260,
      overlay: 0.25,
    },
    fields: [
      img("src", "Image"),
      text("title", "Overlay title"),
      text("subtitle", "Overlay subtitle"),
      num("height", "Height (px)", { min: 120, max: 520, step: 10 }),
      f({ key: "overlay", label: "Dark overlay", type: "range", min: 0, max: 0.8, step: 0.05 }),
    ],
    styleOverride: { radius: 18, paddingX: 0, paddingTop: 0, paddingBottom: 0 },
  },

  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "Image grid",
    category: "Media",
    icon: Images,
    keywords: ["photos", "grid", "images"],
    swatch: "#2563EB",
    defaultData: {
      columns: 2,
      items: [
        { src: "", caption: "First frame" },
        { src: "", caption: "Second frame" },
      ],
    },
    fields: [
      pick("columns", "Columns", [
        { label: "2 columns", value: "2" },
        { label: "3 columns", value: "3" },
      ]),
      repeat(
        "items",
        "Images",
        [img("src", "Image"), text("caption", "Caption")],
        { itemLabel: "Image" },
      ),
    ],
    styleOverride: { gap: 10, radius: 14 },
  },

  gif: {
    type: "gif",
    label: "GIF",
    description: "Animated image",
    category: "Media",
    icon: Film,
    keywords: ["animation", "loop"],
    swatch: "#F472B6",
    defaultData: {
      src: "",
      alt: "Animated preview",
      caption: "Keep it small — under 1 MB loads everywhere.",
    },
    fields: [
      img("src", "GIF URL"),
      text("alt", "Alt text"),
      text("caption", "Caption"),
    ],
    styleOverride: { radius: 16, gap: 8 },
  },

  video: {
    type: "video",
    label: "Video Embed",
    description: "YouTube or Vimeo card",
    category: "Media",
    icon: Video,
    keywords: ["youtube", "vimeo", "watch"],
    swatch: "#DC2626",
    defaultData: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "",
      title: "Watch the walkthrough",
      caption: "3 min · Video walkthrough",
    },
    fields: [
      text("url", "Video URL"),
      text("title", "Title"),
      img("thumbnail", "Thumbnail", { section: "Media" }),
      text("caption", "Caption"),
    ],
    styleOverride: {
      radius: 18,
      borderEnabled: true,
      borderColor: "#ECE9E2",
      paddingTop: 0,
      paddingBottom: 0,
      paddingX: 0,
      shadow: "soft",
    },
  },

  tweet: {
    type: "tweet",
    label: "Tweet Embed",
    description: "Social post quote",
    category: "Media",
    icon: MessageCircle,
    keywords: ["x", "twitter", "post"],
    swatch: "#0F172A",
    defaultData: {
      name: "Ada Sterling",
      handle: "@adasterling",
      avatar: "",
      body: "Shipped issue 52 today. The trick was never the writing — it was the deadline.",
      date: "Sep 12, 2026",
      likes: "1.2K",
      reposts: "184",
      url: "https://x.com",
    },
    fields: [
      text("name", "Name"),
      text("handle", "Handle"),
      img("avatar", "Avatar", { section: "Media" }),
      area("body", "Post text"),
      text("date", "Date", { section: "Meta" }),
      text("likes", "Likes", { section: "Meta" }),
      text("reposts", "Reposts", { section: "Meta" }),
      text("url", "Post URL", { section: "Meta" }),
    ],
    styleOverride: {
      borderEnabled: true,
      borderColor: "#E2E8F0",
      radius: 18,
      paddingTop: 18,
      paddingBottom: 18,
      paddingX: 18,
      fontSize: 16,
      lineHeight: 1.6,
    },
  },

  /* -------------------------- Newsletter --------------------------- */
  hero: {
    type: "hero",
    label: "Hero",
    description: "Issue opening block",
    category: "Newsletter",
    icon: PanelTop,
    keywords: ["cover", "opening", "masthead"],
    swatch: "#1D4ED8",
    defaultData: {
      logo: "Sagar Lad",
      showLogo: true,
      eyebrow: "Issue 01",
      title: "The quiet power of shipping small",
      subtitle:
        "A weekly letter about building things that compound, written for people who ship.",
      image: "",
      issue: "04",
      date: "September 13, 2026",
      ctaLabel: "Read the issue",
      ctaUrl: "#",
      secondaryLabel: "Share",
      secondaryUrl: "#",
    },
    fields: [
      toggle("showLogo", "Show newsletter logo"),
      text("logo", "Logo text"),
      text("eyebrow", "Eyebrow"),
      area("title", "Title"),
      area("subtitle", "Subtitle"),
      img("image", "Hero image", { section: "Media" }),
      text("issue", "Issue number", { section: "Meta" }),
      text("date", "Date", { section: "Meta" }),
      text("ctaLabel", "Primary CTA label", { section: "Actions" }),
      text("ctaUrl", "Primary CTA URL", { section: "Actions" }),
      text("secondaryLabel", "Secondary CTA label", { section: "Actions" }),
      text("secondaryUrl", "Secondary CTA URL", { section: "Actions" }),
    ],
    styleOverride: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingX: 28,
      radius: 20,
      bgType: "gradient",
      gradientFrom: "#EEF2FF",
      gradientTo: "#FFFFFF",
      gradientAngle: 160,
      borderEnabled: true,
      borderColor: "#E4E8F5",
    },
  },

  authorCard: {
    type: "authorCard",
    label: "Author Card",
    description: "About the writer",
    category: "Newsletter",
    icon: User,
    keywords: ["bio", "about", "profile"],
    swatch: "#7C3AED",
    defaultData: {
      avatar: "",
      name: "Sagar Lad",
      role: "Author & Speaker",
      bio: "I write practical frameworks on money, career, life and awareness every week.",
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
      website: "https://sagarlad.com",
    },
    fields: [
      img("avatar", "Photo", { section: "Media" }),
      text("name", "Name"),
      text("role", "Role"),
      area("bio", "Bio"),
      ...SOCIALS.map((field) => ({ ...field, section: "Social links" })),
    ],
    styleOverride: {
      borderEnabled: true,
      borderColor: "#ECE9E2",
      radius: 18,
      paddingTop: 18,
      paddingBottom: 18,
      paddingX: 18,
      backgroundColor: "#FFFFFF",
    },
  },

  subscribe: {
    type: "subscribe",
    label: "Subscribe Box",
    description: "Email capture CTA",
    category: "Newsletter",
    icon: Mail,
    keywords: ["signup", "newsletter", "capture"],
    swatch: "#1D4ED8",
    defaultData: {
      title: "Get the next issue",
      body: "One idea, one link, one ask. Every Tuesday. Free, no spam.",
      placeholder: "you@company.com",
      buttonLabel: "Subscribe",
      note: "Join 12,480 readers",
    },
    fields: [
      text("title", "Title"),
      area("body", "Body"),
      text("placeholder", "Input placeholder"),
      text("buttonLabel", "Button label"),
      text("note", "Note"),
    ],
    styleOverride: {
      backgroundColor: "#111827",
      textColor: "#FFFFFF",
      radius: 20,
      paddingTop: 28,
      paddingBottom: 28,
      paddingX: 24,
      align: "center",
    },
  },

  share: {
    type: "share",
    label: "Share Box",
    description: "Reader sharing prompt",
    category: "Newsletter",
    icon: Share2,
    keywords: ["refer", "forward", "social"],
    swatch: "#0EA5E9",
    defaultData: {
      title: "Enjoying this issue?",
      body: "Forward it to one friend who would find it useful.",
      url: "https://sagarlad.com/newsletter",
      networks: "x,linkedin,email",
      ctaLabel: "Share the issue",
    },
    fields: [
      text("title", "Title"),
      area("body", "Body"),
      text("url", "Share URL"),
      text("networks", "Networks", {
        hint: "Comma separated: x, linkedin, email",
      }),
      text("ctaLabel", "Button label"),
    ],
    styleOverride: {
      borderEnabled: true,
      borderColor: "#E4E8F5",
      backgroundColor: "#F7F9FF",
      radius: 18,
      paddingTop: 20,
      paddingBottom: 20,
      paddingX: 20,
      align: "center",
    },
  },

  social: {
    type: "social",
    label: "Social Links",
    description: "Row of profile links",
    category: "Newsletter",
    icon: AtSign,
    keywords: ["twitter", "linkedin", "follow"],
    swatch: "#0F172A",
    defaultData: {
      title: "Follow along",
      alignCenter: true,
      items: [
        { platform: "instagram", url: "https://www.instagram.com/grow_with__sagar/" },
        { platform: "youtube", url: "https://www.youtube.com/@Sagarlad692" },
        { platform: "linkedin", url: "https://www.linkedin.com/in/sagarlad/" },
        { platform: "x", url: "https://x.com/SagarLad692" },
      ],
    },
    fields: [
      text("title", "Title"),
      toggle("alignCenter", "Center align"),
      repeat(
        "items",
        "Links",
        [
          pick("platform", "Platform", [
            { label: "X / Twitter", value: "x" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "Instagram", value: "instagram" },
            { label: "Website", value: "website" },
            { label: "YouTube", value: "youtube" },
            { label: "Threads", value: "threads" },
            { label: "Substack", value: "substack" },
          ]),
          text("url", "URL"),
        ],
        { itemLabel: "Link" },
      ),
    ],
    styleOverride: { gap: 10 },
  },

  signature: {
    type: "signature",
    label: "Signature",
    description: "Personal sign-off",
    category: "Newsletter",
    icon: PenLine,
    keywords: ["sign off", "closing", "name"],
    swatch: "#B45309",
    defaultData: {
      text: "Thanks for reading — see you next week.",
      name: "Sagar",
      role: "Sagar Lad",
      avatar: "",
      signatureStyle: true,
    },
    fields: [
      area("text", "Message"),
      text("name", "Name"),
      text("role", "Role"),
      img("avatar", "Avatar (optional)", { section: "Media" }),
      toggle("signatureStyle", "Serif signature", { section: "Style" }),
    ],
    styleOverride: { fontFamily: "serif", fontSize: 20, gap: 6 },
  },

  readingList: {
    type: "readingList",
    label: "Reading List",
    description: "Curated links with thumbnails",
    category: "Newsletter",
    icon: BookOpen,
    keywords: ["links", "curated", "recommendations"],
    swatch: "#059669",
    defaultData: {
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
          description: "How to treat your list like a proper product surface.",
        },
      ],
    },
    fields: [
      text("title", "Section title"),
      repeat(
        "items",
        "Links",
        [
          text("title", "Title"),
          text("source", "Source name"),
          text("url", "URL"),
          img("thumb", "Thumbnail"),
          area("description", "Description"),
        ],
        { itemLabel: "Link" },
      ),
    ],
    styleOverride: { gap: 14 },
  },

  resources: {
    type: "resources",
    label: "Resource Cards",
    description: "Downloadable resources",
    category: "Newsletter",
    icon: FolderOpen,
    keywords: ["download", "toolkit", "assets"],
    swatch: "#7C3AED",
    defaultData: {
      title: "Resources",
      items: [
        {
          title: "Newsletter launch checklist",
          type: "PDF",
          url: "https://example.com",
          description: "The exact 18-step checklist used to launch this list.",
        },
      ],
    },
    fields: [
      text("title", "Section title"),
      repeat(
        "items",
        "Resources",
        [
          text("title", "Title"),
          text("type", "Type", { placeholder: "PDF, Notion, Figma…" }),
          text("url", "URL"),
          area("description", "Description"),
        ],
        { itemLabel: "Resource" },
      ),
    ],
    styleOverride: { gap: 12 },
  },

  button: {
    type: "button",
    label: "CTA Button",
    description: "Call to action",
    category: "Newsletter",
    icon: MousePointerClick,
    keywords: ["cta", "action", "link"],
    swatch: "#1D4ED8",
    defaultData: {
      label: "Read the full piece",
      url: "https://example.com",
      icon: "arrow",
      variant: "primary",
      align: "center",
    },
    fields: [
      text("label", "Button text"),
      text("url", "URL"),
      pick("icon", "Icon", [
        { label: "None", value: "none" },
        { label: "Arrow right", value: "arrow" },
        { label: "External link", value: "external" },
      ]),
      pick("variant", "Variant", [
        { label: "Primary blue", value: "primary" },
        { label: "Accent yellow", value: "accent" },
        { label: "Outline", value: "outline" },
        { label: "Dark", value: "dark" },
      ]),
      pick("align", "Alignment", [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ]),
    ],
    styleOverride: { paddingTop: 12, paddingBottom: 12 },
  },

  footer: {
    type: "footer",
    label: "Newsletter Footer",
    description: "Legal + unsubscribe",
    category: "Newsletter",
    icon: Newspaper,
    keywords: ["legal", "unsubscribe", "address"],
    swatch: "#9CA3AF",
    defaultData: {
      note: "Sagar Lad · Newsletter",
      address: "Sagar Lad Official, Mumbai, India",
      copyright: "© 2026 Sagar Lad. All rights reserved.",
      unsubscribeLabel: "Unsubscribe",
      unsubscribeUrl: "#",
    },
    fields: [
      text("note", "Note"),
      text("address", "Address"),
      text("copyright", "Copyright"),
      text("unsubscribeLabel", "Unsubscribe label"),
      text("unsubscribeUrl", "Unsubscribe URL"),
    ],
    styleOverride: {
      fontSize: 12.5,
      textColor: "#8B8F98",
      align: "center",
      borderEnabled: false,
      paddingTop: 24,
      paddingBottom: 24,
      lineHeight: 1.7,
    },
  },

  /* -------------------------- Database-backed -------------------------- */
  booksRead: {
    type: "booksRead",
    label: "Books I Read",
    description: "Select from your reading list",
    category: "Newsletter",
    icon: BookOpen,
    keywords: ["reading", "books", "library"],
    swatch: "#059669",
    defaultData: { title: "Books I Read", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { gap: 14 },
  },

  booksPublished: {
    type: "booksPublished",
    label: "Books I Published",
    description: "Select from your published books",
    category: "Newsletter",
    icon: BookMarked,
    keywords: ["published", "author", "books"],
    swatch: "#1D4ED8",
    defaultData: { title: "Books I Published", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { gap: 14 },
  },

  ebooks: {
    type: "ebooks",
    label: "E-books",
    description: "Select from your e-books",
    category: "Newsletter",
    icon: Book,
    keywords: ["ebook", "download", "guide"],
    swatch: "#7C3AED",
    defaultData: { title: "E-books", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { gap: 14 },
  },

  quotes: {
    type: "quotes",
    label: "Quotes",
    description: "Select from your quotes",
    category: "Newsletter",
    icon: Quote,
    keywords: ["quotes", "inspiration", "sayings"],
    swatch: "#0F766E",
    defaultData: { title: "Quotes to Live By", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { fontFamily: "serif", gap: 16 },
  },

  videoFeed: {
    type: "videoFeed",
    label: "Videos",
    description: "Select from your videos",
    category: "Newsletter",
    icon: Film,
    keywords: ["youtube", "video", "watch"],
    swatch: "#DC2626",
    defaultData: { title: "Latest Videos", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { gap: 14 },
  },

  blogPosts: {
    type: "blogPosts",
    label: "Blogs",
    description: "Select from your blog posts",
    category: "Newsletter",
    icon: Rss,
    keywords: ["blog", "posts", "articles"],
    swatch: "#2563EB",
    defaultData: { title: "From the Blog", selectedIds: [] as string[] },
    fields: [text("title", "Section title")],
    styleOverride: { gap: 14 },
  },
};

export const BLOCK_CATEGORIES: BlockCategory[] = [
  "Writing",
  "Layout",
  "Media",
  "Newsletter",
];

export const BLOCK_LIST = Object.values(BLOCK_DEFS);

export function getBlockDef(type: BlockType): BlockDef {
  return BLOCK_DEFS[type];
}
