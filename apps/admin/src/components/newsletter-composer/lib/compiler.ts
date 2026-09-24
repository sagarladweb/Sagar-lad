import type { Block, NewsletterDoc } from "@/components/newsletter-composer/types/editor";
import { SITE } from "@/lib/site";

function esc(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getVideoThumbnail(url: string, existing?: string): string {
  if (existing) return existing;
  const ytId = extractYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  const vimeoId = extractVimeoId(url);
  if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
  return "";
}

const SOCIAL_SVG: Record<string, { svg: string; color: string; label: string }> = {
  x: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>', color: "#000000", label: "X" },
  linkedin: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>', color: "#0A66C2", label: "LinkedIn" },
  instagram: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>', color: "#E4405F", label: "Instagram" },
  youtube: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>', color: "#FF0000", label: "YouTube" },
  tiktok: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15v-3.46a4.85 4.85 0 01-5.58-2.74V2.93h3.45v3.76z"/></svg>', color: "#000000", label: "TikTok" },
  whatsapp: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>', color: "#25D366", label: "WhatsApp" },
  threads: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.34-.776-.963-1.394-1.813-1.79-.128 2.754-1.19 5.072-3.988 5.072-.036 0-.072 0-.108-.002-2.63-.148-4.593-1.532-5.36-3.798-.467-1.378-.473-3.022-.018-4.82.654-2.57 2.547-4.44 5.203-5.042.398-.09.805-.135 1.216-.135.36 0 .714.033 1.06.097-.013-.36-.02-.722-.02-1.087 0-1.79.278-3.202.826-4.19C12.12.68 13.082.15 14.35.028c.197-.018.397-.03.598-.036L12.186 24zM17.05 14.51c.126.882.04 1.637-.393 2.273-.873 1.28-2.832 1.547-4.253.595-.885-.594-1.412-1.62-1.475-2.844-.042-.833.112-1.68.447-2.422.878-1.943 3.173-2.953 5.572-2.153.16.054.315.114.467.178-.342-1.62-1.283-2.61-2.856-3.004-1.17-.294-2.417-.205-3.504.256-.465.197-.887.46-1.25.784l1.09 1.508c.264-.232.585-.413.945-.533.733-.247 1.535-.268 2.294-.06.978.268 1.63 1.03 1.887 2.136-.678-.177-1.39-.264-2.12-.264-2.473 0-4.68 1.357-5.812 3.557-.638 1.24-.856 2.662-.612 4.088.576 3.398 3.43 5.688 6.98 5.688.222 0 .445-.01.667-.028 3.648-.308 6.41-2.776 6.878-6.378.24-1.85-.33-3.48-1.575-4.672l.174-1.888z"/></svg>', color: "#000000", label: "Threads" },
  substack: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>', color: "#FF6719", label: "Substack" },
  website: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', color: "#6B7280", label: "Website" },
};

/** Wrap comma-separated words in highlight spans for email HTML */
function highlightWords(text: string, words?: string): string {
  if (!text || !words) return esc(text || "");
  const list = words.split(",").map((w) => w.trim()).filter(Boolean);
  if (!list.length) return esc(text);
  const escaped = list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts
    .map((part) => {
      if (regex.test(part) && list.some((w) => w.toLowerCase() === part.toLowerCase())) {
        return `<span style="background:#FDF0B5;border-radius:3px;padding:1px 2px">${esc(part)}</span>`;
      }
      return esc(part);
    })
    .join("");
}

function renderBlockHtml(block: Block): string {
  const d = block.data || {};
  const s = block.style || ({} as any);
  const align = s.align || "left";
  const textColor = s.textColor || "#111827";
  const fontFamily =
    s.fontFamily === "serif"
      ? "Georgia, Cambria, 'Times New Roman', serif"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const accent = s.accentColor || "#0d21a1";

  switch (block.type) {
    case "heading": {
      const level = String(d.level || "h1");
      const lvl = level.charAt(1) || "1";
      const size = lvl === "1" ? 36 : lvl === "2" ? 28 : lvl === "3" ? 22 : 18;
      const eyebrow = d.eyebrow
        ? `<p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b8f98">${esc(d.eyebrow)}</p>`
        : "";
      const emoji = d.emoji ? `<span style="margin-right:10px">${esc(d.emoji)}</span>` : "";
      const highlightedText = highlightWords(String(d.text || ""), String(d.highlight || ""));
      return `
        <div style="margin:20px 0 10px 0;text-align:${align}">
          ${eyebrow}
          <h${lvl} style="margin:0;font-family:${fontFamily};font-size:${size}px;font-weight:700;line-height:1.15;color:${textColor};letter-spacing:-0.02em">
            ${emoji}${highlightedText}
          </h${lvl}>
        </div>`;
    }

    case "subheading": {
      const highlightedSub = highlightWords(String(d.text || ""), String(d.highlight || ""));
      return `
        <div style="margin:14px 0 8px 0;text-align:${align}">
          <h2 style="margin:0;font-family:${fontFamily};font-size:22px;font-weight:500;line-height:1.3;color:${textColor}">
            ${highlightedSub}
          </h2>
        </div>`;
    }

    case "paragraph": {
      const fontSize = s.fontSize || 16;
      const paragraphContent = String(d.text || "");
      // The paragraph field stores rich HTML from the editor — render without escaping
      if (/<(p|div|h[1-6]|ul|ol|table|blockquote|pre)/i.test(paragraphContent)) {
        return `
          <div style="margin:0 0 18px 0;font-family:${fontFamily};font-size:${fontSize}px;line-height:1.7;color:${textColor};text-align:${align}">
            ${paragraphContent}
          </div>`;
      }
      return `
        <p style="margin:0 0 18px 0;font-family:${fontFamily};font-size:${fontSize}px;line-height:1.7;color:${textColor};text-align:${align}">
          ${paragraphContent.replace(/\n/g, "<br />")}
        </p>`;
    }

    case "richtext": {
      return `
        <div style="margin:0 0 18px 0;font-family:${fontFamily};font-size:16px;line-height:1.7;color:${textColor};text-align:${align}">
          ${d.html || ""}
        </div>`;
    }

    case "highlight": {
      const emoji = d.emoji ? `<span style="margin-right:10px;font-size:20px">${esc(d.emoji)}</span>` : "";
      const noteHtml = d.note ? `<p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;line-height:1.5">${esc(d.note)}</p>` : "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          <tr>
            <td style="padding:18px 22px;background:#FDF9EA;border-left:5px solid #F3E6BF;border-radius:0 10px 10px 0">
              <p style="margin:0;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:20px;font-weight:600;line-height:1.55;color:#111827">
                ${emoji}${esc(d.text)}
              </p>
              ${noteHtml}
            </td>
          </tr>
        </table>`;
    }

    case "quote": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
          <tr>
            <td style="padding:0 0 0 20px;border-left:4px solid ${accent}">
              <p style="margin:0 0 10px 0;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:20px;font-style:italic;line-height:1.5;color:#1f2937">
                &ldquo;${esc(d.quote || d.text || "")}&rdquo;
              </p>
              ${d.author ? `<p style="margin:0;font-size:13px;font-weight:600;color:#6b7280">— ${esc(d.author)}${d.role ? `<span style="font-weight:400;color:#9ca3af">, ${esc(d.role)}</span>` : ""}</p>` : ""}
            </td>
          </tr>
        </table>`;
    }

    case "callout": {
      const tone = d.tone || "tip";
      const tones: Record<string, { bg: string; border: string; accent: string }> = {
        warning: { bg: "#fef2f2", border: "#fecaca", accent: "#b91c1c" },
        success: { bg: "#ecfdf5", border: "#a7f3d0", accent: "#047857" },
        info: { bg: "#eff6ff", border: "#bfdbfe", accent: "#1d4ed8" },
        tip: { bg: "#fffbeb", border: "#fde68a", accent: "#b45309" },
      };
      const t = tones[tone as keyof typeof tones] || tones.tip;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:20px 22px;background:${t.bg};border:1px solid ${t.border}">
              ${d.emoji ? `<p style="margin:0 0 8px 0;font-size:22px">${esc(d.emoji)}</p>` : ""}
              ${d.title ? `<p style="margin:0 0 8px 0;font-size:15px;font-weight:700;color:${t.accent}">${esc(d.title)}</p>` : ""}
              <p style="margin:0;font-size:14px;line-height:1.6;color:#374151">${esc(d.body || d.text || "")}</p>
            </td>
          </tr>
        </table>`;
    }

    case "divider": {
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;line-height:0">&nbsp;</td></tr></table>`;
    }

    case "spacer": {
      const height = d.height || 24;
      return `<div style="height:${height}px;line-height:${height}px;font-size:0">&nbsp;</div>`;
    }

    case "button": {
      const btnAlign = d.align || align || "center";
      const variant = d.variant || "primary";
      const variantStyles: Record<string, { bg: string; color: string }> = {
        primary: { bg: "#0d21a1", color: "#ffffff" },
        accent: { bg: "#ffd51d", color: "#111827" },
        outline: { bg: "transparent", color: "#111827" },
        dark: { bg: "#111827", color: "#ffffff" },
      };
      const vs = variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary;
      const btnBg = vs.bg;
      const btnColor = vs.color;
      const btnBorder = variant === "outline" ? "border:2px solid #d1d5db;" : "";
      const btnRadius = s.radius ?? 24;
      const iconHtml = d.icon === "arrow" ? " &rarr;" : d.icon === "external" ? " &#8599;" : "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
          <tr>
            <td align="${btnAlign}">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:${btnBg};border-radius:${btnRadius}px;${btnBorder}">
                    <a href="${esc(d.url || "#")}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;color:${btnColor};text-decoration:none;font-size:15px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.2px;border-radius:${btnRadius}px">
                      ${esc(d.label || d.text || "Click here")}${iconHtml}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case "image": {
      const variant = (d.variant as string) || "image";

      if (variant === "banner") {
        const height = d.height || 260;
        const overlay = d.overlay ?? 0.25;
        if (d.src) {
          return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden">
              <tr>
                <td style="padding:0;height:${height}px;position:relative">
                  <img src="${esc(d.src)}" alt="${esc(d.title || "")}" style="width:100%;height:auto;display:block" />
                  ${(d.title || d.subtitle) ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="position:absolute;top:0;left:0;width:100%;height:100%">
                    <tr>
                      <td style="padding:40px 28px;background:rgba(0,0,0,${overlay});vertical-align:bottom">
                        ${d.title ? `<p style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;font-family:Georgia,Cambria,serif">${esc(d.title)}</p>` : ""}
                        ${d.subtitle ? `<p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.5">${esc(d.subtitle)}</p>` : ""}
                      </td>
                    </tr>
                  </table>` : ""}
                </td>
              </tr>
            </table>`;
        }
        return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden">
            <tr>
              <td style="padding:40px 28px;height:${height}px;background:${accent};vertical-align:bottom">
                ${d.title ? `<p style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;font-family:Georgia,Cambria,serif">${esc(d.title)}</p>` : ""}
                ${d.subtitle ? `<p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.5">${esc(d.subtitle)}</p>` : ""}
              </td>
            </tr>
          </table>`;
      }

      if (!d.src) return "";
      const borderRadius = s.radius || 12;
      const imgWidth = Number(d.width) || 100;
      const imgStyle = `max-width:${imgWidth}%;height:auto;border-radius:${borderRadius}px;display:block;${align === "center" ? "margin:0 auto" : ""}${d.ratio && d.ratio !== "auto" ? `;aspect-ratio:${d.ratio};object-fit:cover` : ""}`;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          <tr>
            <td style="text-align:${align}">
              ${d.url ? `<a href="${esc(d.url)}" target="_blank" style="text-decoration:none">` : ""}
                <img src="${esc(d.src)}" alt="${esc(d.alt || "")}" style="${imgStyle}" />
              ${d.url ? `</a>` : ""}
            </td>
          </tr>
          ${d.caption || d.credit ? `<tr><td style="padding-top:8px;text-align:center">
            ${d.caption ? `<p style="margin:0;font-size:12px;color:#8b8f98">${esc(d.caption)}</p>` : ""}
            ${d.credit ? `<p style="margin:2px 0 0 0;font-size:10px;color:#b0afa8">${esc(d.credit)}</p>` : ""}
          </td></tr>` : ""}
        </table>`;
    }

    case "greeting": {
      const greetingAlign = s.align || "left";
      const greetingFontSize = s.fontSize || 28;
      return `
        <div style="margin:20px 0;text-align:${greetingAlign}">
          <p style="margin:0;font-family:${fontFamily};font-size:${greetingFontSize}px;font-weight:700;line-height:1.3;color:${textColor}">
            ${esc(d.text || "Hello {name},")}
          </p>
        </div>`;
    }

    case "socialShare": {
      const shareTitle = d.title ? `<p style="margin:0 0 6px 0;font-size:18px;font-weight:700;color:#111827;text-align:${align}">${esc(d.title)}</p>` : "";
      const shareSubtitle = d.subtitle ? `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#4b5563;text-align:${align}">${esc(d.subtitle)}</p>` : "";

      // Build URL lookup from platforms array
      const spByPlat: Record<string, string> = {};
      for (const p of ((d.platforms ?? []) as { platform: string; url: string }[])) {
        spByPlat[p.platform] = p.url;
      }

      const ALL_PLATFORMS = ["x", "linkedin", "instagram", "youtube", "tiktok", "threads", "whatsapp", "substack", "website"] as const;
      // Use custom order if provided
      const platformOrder = (Array.isArray(d.platformOrder) && d.platformOrder.length > 0)
        ? (d.platformOrder as string[]).filter((p: string) => ALL_PLATFORMS.includes(p as typeof ALL_PLATFORMS[number]))
        : [...ALL_PLATFORMS];

      const sharePlatforms = platformOrder
        .filter((key) => Boolean(d[`platform_${key}`]))
        .map((key) => {
          const socialIcon = SOCIAL_SVG[key as keyof typeof SOCIAL_SVG];
          if (!socialIcon) return null;
          const url = spByPlat[key] || "#";
          // Use custom label if provided
          const customLabel = String(d[`platformLabel_${key}`] ?? "").trim();
          const label = customLabel || socialIcon.label;
          const iconHtml = `<span style="display:inline-block;vertical-align:middle;margin-right:6px;color:${socialIcon.color}">${socialIcon.svg}</span>`;
          return `<td style="padding:0 4px 8px 4px">
            <a href="${esc(url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 18px;background:#f3f4f6;border-radius:20px;color:#111827;text-decoration:none;font-size:13px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
              ${iconHtml}<span style="vertical-align:middle">${esc(label)}</span>
            </a>
          </td>`;
        })
        .filter(Boolean);
      const socialLinksHtml = sharePlatforms.length
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px auto"><tr>${sharePlatforms.join("")}</tr></table>`
        : "";

      const showCta = d.showCta !== false;
      const ctaBtn = showCta && d.ctaLabel && d.url
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px 0"><tr><td align="${align}">
            <a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;background:#0d21a1;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${esc(d.ctaLabel)}</a>
          </td></tr></table>`
        : "";

      return `
        <div style="margin:20px 0;text-align:${align}">
          ${shareTitle}
          ${shareSubtitle}
          ${socialLinksHtml}
          ${ctaBtn}
        </div>`;
    }

    case "hero": {
      const heroAccent = s.accentColor || accent;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0">
          <tr>
            <td style="padding:28px 0;border-bottom:3px solid ${heroAccent}">
              ${d.showLogo !== false && d.logo ? `<p style="margin:0 0 10px 0;font-size:15px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${heroAccent}">${esc(d.logo)}</p>` : ""}
              ${d.eyebrow ? `<p style="margin:0 0 8px 0;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8b8f98">${esc(d.eyebrow)}</p>` : ""}
              <h1 style="margin:0 0 12px 0;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:36px;font-weight:700;line-height:1.12;color:#111827;letter-spacing:-0.02em">
                ${esc(d.title)}
              </h1>
              ${d.subtitle ? `<p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#4b5563;max-width:480px">${esc(d.subtitle)}</p>` : ""}
              ${d.image ? `<img src="${esc(d.image)}" alt="" style="max-width:100%;height:auto;border-radius:12px;display:block;margin-top:4px" />` : ""}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px">
                <tr>
                  ${d.ctaLabel ? `<td style="background:${heroAccent};border-radius:8px"><a href="${esc(d.ctaUrl || "#")}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px">${esc(d.ctaLabel)}</a></td>` : ""}
                  ${d.ctaLabel && d.secondaryLabel ? `<td width="10"></td>` : ""}
                  ${d.secondaryLabel ? `<td style="border:1px solid #d1d5db;border-radius:8px"><a href="${esc(d.secondaryUrl || "#")}" target="_blank" style="display:inline-block;padding:11px 28px;color:#111827;text-decoration:none;font-size:14px;font-weight:500;border-radius:8px">${esc(d.secondaryLabel)}</a></td>` : ""}
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case "authorCard": {
      const avatarSrc = d.avatar || `${SITE.url}/favicon-48x48.png`;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td style="padding:20px;background:#fafaf8">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" valign="top" style="padding-right:18px">
                    <img src="${esc(avatarSrc)}" alt="" width="60" height="60" style="border-radius:50%;display:block;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.08)" />
                  </td>
                  <td valign="top">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#111827">${esc(d.name || "Sagar Lad")}</p>
                    ${d.role ? `<p style="margin:3px 0 10px 0;font-size:12.5px;color:#6b7280">${esc(d.role)}</p>` : ""}
                    ${d.bio ? `<p style="margin:0;font-size:13.5px;line-height:1.55;color:#4b5563">${esc(d.bio)}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case "signature": {
      const logoVariant = String(d.logoVariant || "color");
      const logoPath = logoVariant === "white" ? "/logos/site-logo-white.png" : "/logos/site-logo.png";
      const logoSize = Number(d.logoSize) || 32;
      const imageOnly = d.imageOnly === true;
      const logoFilter = logoVariant === "black"
        ? "filter:grayscale(1) brightness(0);"
        : logoVariant === "white"
          ? "filter:brightness(0) invert(1);"
          : "";
      const logoHtml = d.showLogo
        ? `<img src="${esc(`${SITE.url}${logoPath}`)}" alt="" style="height:${logoSize}px;width:auto;display:block;margin-top:12px;${logoFilter}" />`
        : "";
      if (imageOnly && d.showLogo) {
        return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 16px 0">
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:left">
                ${logoHtml}
              </td>
            </tr>
          </table>`;
      }
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 16px 0">
          <tr>
            <td style="border-top:1px solid #e5e7eb;padding-top:20px">
              <p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#374151">${esc(d.text || "Warm regards,")}</p>
              <p style="margin:0;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:24px;font-style:italic;color:#111827">${esc(d.name || "Sagar")}</p>
              ${d.role ? `<p style="margin:4px 0 0 0;font-size:12.5px;color:#8b8f98">${esc(d.role)}</p>` : ""}
              ${logoHtml}
            </td>
          </tr>
        </table>`;
    }

    case "footer": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0 0 0;border-top:1px solid #e5e7eb">
          <tr>
            <td style="padding-top:24px;text-align:center;font-size:12px;color:#8b8f98;line-height:1.7">
              ${d.note ? `<p style="margin:0 0 6px 0">${esc(d.note)}</p>` : ""}
              ${d.address ? `<p style="margin:0 0 6px 0">${esc(d.address)}</p>` : ""}
              <p style="margin:0 0 14px 0">${esc(d.copyright || "© 2026 Sagar Lad. All rights reserved.")}</p>
              <p style="margin:0">
                <a href="${esc(d.unsubscribeUrl || "#")}" style="color:#6b7280;text-decoration:underline;font-weight:500">${esc(d.unsubscribeLabel || "Unsubscribe")}</a>
                <span style="margin:0 8px;color:#d1d5db">|</span>
                <a href="${esc(SITE.url)}" style="color:#6b7280;text-decoration:underline;font-weight:500">${esc(SITE.name)}</a>
              </p>
            </td>
          </tr>
        </table>`;
    }

    case "list": {
      const items = (d.items || []) as { text: string }[];
      const isOrdered = d.type === "ordered" || d.style === "number";
      const lis = items.map((it, i) => {
        const text = typeof it === "string" ? it : it.text || "";
        const bullet = d.style === "number" ? `${i + 1}.` : d.style === "arrow" ? "→" : "•";
        return `<tr><td style="padding:4px 0;vertical-align:top;width:24px;color:${accent};font-weight:600;font-size:15px">${bullet}</td><td style="padding:4px 0;font-size:15px;line-height:1.6;color:${textColor}">${esc(text)}</td></tr>`;
      }).join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0">
          ${lis}
        </table>`;
    }

    case "checklist": {
      const items = (d.items || []) as { text: string; done: boolean }[];
      const lis = items
        .map(
          (it) =>
            `<tr>
              <td style="padding:5px 12px 5px 0;vertical-align:top;font-size:16px;color:${it.done ? "#10b981" : "#d1d5db"}">${it.done ? "✓" : "○"}</td>
              <td style="padding:5px 0;font-size:15px;line-height:1.6;color:${textColor};${it.done ? "text-decoration:line-through;color:#9ca3af" : ""}">${esc(it.text)}</td>
            </tr>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0">
          ${lis}
        </table>`;
    }

    case "columns2": {
      const cols = (d.columns || []) as { heading: string; body: string }[];
      const colCount = Number(d.count) || 2;
      const colWidth = colCount === 2 ? "48%" : "31%";
      const paddingRight = colCount === 2 ? "4%" : "3.5%";
      const cells = cols.slice(0, colCount).map(
        (col, i) =>
          `<td width="${colWidth}" valign="top" style="padding-right:${i < colCount - 1 ? paddingRight : "0"}">
            ${col.heading ? `<p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#111827">${esc(col.heading)}</p>` : ""}
            <p style="margin:0;font-size:15px;line-height:1.6;color:${textColor}">${esc(col.body || "")}</p>
          </td>`
      ).join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
          <tr>${cells}</tr>
        </table>`;
    }

    case "card": {
      const cardRadius = s.radius || 14;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:${cardRadius}px;overflow:hidden;${s.shadow === "soft" ? "box-shadow:0 2px 12px rgba(0,0,0,0.06)" : ""}">
          ${d.image ? `<tr><td><img src="${esc(d.image)}" alt="" style="width:100%;height:auto;display:block" /></td></tr>` : ""}
          <tr>
            <td style="padding:20px 22px">
              ${d.eyebrow ? `<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8b8f98">${esc(d.eyebrow)}</p>` : ""}
              ${d.title ? `<p style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#111827;line-height:1.3">${esc(d.title)}</p>` : ""}
              ${d.body ? `<p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563">${esc(d.body)}</p>` : ""}
              ${d.linkUrl ? `<p style="margin:14px 0 0 0"><a href="${esc(d.linkUrl)}" target="_blank" style="color:${accent};font-size:14px;font-weight:600;text-decoration:none">${esc(d.linkLabel || "Read more")} →</a></p>` : ""}
            </td>
          </tr>
        </table>`;
    }

    case "featureGrid": {
      const items = (d.items || []) as { emoji: string; title: string; body: string }[];
      const cols = Number(d.columns) || 2;
      const colWidth = Math.floor(100 / cols) + "%";
      const cellStyle = `padding:16px;text-align:center;background:#fafaf8;border:1px solid #e5e7eb;border-radius:14px;vertical-align:top`;
      const rows: { emoji: string; title: string; body: string }[][] = [];
      for (let i = 0; i < items.length; i += cols) {
        rows.push(items.slice(i, i + cols));
      }
      const tableRows = rows
        .map((row) => {
          const cells = row
            .map(
              (it) =>
                `<td width="${colWidth}" style="${cellStyle}">
                  ${it.emoji ? `<p style="margin:0 0 10px 0;font-size:32px">${esc(it.emoji)}</p>` : ""}
                  <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#111827">${esc(it.title)}</p>
                  <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280">${esc(it.body)}</p>
                </td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      const titleHtml = d.title ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px 0"><tr><td style="text-align:center"><h3 style="margin:0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3></td></tr></table>` : "";
      return `
        ${titleHtml}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-spacing:14px">
          ${tableRows}
        </table>`;
    }

    case "table": {
      const headers = (d.headers || []) as { text: string }[];
      const rows = (d.rows || []) as { cells: string }[];
      const colCount = headers.length || 1;
      const ths = headers
        .map(
          (h) =>
            `<th style="padding:12px 16px;background:#f7f6f2;border-bottom:2px solid #e5e7eb;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left">${esc(h.text)}</th>`
        )
        .join("");
      const trs = rows
        .map((row, ri) => {
          const cells = (row.cells || "")
            .split("|")
            .map(
              (c) =>
                `<td style="padding:12px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;line-height:1.5;color:#374151${ri % 2 === 1 ? ";background:#fafaf8" : ""}">${esc(c.trim())}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs}</tbody>
        </table>`;
    }

    case "stats": {
      const items = (d.items || []) as { label: string; value: string }[];
      const pct = Math.round(100 / (items.length || 1));
      const cells = items
        .map(
          (it, i) =>
            `<td width="${pct}%" valign="top" style="padding:20px 16px;text-align:center${i < items.length - 1 ? ";border-right:1px solid #f1f1f1" : ""}">
              <p style="margin:0 0 6px 0;font-size:36px;font-weight:800;color:${accent};line-height:1">${esc(it.value)}</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">${esc(it.label)}</p>
            </td>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <tr>${cells}</tr>
        </table>`;
    }

    case "timeline": {
      const items = (d.items || []) as { date: string; title: string; body: string; color: string }[];
      const entries = items
        .map(
          (it, i) =>
            `<tr>
              <td width="20" valign="top" style="padding-right:14px;text-align:center">
                <div style="width:12px;height:12px;border-radius:50%;background:${it.color || accent};margin-top:4px"></div>
                ${i < items.length - 1 ? `<div style="width:2px;height:100%;background:#e5e7eb;margin:4px auto 0"></div>` : ""}
              </td>
              <td valign="top" style="padding:0 0 20px 0">
                ${it.date ? `<p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#8b8f98;text-transform:uppercase;letter-spacing:1px">${esc(it.date)}</p>` : ""}
                ${it.title ? `<p style="margin:0 0 4px 0;font-size:16px;font-weight:700;color:#111827">${esc(it.title)}</p>` : ""}
                ${it.body ? `<p style="margin:0;font-size:14px;line-height:1.55;color:#4b5563">${esc(it.body)}</p>` : ""}
              </td>
            </tr>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          ${entries}
        </table>`;
    }

    case "gallery": {
      const items = (d.items || []) as { src: string; alt: string; caption?: string }[];
      const cols = d.columns || 2;
      const pct = Math.round(100 / (items.length || 1));
      const cells = items
        .map(
          (it) =>
            `<td width="${pct}%" style="padding:4px">
              <img src="${esc(it.src)}" alt="${esc(it.alt || "")}" style="width:100%;height:auto;border-radius:10px;display:block" />
              ${it.caption ? `<p style="margin:6px 0 0 0;font-size:11px;color:#8b8f98;text-align:center">${esc(it.caption)}</p>` : ""}
            </td>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          <tr>${cells}</tr>
        </table>`;
    }

    case "video": {
      const videoUrlStr = String(d.url || d.embedUrl || "");
      const thumb = getVideoThumbnail(videoUrlStr, d.thumbnail ? String(d.thumbnail) : undefined);
      const videoUrl = videoUrlStr || "#";
      const vidWidth = Number(d.width) || 100;
      return `
        <table role="presentation" width="${vidWidth}%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb${vidWidth < 100 ? ";display:inline-table" : ""}">
          <tr>
            <td style="background:#0f172a;text-align:center;padding:0">
              <a href="${esc(videoUrl)}" target="_blank" style="text-decoration:none;display:block">
                ${thumb
                  ? `<img src="${esc(thumb)}" alt="${esc(d.title || "Video")}" style="width:100%;height:auto;display:block;opacity:0.85" />`
                  : `<div style="padding:60px 20px;color:#94a3b8;font-size:14px">Video</div>`
                }
              </a>
            </td>
          </tr>
          ${d.title ? `<tr><td style="padding:14px 18px;background:#ffffff">
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827">${esc(d.title)}</p>
            ${d.caption ? `<p style="margin:4px 0 0 0;font-size:13px;color:#6b7280">${esc(d.caption)}</p>` : ""}
          </td></tr>` : ""}
        </table>`;
    }

    case "subscribe": {
      const newsletterUrl = `${SITE.url}/newsletter`;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td style="padding:28px 24px;background:#111827;text-align:center">
              ${d.title ? `<p style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#ffffff">${esc(d.title)}</p>` : ""}
              ${d.body ? `<p style="margin:0 0 20px 0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.7)">${esc(d.body)}</p>` : ""}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>
                  <td align="center" style="background:${accent};border-radius:8px">
                    <a href="${esc(newsletterUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;color:#111827;text-decoration:none;font-size:15px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;border-radius:8px">
                      ${esc(d.buttonLabel || "Subscribe")}
                    </a>
                  </td>
                </tr>
              </table>
              ${d.note ? `<p style="margin:14px 0 0 0;font-size:12px;color:rgba(255,255,255,0.5)">${esc(d.note)}</p>` : ""}
            </td>
          </tr>
        </table>`;
    }

    case "readingList": {
      const items = (d.items || []) as { title: string; source: string; url: string; description: string }[];
      const list = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f1f1f1">
              <tr><td>
                <a href="${esc(it.url || "#")}" target="_blank" style="text-decoration:none">
                  <p style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:${accent}">${esc(it.title)}</p>
                </a>
                ${it.source ? `<p style="margin:0 0 4px 0;font-size:12px;color:#8b8f98">${esc(it.source)}</p>` : ""}
                ${it.description ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563">${esc(it.description)}</p>` : ""}
              </td></tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${list}
        </div>`;
    }

    case "resources": {
      const items = (d.items || []) as { title: string; type: string; url: string; description: string }[];
      const list = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:14px 18px;background:#fafaf8">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td valign="top">
                      <a href="${esc(it.url || "#")}" target="_blank" style="text-decoration:none">
                        <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:${accent}">${esc(it.title)}</p>
                      </a>
                      ${it.description ? `<p style="margin:4px 0 0 0;font-size:13px;line-height:1.5;color:#4b5563">${esc(it.description)}</p>` : ""}
                    </td>
                    ${it.type ? `<td valign="top" style="padding-left:14px;white-space:nowrap"><span style="display:inline-block;padding:3px 10px;background:#e5e7eb;border-radius:12px;font-size:11px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.3px">${esc(it.type)}</span></td>` : ""}
                  </tr></table>
                </td>
              </tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${list}
        </div>`;
    }

    case "booksRead": {
      const items = (d.items || []) as { title: string; author?: string; note?: string; imageUrl?: string; buyUrl?: string }[];
      const entries = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:16px;background:#fafaf8">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    ${it.imageUrl ? `<td width="60" valign="top" style="padding-right:16px"><img src="${esc(it.imageUrl)}" alt="" width="60" style="width:60px;height:auto;border-radius:8px;display:block" /></td>` : ""}
                    <td valign="top">
                      <p style="margin:0 0 3px 0;font-size:16px;font-weight:700;color:#111827">${esc(it.title)}</p>
                      ${it.author ? `<p style="margin:0 0 6px 0;font-size:12px;color:#6b7280">${esc(it.author)}</p>` : ""}
                      ${it.note ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563;font-style:italic">${esc(it.note)}</p>` : ""}
                    </td>
                    ${it.buyUrl ? `<td width="1" valign="top" style="padding-left:14px"><a href="${esc(it.buyUrl)}" target="_blank" style="display:inline-block;padding:6px 14px;background:${accent};color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;border-radius:6px;white-space:nowrap">Buy →</a></td>` : ""}
                  </tr></table>
                </td>
              </tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${entries}
        </div>`;
    }

    case "booksPublished": {
      const items = (d.items || []) as { title: string; tagline?: string; imageUrl?: string; buyUrl?: string }[];
      const entries = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:16px;background:#fafaf8">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    ${it.imageUrl ? `<td width="60" valign="top" style="padding-right:16px"><img src="${esc(it.imageUrl)}" alt="" width="60" style="width:60px;height:auto;border-radius:8px;display:block" /></td>` : ""}
                    <td valign="top">
                      <p style="margin:0 0 3px 0;font-size:16px;font-weight:700;color:#111827">${esc(it.title)}</p>
                      ${it.tagline ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563">${esc(it.tagline)}</p>` : ""}
                    </td>
                    ${it.buyUrl ? `<td width="1" valign="top" style="padding-left:14px"><a href="${esc(it.buyUrl)}" target="_blank" style="display:inline-block;padding:6px 14px;background:${accent};color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;border-radius:6px;white-space:nowrap">Buy →</a></td>` : ""}
                  </tr></table>
                </td>
              </tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${entries}
        </div>`;
    }

    case "ebooks": {
      const items = (d.items || []) as { title: string; description?: string; imageUrl?: string; free?: boolean }[];
      const entries = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:16px;background:#fafaf8">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    ${it.imageUrl ? `<td width="60" valign="top" style="padding-right:16px"><img src="${esc(it.imageUrl)}" alt="" width="60" style="width:60px;height:auto;border-radius:8px;display:block" /></td>` : ""}
                    <td valign="top">
                      <p style="margin:0 0 3px 0;font-size:16px;font-weight:700;color:#111827">${esc(it.title)}</p>
                      ${it.description ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563">${esc(it.description)}</p>` : ""}
                    </td>
                    <td width="1" valign="top" style="padding-left:14px">
                      <span style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;${it.free !== false ? "background:#d1fae5;color:#065f46" : "background:#fef3c7;color:#92400e"}">${it.free !== false ? "Free" : "Premium"}</span>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${entries}
        </div>`;
    }

    case "videoFeed": {
      const items = (d.items || []) as { title: string; thumbnail?: string; embedUrl?: string }[];
      const entries = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:16px;background:#fafaf8">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    ${it.thumbnail ? `<td width="130" valign="top" style="padding-right:16px"><a href="${esc(it.embedUrl || "#")}" target="_blank" style="text-decoration:none"><img src="${esc(it.thumbnail)}" alt="" width="130" style="width:130px;height:auto;border-radius:10px;display:block" /></a></td>` : ""}
                    <td valign="top">
                      <p style="margin:0 0 8px 0;font-size:16px;font-weight:700;color:#111827;line-height:1.3">${esc(it.title)}</p>
                      ${it.embedUrl ? `<a href="${esc(it.embedUrl)}" target="_blank" style="display:inline-block;padding:6px 14px;background:${accent};color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;border-radius:6px">Watch video →</a>` : ""}
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${entries}
        </div>`;
    }

    case "blogPosts": {
      const items = (d.items || []) as { title: string; slug?: string; excerpt?: string; coverImage?: string }[];
      const entries = items
        .map(
          (it) => {
            const url = it.slug ? `https://sagarlad.com/blog/${esc(it.slug)}` : "#";
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <tr>
                <td style="padding:16px;background:#fafaf8">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                    ${it.coverImage ? `<td width="130" valign="top" style="padding-right:16px"><a href="${url}" target="_blank" style="text-decoration:none"><img src="${esc(it.coverImage)}" alt="" width="130" style="width:130px;height:auto;border-radius:10px;display:block" /></a></td>` : ""}
                    <td valign="top">
                      <a href="${url}" target="_blank" style="text-decoration:none">
                        <p style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:${accent};line-height:1.3">${esc(it.title)}</p>
                      </a>
                      ${it.excerpt ? `<p style="margin:0;font-size:13px;line-height:1.5;color:#4b5563">${esc(it.excerpt)}</p>` : ""}
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>`;
          }
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 14px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${entries}
        </div>`;
    }

    default: {
      if (d.text) {
        return `<p style="margin:0 0 18px 0;font-family:${fontFamily};font-size:15px;line-height:1.7;color:${textColor}">${esc(d.text)}</p>`;
      }
      return "";
    }
  }
}

/**
 * Compiles a NewsletterDoc into full, responsive email HTML ready for Brevo delivery.
 */
export type DbData = {
  booksRead: { id: string; title: string; author?: string | null; note?: string | null; imageUrl?: string | null; buyUrl?: string | null }[];
  booksPublished: { id: string; title: string; tagline?: string | null; buyUrl?: string | null; imageUrl?: string | null }[];
  ebooks: { id: string; title: string; description?: string | null; free?: boolean; imageUrl?: string | null; buyUrl?: string | null }[];
  quotes: { id: string; text: string; tag?: string }[];
  videos: { id: string; title: string; embedUrl: string; thumbnail?: string | null; slug?: string | null }[];
  blogs: { id: string; title: string; slug: string; excerpt?: string | null; coverImage?: string | null }[];
};

/**
 * Compiles a NewsletterDoc into full, responsive email HTML ready for Brevo delivery.
 */
export function compileNewsletterToHtml(
  doc: NewsletterDoc,
  unsubscribeToken: string = "test",
  dbData?: DbData,
): string {
  const unsubscribeUrl = `${SITE.url}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  /** Resolve selectedIds to actual items from dbData */
  function resolveItems(blockType: keyof DbData, selectedIds?: string[]) {
    if (!dbData) return [];
    const all = dbData[blockType] ?? [];
    return selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  }

  // Auto-fill footer block unsubscribe URLs and resolve database blocks
  const blocks = doc.blocks.map((block) => {
    let b = block;
    if (b.type === "footer" && (!b.data.unsubscribeUrl || b.data.unsubscribeUrl === "#")) {
      b = { ...b, data: { ...b.data, unsubscribeUrl } };
    }
    // Resolve database blocks: store items in data so renderBlockHtml can read them
    const DB_TYPES: Record<string, keyof DbData> = {
      booksRead: "booksRead",
      booksPublished: "booksPublished",
      ebooks: "ebooks",
      quotes: "quotes",
      videoFeed: "videos",
      blogPosts: "blogs",
    };
    if (DB_TYPES[b.type]) {
      const items = resolveItems(DB_TYPES[b.type], b.data.selectedIds as string[] | undefined);
      b = { ...b, data: { ...b.data, items } };
    }
    return b;
  });
  const blocksHtml = blocks.map(renderBlockHtml).join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(doc.title || SITE.name)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-content { padding: 20px 16px !important; }
      .email-outer { padding: 16px 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${doc.previewText ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${esc(doc.previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-outer" style="background-color:#f4f3ef;padding:32px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="email-container" style="max-width:620px;width:620px;background-color:#ffffff;border-radius:20px;border:1px solid #e5e7eb;overflow:hidden">
          <tr>
            <td class="email-content" style="padding:36px 32px">
              ${blocksHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <script>
    (function(){
      function sendHeight(){
        try{var h=document.body.scrollHeight;window.parent.postMessage({type:'email-preview-height',height:h},'*')}catch(e){}
      }
      if(document.readyState==='complete')sendHeight();
      else window.addEventListener('load',sendHeight);
      window.addEventListener('resize',sendHeight);
    })();
  </script>
</body>
</html>`;
}
