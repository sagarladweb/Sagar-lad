// Email-safe HTML builders. Pure functions — importable from the server send
// path AND from the client composer preview. Email clients only reliably
// render tables + inline styles: no flex, no grid, no external CSS, no JS.
// Every field is plain text; the builders escape and wrap it in paragraphs.

export type TemplateId = "letter" | "editorial" | "minimal";

export type NewsletterContent = {
  template: TemplateId;
  accent: string;
  preheader: string;
  greeting: string;
  intro: string;
  sections: { heading: string; body: string }[];
  quote: { text: string; author: string } | null;
  cta: { label: string; url: string } | null;
  signoff: string;
  socials: { label: string; href: string }[];
};

// Accent choices offered in the composer. Yellow is the site default; blue is
// the deep-brand option for a more formal letter.
export const BRAND_ACCENTS = [
  { name: "Yellow", value: "#ffd51d" },
  { name: "Blue", value: "#0d21a1" },
];

// Follow row appended before the sign-off. Email-safe table, always inline.
export function socialRow(socials: { label: string; href: string }[]): string {
  if (socials.length === 0) return "";
  const links = socials
    .map(
      (s, i) => `
        <td style="padding:0 ${
          i === socials.length - 1 ? "0" : "12px"
        } 0 0">
          <a href="${esc(s.href)}" style="color:${INK};text-decoration:underline;text-underline-offset:2px;font-size:13px;font-weight:600;white-space:nowrap">${esc(s.label)}</a>
        </td>`
    )
    .join("");
  return `
    <tr><td style="padding:6px 40px 2px 40px">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Follow me</p>
    </td></tr>
    <tr><td style="padding:0 40px 26px 40px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${links}</tr></table>
    </td></tr>`;
}

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  tagline: string;
  swatch: string;
}[] = [
  { id: "letter", name: "The Letter", tagline: "Warm, classic, easy to read", swatch: "#ffcb00" },
  { id: "editorial", name: "Editorial", tagline: "Bold magazine layout, high contrast", swatch: "#111110" },
  { id: "minimal", name: "Minimal", tagline: "Airy, quiet, focused on the words", swatch: "#e8e6e1" },
];

// Default newsletter template — pre-filled so the composer opens with a
// starting structure instead of a blank page. Edit freely; this is just
// the initial state for new newsletters.
export const defaultNewsletter: NewsletterContent = {
  template: "letter",
  accent: "#ffd51d",
  preheader: "",
  greeting: "Hi there,",
  intro: "Welcome to this week's edition of The Sagar Lad Letter. Here's what I've been thinking about...",
  sections: [
    {
      heading: "This Week's Idea",
      body: "Start writing your main insight here. What's the one thing your readers should take away?\n\nExplain the concept, share a story, or break down a framework. Keep it practical and actionable.",
    },
  ],
  quote: null,
  cta: { label: "Read more on the blog", url: "https://sagarlad.com/blog" },
  signoff: "Warm regards,\nSagar",
  socials: [],
};

// ── Pre-built layout: Deep Dive ─────────────────────────
// Clean, focused format with columns and long-form content.
export const LAYOUT_DEEP_DIVE: NewsletterContent = {
  template: "editorial",
  accent: "#0d21a1",
  preheader: "A deep dive into building systems that scale.",
  greeting: "Hi,",
  intro: "This edition is a deep dive into something I've been wrestling with at work. Let's get into it.",
  sections: [
    {
      heading: "The Problem",
      body: "Every codebase starts clean. Then reality hits.\n\nFeatures get bolted on. Edge cases multiply. And one day you look at the code and think: *how did we get here?*\n\nThe answer is always the same: **we optimized for speed instead of clarity**.",
    },
    {
      heading: "__COL_LEFT__",
      body: JSON.stringify({ left: "• **Read before you write** — understand the system\n• **Small diffs** — if a PR is bigger than 300 lines, it's too big\n• **One way to do things** — consistency beats cleverness\n• **Delete aggressively** — dead code is a liability", right: "", leftTitle: "Principles I Follow", rightTitle: "", bulletStyle: "dot" }),
    },
    {
      heading: "__COL_RIGHT__",
      body: JSON.stringify({ left: "", right: "" }),
    },
    { heading: "", body: "---" },
    {
      heading: "What I'm Reading",
      body: "• *The Pragmatic Programmer* — still the best book on software craft\n• *Staff Engineer* — if you're thinking about the senior+ path\n• *A Philosophy of Software Design* — on managing complexity",
    },
  ],
  quote: null,
  cta: { label: "Continue reading on the blog", url: "https://sagarlad.com/blog" },
  signoff: "Until next time,\nSagar",
  socials: [],
};

// Layout registry — used by the layout picker in the composer
export type LayoutId = "blank" | "deep-dive";

export const PREBUILT_LAYOUTS: {
  id: LayoutId;
  name: string;
  description: string;
  accent: string;
  template: TemplateId;
  content: NewsletterContent;
}[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with an empty newsletter.",
    accent: "#ffd51d",
    template: "letter",
    content: {
      ...defaultNewsletter,
      greeting: "",
      intro: "",
      preheader: "",
      signoff: "",
      quote: null,
      cta: null,
      socials: [],
      sections: [],
    },
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    description: "Bold, focused format with columns and long-form content.",
    accent: "#0d21a1",
    template: "editorial",
    content: LAYOUT_DEEP_DIVE,
  },
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Split text on blank lines into <p> tags. Supports inline formatting.
function paras(text: string): string {
  // Convert any literal <br> variants the user typed into real newlines before escaping
  const clean = esc(text.replace(/<br\s*\/?>/gi, "\n")).trim();
  return clean
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px 0;padding:0;line-height:1.65">${formatInline(p.replace(/\n/g, "<br/>"))}</p>`)
    .join("");
}

// Render inline formatting: bold, italic, highlight, colored text.
function formatInline(text: string): string {
  let s = text;
  // ==highlight== → <mark>
  s = s.replace(/==(.+?)==/g, '<mark style="background:#fef08a;padding:1px 3px;border-radius:2px">$1</mark>');
  // [color:red]text[/color] → <span style="color:red">
  s = s.replace(/\[color:(\w+)\](.+?)\[\/color\]/g, '<span style="color:$1">$2</span>');
  // **bold** → <strong>
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // *italic* → <em>
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return s;
}

// Render a list (bullet or ordered) from body text. Supports bullet styles.
function listHtml(body: string, ordered: boolean): string {
  const tag = ordered ? "ol" : "ul";
  const items = body.split("\n").filter((l) => l.trim()).map((l) => {
    const text = l.replace(/^[-*•→✓\d.]+\s*/, "").trim();
    return `<li style="margin:0 0 6px 0;line-height:1.6">${formatInline(esc(text))}</li>`;
  }).join("");
  return `<${tag} style="margin:0;padding-left:24px">${items}</${tag}>`;
}

// Detect section kind from heading/body markers.
export type SectionKind = "heading" | "text" | "image" | "divider" | "spacer" | "columns" | "list" | "code" | "quote" | "social" | "blog" | "video" | "book" | "table" | "link" | "button";

function sectionKind(s: { heading: string; body: string }): SectionKind {
  if (s.body === "---") return "divider";
  if (s.body === "\n\n") return "spacer";
  if (s.heading === "__CODE__") return "code";
  if (s.heading === "__SOCIAL__") return "social";
  if (s.heading === "__QUOTE__") return "quote";
  if (s.heading === "__BLOG__") return "blog";
  if (s.heading === "__VIDEO__") return "video";
  if (s.heading === "__BOOK__") return "book";
  if (s.heading === "__TABLE__") return "table";
  if (s.heading === "__LINK__") return "link";
  if (s.heading === "__BUTTON__") return "button";
  if (s.heading.startsWith("__COL_LEFT__") || s.heading.startsWith("__COL_RIGHT__")) return "columns";
  if (s.body.startsWith("https://") || s.body.startsWith("http://")) return "image";
  if (s.heading === "" && (s.body.startsWith("- ") || /^[•→✓]\s/.test(s.body) || /^\d+\.\s/.test(s.body))) return "list";
  return "text";
}

// Shared section renderer — email-safe HTML for all block types.
function sectionHtml(s: { heading: string; body: string }, accent: string, socialLinks?: { label: string; href: string; logoUrl?: string | null; color?: string | null }[]): string {
  const kind = sectionKind(s);

  switch (kind) {
    case "divider":
      return `<tr><td style="padding:8px 40px"><hr style="border:none;border-top:1px solid #e2e0db;margin:0"/></td></tr>`;

    case "spacer":
      return `<tr><td style="padding:20px 40px;font-size:0;line-height:0">&nbsp;</td></tr>`;

    case "image": {
      const url = esc(s.body.trim());
      return `<tr><td style="padding:8px 40px"><img src="${url}" alt="" style="width:100%;border-radius:8px;display:block"/></td></tr>`;
    }

    case "columns": {
      if (s.heading.startsWith("__COL_RIGHT__")) return "";
      let left = ""; let right = ""; let leftTitle = ""; let rightTitle = ""; let bulletStyle = "dot";
      try { const d = JSON.parse(s.body); left = d.left || ""; right = d.right || ""; leftTitle = d.leftTitle || ""; rightTitle = d.rightTitle || ""; bulletStyle = d.bulletStyle || "dot"; } catch { left = s.body; }
      function colContentHtml(text: string) {
        if (!text.trim()) return "";
        // Content is HTML from contentEditable — render directly
        if (text.startsWith("<")) return text;
        // Fallback: plain text list
        const bulletPrefix = { dot: "•", square: "■", number: "", roman: "" }[bulletStyle] ?? "•";
        const isNumbered = bulletStyle === "number" || bulletStyle === "roman";
        const listTag = isNumbered ? "ol" : "ul";
        const listStyle = isNumbered ? (bulletStyle === "roman" ? "lower-roman" : "decimal") : (bulletStyle === "square" ? "square" : "disc");
        const items = text.split("\n").filter((l) => l.trim()).map((l) => {
          const t = l.replace(/^[-*•→✓\d.]+\s*/, "").trim();
          return `<li style="margin:0 0 6px 0;line-height:1.6">${formatInline(esc(t))}</li>`;
        }).join("");
        return `<${listTag} style="margin:0;padding-left:20px;list-style-type:${listStyle}">${items}</${listTag}>`;
      }
      const leftTitleHtml = leftTitle ? `<p style="margin:0 0 10px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED}">${esc(leftTitle)}</p>` : "";
      const rightTitleHtml = rightTitle ? `<p style="margin:0 0 10px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED}">${esc(rightTitle)}</p>` : "";
      return `<tr><td style="padding:8px 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="48%" valign="top" style="font-size:15px;color:#2a2926;line-height:1.65">${leftTitleHtml}${colContentHtml(left)}</td>
        <td width="4%"></td>
        <td width="48%" valign="top" style="font-size:15px;color:#2a2926;line-height:1.65">${rightTitleHtml}${colContentHtml(right)}</td>
      </tr></table></td></tr>`;
    }

    case "list": {
      // Body is now HTML from contentEditable — render directly if HTML
      if (s.body.startsWith("<")) {
        return `<tr><td style="padding:8px 40px;font-size:15px;color:#2a2926;line-height:1.65">${s.body}</td></tr>`;
      }
      const isOrdered = /^\d+\.\s/.test(s.body.split("\n").find((l) => l.trim()) ?? "");
      return `<tr><td style="padding:8px 40px;font-size:15px;color:#2a2926">${listHtml(s.body, isOrdered)}</td></tr>`;
    }

    case "code": {
      let html = s.body;
      try { const d = JSON.parse(s.body); html = d.html || s.body; } catch { /* raw HTML */ }
      return `<tr><td style="padding:8px 40px;overflow:hidden;max-width:100%"><div style="background:#f8f7f4;border:1px solid #e8e6e1;border-radius:8px;padding:20px;font-size:14px;color:#2a2926;overflow:hidden;max-width:100%;box-sizing:border-box;word-break:break-word">${html}</div></td></tr>`;
    }

    case "quote": {
      let text = ""; let author = "";
      try { const d = JSON.parse(s.body); text = d.text || ""; author = d.author || ""; } catch { text = s.body; }
      return `<tr><td style="padding:12px 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="4" style="background:${accent};border-radius:2px"></td>
        <td style="padding:6px 22px;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3c3a35">${esc(text)}
          ${author ? `<div style="font-style:normal;font-size:13px;font-weight:700;color:${MUTED};margin-top:8px">— ${esc(author)}</div>` : ""}
        </td>
      </tr></table></td></tr>`;
    }

    case "social": {
      if (!socialLinks || socialLinks.length === 0) return "";
      let selected: string[] = [];
      try { const d = JSON.parse(s.body); selected = d.selected || []; } catch { return ""; }
      const links = socialLinks.filter((sl) => selected.includes(sl.label.toLowerCase()) || selected.includes(sl.href));
      if (links.length === 0) return "";
      const cells = links.map((sl) => {
        const logo = sl.logoUrl ? `<img src="${esc(sl.logoUrl)}" alt="${esc(sl.label)}" style="width:20px;height:20px;border-radius:4px;vertical-align:middle;margin-right:6px"/>` : "";
        return `<td style="padding:0 8px 0 0"><a href="${esc(sl.href)}" style="color:${sl.color || INK};text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap;vertical-align:middle">${logo}${esc(sl.label)}</a></td>`;
      }).join("");
      return `<tr><td style="padding:8px 40px"><p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Follow me</p><table role="presentation" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>`;
    }

    case "blog": {
      let d = { title: "", url: "", excerpt: "", image: "" };
      try { d = JSON.parse(s.body); } catch { d = { title: s.heading, url: s.body, excerpt: "", image: "" }; }
      const imgHtml = d.image ? `<img src="${esc(d.image)}" alt="" style="width:100%;border-radius:8px;display:block;margin-bottom:12px"/>` : "";
      return `<tr><td style="padding:8px 40px">
        ${imgHtml}
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Blog Post</p>
        <p style="margin:0 0 4px 0;font-size:18px;font-weight:700;font-family:Georgia,'Times New Roman',serif;color:${INK}">${esc(d.title || "Untitled")}</p>
        ${d.excerpt ? `<p style="margin:0 0 8px 0;font-size:14px;color:${MUTED};line-height:1.5">${esc(d.excerpt)}</p>` : ""}
        ${d.url ? `<a href="${esc(d.url)}" style="color:${MUTED};text-decoration:underline;font-size:13px">Read more →</a>` : ""}
      </td></tr>`;
    }

    case "video": {
      let d = { title: "", url: "", thumbnail: "" };
      try { d = JSON.parse(s.body); } catch { d = { title: s.heading, url: s.body, thumbnail: "" }; }
      const thumbHtml = d.thumbnail ? `<img src="${esc(d.thumbnail)}" alt="" style="width:100%;border-radius:8px;display:block"/>` : "";
      return `<tr><td style="padding:8px 40px">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Video</p>
        ${thumbHtml}
        <p style="margin:8px 0 4px 0;font-size:18px;font-weight:700;font-family:Georgia,'Times New Roman',serif;color:${INK}">${esc(d.title || "Untitled")}</p>
        ${d.url ? `<a href="${esc(d.url)}" style="color:${MUTED};text-decoration:underline;font-size:13px">Watch →</a>` : ""}
      </td></tr>`;
    }

    case "book": {
      let d = { title: "", author: "", url: "", cover: "" };
      try { d = JSON.parse(s.body); } catch { d = { title: s.heading, author: "", url: s.body, cover: "" }; }
      const coverHtml = d.cover ? `<td width="100" valign="top" style="padding-right:16px"><img src="${esc(d.cover)}" alt="" style="width:100px;border-radius:6px;display:block"/></td>` : "";
      return `<tr><td style="padding:8px 40px">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Book</p>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          ${coverHtml}
          <td valign="top">
            <p style="margin:0 0 4px 0;font-size:18px;font-weight:700;font-family:Georgia,'Times New Roman',serif;color:${INK}">${esc(d.title || "Untitled")}</p>
            ${d.author ? `<p style="margin:0 0 8px 0;font-size:13px;color:${MUTED}">by ${esc(d.author)}</p>` : ""}
            ${d.url ? `<a href="${esc(d.url)}" style="color:${MUTED};text-decoration:underline;font-size:13px">Get it →</a>` : ""}
          </td>
        </tr></table>
      </td></tr>`;
    }

    case "table": {
      let data: { headerRow: boolean; rows: string[][] } = { headerRow: true, rows: [] };
      try { data = JSON.parse(s.body); } catch { return ""; }
      if (!data.rows.length) return "";
      const rows = data.rows.map((row, ri) => {
        const isHeader = ri === 0 && data.headerRow;
        const cells = row.map((cell) => {
          const style = isHeader
            ? `padding:10px 14px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${INK};background:${accent}15;border-bottom:2px solid ${accent}`
            : `padding:10px 14px;font-size:14px;color:#2a2926;border-bottom:1px solid #e8e6e1`;
          return `<td style="${style}">${formatInline(esc(cell || "—"))}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<tr><td style="padding:8px 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e6e1;border-radius:8px;overflow:hidden;border-collapse:collapse">${rows}</table></td></tr>`;
    }

    case "link": {
      let d = { text: "", url: "" };
      try { d = JSON.parse(s.body); } catch { d = { text: s.heading || s.body, url: s.body }; }
      return `<tr><td style="padding:8px 40px"><a href="${esc(d.url)}" style="color:${accent};text-decoration:underline;text-underline-offset:2px;font-weight:600;font-size:15px">${esc(d.text || d.url)}</a></td></tr>`;
    }

    case "button": {
      let d = { label: "", url: "" };
      try { d = JSON.parse(s.body); } catch { d = { label: s.heading || "Click here", url: s.body }; }
      return `<tr><td align="center" style="padding:12px 40px"><a href="${esc(d.url)}" style="background:${accent};color:${accentForeground(accent)};text-decoration:none;font-weight:700;font-size:15px;padding:13px 34px;border-radius:999px;display:inline-block">${esc(d.label || "Click here")}</a></td></tr>`;
    }

    case "heading":
    case "text":
    default: {
      if (!s.heading && !s.body) return "";
      const headingHtml = s.heading ? `<p style="margin:0 0 10px 0;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;color:${INK}">${esc(s.heading)}</p><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="height:3px;width:42px;background:${accent};font-size:0;line-height:0">&nbsp;</td></tr></table>` : "";
      // Body is now HTML from contentEditable — render directly
      const bodyHtml = s.body.startsWith("<") ? s.body : paras(s.body);
      return `<tr><td style="padding:8px 40px;font-size:15px;color:#2a2926;line-height:1.65">${headingHtml}${bodyHtml}</td></tr>`;
    }
  }
}

// Brand tokens — aligned with design.md. Yellow accent is the site's only
// constant accent; ink/cream match the site's typography surfaces. The accent
// comes from the composer (BRAND_ACCENTS) so a letter can switch to blue.
const INK = "#111110";
const MUTED = "#6b6a66";
const CREAM = "#faf9f6";

// Pick the readable foreground for text sitting on the accent fill. Yellow
// (light) keeps ink; deep blue (dark) switches to white — mirrors the admin
// panel rule in design.md (--accent-foreground: #ffffff on the blue accent).
function accentForeground(accent: string): string {
  const hex = accent.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? INK : "#ffffff";
}

const FONT = 'font-family:-apple-system,"Segoe UI",Roboto,Arial,Helvetica,sans-serif;';

const dateLabel = () =>
  new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// The preheader is the hidden first line of the email — the snippet most
// clients show after the subject in the inbox. Left empty, clients fall back
// to scraping body copy; setting it explicitly keeps the inbox line on-brand.
function preheaderDiv(preheader: string): string {
  if (!preheader.trim()) return "";
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(
    preheader
  )}</div>`;
}

// ---------------------------------------------------------------------------
// Template: The Letter — warm banded header, serif headings, left-rule quotes,
// pill CTA. The default for this site.
// ---------------------------------------------------------------------------
export function letterBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:${CREAM};padding:28px 24px 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #ecebe6;border-radius:14px;overflow:hidden">
        <tr><td style="padding:34px 40px 10px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="12" style="height:12;background:${c.accent};border-radius:3px"></td>
              <td style="font-size:13px;font-weight:700;letter-spacing:2px;color:${INK};text-transform:uppercase;padding:0 0 0 10px">Sagar Lad</td>
              <td align="right" style="font-size:12px;color:${MUTED};padding:0">${dateLabel()}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:2px;background:${c.accent};font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>
        <tr><td style="padding:30px 40px 6px 40px;font-size:15px;color:${INK};${FONT}min-height:40px">
          <p style="margin:0 0 6px 0;font-weight:700">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map((s) => sectionHtml(s, c.accent, c.socials))
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:18px 40px 0 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="4" style="background:${c.accent};border-radius:2px"></td>
            <td style="padding:6px 22px;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3c3a35">${esc(c.quote.text)}
              ${
                c.quote.author
                  ? `<div style="font-style:normal;font-size:13px;font-weight:700;color:${MUTED};margin-top:8px">— ${esc(c.quote.author)}</div>`
                  : ""
              }
            </td>
          </tr></table>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td align="center" style="padding:26px 40px 0 40px">
          <a href="${esc(c.cta.url)}" style="background:${c.accent};color:${accentForeground(c.accent)};text-decoration:none;font-weight:700;font-size:15px;padding:13px 34px;border-radius:999px;display:inline-block">${esc(c.cta.label)}</a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:28px 40px 34px 40px;color:${MUTED};${FONT}font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Template: Editorial — black banded header with yellow logo block, crisp
// hairline section rules, highlighted quote, slab CTA.
// ---------------------------------------------------------------------------
export function editorialBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:#f3f2ee;padding:28px 24px 0 24px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e3dd;border-radius:6px;overflow:hidden">
        <tr><td style="background:${INK};padding:26px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><span style="background:${c.accent};color:${accentForeground(c.accent)};font-weight:800;letter-spacing:1px;font-size:13px;padding:5px 10px;border-radius:3px">SAGAR LAD</span></td>
              <td align="right" style="color:rgba(255,255,255,0.55);font-size:12px">${dateLabel()}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:34px 40px 4px 40px;font-size:15px;color:#2b2a26">
          <p style="margin:0 0 8px 0;font-weight:700;color:${INK}">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map((s) => sectionHtml(s, c.accent, c.socials))
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:20px 40px 0 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="background:${c.accent};border-radius:4px;padding:18px 24px">
              <p style="margin:0;font-size:16px;font-style:italic;font-family:Georgia,'Times New Roman',serif;color:${accentForeground(c.accent)}">${esc(c.quote.text)}</p>
              ${
                c.quote.author
                  ? `<p style="margin:8px 0 0 0;font-size:12px;font-weight:700;color:${accentForeground(c.accent)};letter-spacing:1px;text-transform:uppercase">${esc(c.quote.author)}</p>`
                  : ""
              }
            </td>
          </tr></table>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td align="center" style="padding:26px 40px 0 40px">
          <a href="${esc(c.cta.url)}" style="background:${INK};color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.5px;padding:14px 36px;border-radius:3px;display:inline-block">${esc(c.cta.label)}</a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:14px 40px 30px 40px;color:${MUTED};font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// Template: Minimal — thin header rule, quiet type, single cut-through line,
// underlined text CTA. No buttons, no color blocks.
// ---------------------------------------------------------------------------
export function minimalBody(c: NewsletterContent): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${FONT}">
    ${preheaderDiv(c.preheader)}
    <tr><td align="center" style="background:#fbfbfa;padding:34px 20px 0 20px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:transparent">
        <tr><td style="padding:0 24px 18px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:1px;background:#d8d5cf"></td>
            <td width="8"></td>
            <td style="font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;white-space:nowrap">Letter ${dateLabel()}</td>
            <td width="8"></td>
            <td style="height:1px;background:#d8d5cf"></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:6px 24px;font-size:15px;color:#33322e">
          <p style="margin:0 0 8px 0;font-weight:600">${esc(c.greeting)}</p>
          ${paras(c.intro)}
        </td></tr>
        ${c.sections
          .map((s) => sectionHtml(s, c.accent, c.socials))
          .join("")}
        ${
          c.quote
            ? `
        <tr><td style="padding:20px 24px 0 24px">
          <p style="margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3c3a35;border-top:1px solid #e2e0db;border-bottom:1px solid #e2e0db;padding:20px 8px">${esc(c.quote.text)}
            ${
              c.quote.author
                ? `<span style="font-style:normal;font-size:12px;font-weight:700;color:${MUTED}"> — ${esc(c.quote.author)}</span>`
                : ""
            }
          </p>
        </td></tr>`
            : ""
        }
        ${
          c.cta
            ? `
        <tr><td style="padding:24px 24px 0 24px">
          <a href="${esc(c.cta.url)}" style="color:${INK};text-decoration:underline;text-underline-offset:3px;font-weight:600;font-size:15px">${esc(c.cta.label)} <span style="color:${c.accent}">→</span></a>
        </td></tr>`
            : ""
        }
        ${socialRow(c.socials)}
        <tr><td style="padding:14px 24px 30px 24px;color:${MUTED};font-size:14px">
          ${paras(c.signoff || "Warm regards,<br/>Sagar Lad")}
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

const BUILDERS: Record<TemplateId, (c: NewsletterContent) => string> = {
  letter: letterBody,
  editorial: editorialBody,
  minimal: minimalBody,
};

export function buildTemplateBody(id: TemplateId, c: NewsletterContent): string {
  return BUILDERS[id](c);
}

export const emptyNewsletter: NewsletterContent = {
  template: "letter",
  accent: "#ffd51d",
  preheader:
    "A big idea, a practical filter, and one simple thing you can do this week.",
  greeting: "Hi there,",
  intro:
    "A big idea, a practical filter, and one simple thing you can do this week. Read time: under three minutes.",
  sections: [{ heading: "The idea", body: "Start writing here. Short paragraphs, one idea at a time." }],
  quote: null,
  cta: null,
  signoff: "Warm regards,\nSagar Lad",
  socials: [],
};

// Full envelope: body + unsubscribe footer. Rendered identically by the
// composer preview and the Brevo send path.
export function emailShell(companyName: string, bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><head><meta name="color-scheme" content="light dark"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(prefers-color-scheme:dark){body,table{background:#1a1a1a!important}td{color:#e5e5e5!important}table table{background:#262626!important}a{color:#93c5fd!important}hr{border-color:#404040!important}.footer-cell{color:#a3a3a3!important}}</style></head><body style="margin:0;padding:0;background:#fafafa;overflow-x:hidden">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:24px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:600px;font-family:-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:#1a1a1a">
        <tr><td>
          ${bodyHtml}
        </td></tr>
        <tr><td class="footer-cell" style="padding:26px 20px 10px 20px;font-size:12px;color:#888;text-align:center;${FONT}">
          <a href="${esc(unsubscribeUrl)}" style="color:#888">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}