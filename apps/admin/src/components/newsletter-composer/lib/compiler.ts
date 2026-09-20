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
      return `
        <div style="margin:20px 0 10px 0;text-align:${align}">
          ${eyebrow}
          <h${lvl} style="margin:0;font-family:${fontFamily};font-size:${size}px;font-weight:700;line-height:1.15;color:${textColor};letter-spacing:-0.02em">
            ${emoji}${esc(d.text)}
          </h${lvl}>
        </div>`;
    }

    case "subheading": {
      return `
        <div style="margin:14px 0 8px 0;text-align:${align}">
          <h2 style="margin:0;font-family:${fontFamily};font-size:22px;font-weight:500;line-height:1.3;color:${textColor}">
            ${esc(d.text)}
          </h2>
        </div>`;
    }

    case "paragraph": {
      const fontSize = s.fontSize || 16;
      return `
        <p style="margin:0 0 18px 0;font-family:${fontFamily};font-size:${fontSize}px;line-height:1.7;color:${textColor};text-align:${align}">
          ${esc(d.text || "").replace(/\n/g, "<br />")}
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
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:10px;overflow:hidden">
          <tr>
            <td style="padding:18px 22px;background:#fffdf0;border-left:5px solid #ffd51d">
              <p style="margin:0;font-family:${fontFamily};font-size:16px;font-weight:600;line-height:1.55;color:#111827">
                ${emoji}${esc(d.text)}
              </p>
              ${d.note ? `<p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;line-height:1.5">${esc(d.note)}</p>` : ""}
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
      if (!d.src) return "";
      const borderRadius = s.radius || 12;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          <tr>
            <td style="text-align:${align}">
              ${d.url ? `<a href="${esc(d.url)}" target="_blank" style="text-decoration:none">` : ""}
                <img src="${esc(d.src)}" alt="${esc(d.alt || "")}" style="max-width:100%;height:auto;border-radius:${borderRadius}px;display:block;${align === "center" ? "margin:0 auto" : ""}" />
              ${d.url ? `</a>` : ""}
            </td>
          </tr>
          ${d.caption || d.credit ? `<tr><td style="padding-top:8px;text-align:center">
            ${d.caption ? `<p style="margin:0;font-size:12px;color:#8b8f98">${esc(d.caption)}</p>` : ""}
            ${d.credit ? `<p style="margin:2px 0 0 0;font-size:10px;color:#b0afa8">${esc(d.credit)}</p>` : ""}
          </td></tr>` : ""}
        </table>`;
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
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 16px 0">
          <tr>
            <td style="border-top:1px solid #e5e7eb;padding-top:20px">
              <p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#374151">${esc(d.text || "Warm regards,")}</p>
              <p style="margin:0;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:24px;font-style:italic;color:#111827">${esc(d.name || "Sagar")}</p>
              ${d.role ? `<p style="margin:4px 0 0 0;font-size:12.5px;color:#8b8f98">${esc(d.role)}</p>` : ""}
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
      const colCount = (d.count as number) || 2;
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

    case "code": {
      const lang = d.language
        ? `<div style="padding:10px 16px;background:#1e293b;border-bottom:1px solid #334155;font-size:12px;color:#94a3b8;font-family:monospace;text-transform:uppercase;letter-spacing:0.5px">${esc(d.language)}</div>`
        : "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:10px;overflow:hidden;border:1px solid #334155">
          <tr><td>
            ${lang}
            <pre style="margin:0;padding:18px;background:#0f172a;overflow-x:auto;font-size:13px;line-height:1.65;color:#e2e8f0;font-family:'SF Mono',Consolas,'Liberation Mono',Menlo,monospace"><code>${esc(d.code || "")}</code></pre>
          </td></tr>
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
      const colWidth = cols === 2 ? "48%" : "31%";
      const paddingRight = cols === 2 ? "4%" : "3.5%";
      const cells = items
        .map(
          (it) =>
            `<td width="${colWidth}" valign="top" style="padding:16px 12px;text-align:center;background:#fafaf8;border:1px solid #e5e7eb;border-radius:12px">
              ${it.emoji ? `<p style="margin:0 0 10px 0;font-size:32px">${esc(it.emoji)}</p>` : ""}
              <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#111827">${esc(it.title)}</p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280">${esc(it.body)}</p>
            </td>`
        )
        .join("");
      return `
        <div style="margin:20px 0">
          ${d.title ? `<h3 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:#111827;text-align:center">${esc(d.title)}</h3>` : ""}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="8">
            <tr>${cells}</tr>
          </table>
        </div>`;
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

    case "banner": {
      const bg = d.src ? `background-image:url('${esc(d.src)}');background-size:cover;background-position:center` : `background:${d.background || accent}`;
      const height = d.height || 260;
      const overlay = d.overlay ?? 0.25;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:0;height:${height}px;${bg}">
              <div style="background:rgba(0,0,0,${overlay});padding:40px 28px;text-align:left">
                ${d.title ? `<p style="margin:0 0 8px 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;font-family:Georgia,Cambria,serif">${esc(d.title)}</p>` : ""}
                ${d.subtitle ? `<p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.5">${esc(d.subtitle)}</p>` : ""}
              </div>
            </td>
          </tr>
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

    case "gif": {
      if (!d.src) return "";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
          <tr>
            <td style="text-align:${align}">
              <img src="${esc(d.src)}" alt="${esc(d.alt || "")}" style="max-width:100%;height:auto;border-radius:10px;display:block;${align === "center" ? "margin:0 auto" : ""}" />
              ${d.caption ? `<p style="margin:8px 0 0 0;font-size:12px;color:#8b8f98;text-align:center">${esc(d.caption)}</p>` : ""}
            </td>
          </tr>
        </table>`;
    }

    case "video": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td style="background:#0f172a;text-align:center;padding:0">
              <a href="${esc(d.url || d.embedUrl || "#")}" target="_blank" style="text-decoration:none;display:block">
                ${d.thumbnail
                  ? `<img src="${esc(d.thumbnail)}" alt="${esc(d.title || "")}" style="width:100%;height:auto;display:block;opacity:0.85" />`
                  : `<div style="padding:60px 20px;color:#94a3b8;font-size:14px">Video thumbnail</div>`
                }
              </a>
            </td>
          </tr>
          ${d.title ? `<tr><td style="padding:14px 18px;background:#ffffff">
            <p style="margin:0;font-size:15px;font-weight:600;color:#111827">${esc(d.title)}</p>
          </td></tr>` : ""}
        </table>`;
    }

    case "tweet": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">
          <tr>
            <td style="padding:18px 22px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top">
                    <p style="margin:0 0 2px 0;font-size:15px;font-weight:700;color:#111827">${esc(d.name || "")}</p>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280">${esc(d.handle || "")}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#111827">${esc(d.body || "")}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>${d.date ? `<p style="margin:0;font-size:12px;color:#8b8f98">${esc(d.date)}</p>` : ""}</td>
                  <td align="right">${d.url ? `<a href="${esc(d.url)}" target="_blank" style="color:${accent};font-size:13px;font-weight:600;text-decoration:none">View on X →</a>` : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case "subscribe": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td style="padding:28px 24px;background:#fafaf8;text-align:center">
              ${d.title ? `<p style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#111827">${esc(d.title)}</p>` : ""}
              ${d.body ? `<p style="margin:0 0 20px 0;font-size:14px;line-height:1.5;color:#6b7280">${esc(d.body)}</p>` : ""}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <input type="email" placeholder="${esc(d.placeholder || "Enter your email")}" style="width:100%;padding:12px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;color:#111827;box-sizing:border-box" />
                  </td>
                  <td width="12"></td>
                  <td>
                    <a href="#" style="display:inline-block;padding:12px 24px;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;white-space:nowrap">${esc(d.buttonLabel || "Subscribe")}</a>
                  </td>
                </tr>
              </table>
              ${d.note ? `<p style="margin:12px 0 0 0;font-size:11px;color:#9ca3af">${esc(d.note)}</p>` : ""}
            </td>
          </tr>
        </table>`;
    }

    case "socialShare": {
      const platforms = (d.platforms || []) as { platform: string; url: string; enabled: boolean }[];
      const pills = platforms
        .filter((p) => p.enabled)
        .map(
          (p) =>
            `<td style="padding:0 4px">
              <a href="${esc(p.url || "#")}" target="_blank" style="display:inline-block;padding:8px 18px;background:#f3f4f6;border-radius:20px;color:#374151;text-decoration:none;font-size:13px;font-weight:600">${esc(p.platform)}</a>
            </td>`
        )
        .join("");
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
          <tr>
            <td style="padding:24px;text-align:center;background:#fafaf8;border-radius:12px;border:1px solid #e5e7eb">
              ${d.title ? `<p style="margin:0 0 6px 0;font-size:17px;font-weight:700;color:#111827">${esc(d.title)}</p>` : ""}
              ${d.subtitle ? `<p style="margin:0 0 16px 0;font-size:13px;color:#6b7280">${esc(d.subtitle)}</p>` : ""}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
                <tr>${pills}</tr>
              </table>
              ${(d as any).ctaLabel ? `<p style="margin:16px 0 0 0"><a href="${esc(((d.platforms as any[])?.[0]?.url) || "#")}" target="_blank" style="display:inline-block;padding:12px 28px;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px">${esc((d as any).ctaLabel)}</a></p>` : ""}
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

    case "quotes": {
      const items = (d.items || []) as { text: string; tag?: string }[];
      const entries = items
        .map(
          (it) =>
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
              <tr>
                <td style="padding:16px 20px;border-left:4px solid ${accent};background:#f9fafb;border-radius:0 10px 10px 0">
                  <p style="margin:0 0 8px 0;font-family:Georgia,Cambria,serif;font-size:17px;font-style:italic;line-height:1.55;color:#1f2937">&ldquo;${esc(it.text)}&rdquo;</p>
                  ${it.tag ? `<p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280">${esc(it.tag)}</p>` : ""}
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
      .email-container { width: 100% !important; }
      .email-content { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${doc.previewText ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${esc(doc.previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f3ef;padding:32px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="email-container" style="max-width:620px;width:620px;background-color:#ffffff;border-radius:16px;border:1px solid #ece9e2;overflow:hidden">
          <tr>
            <td class="email-content" style="padding:36px 32px">
              ${blocksHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background-color:#fafaf8;border-top:1px solid #ece9e2">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;font-size:12px;color:#8b8f98;line-height:1.7">
                    <p style="margin:0 0 8px 0">You received this because you subscribed to ${esc(SITE.name)}.</p>
                    <p style="margin:0">
                      <a href="${esc(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;font-weight:500">Unsubscribe</a>
                      <span style="margin:0 8px;color:#d1d5db">|</span>
                      <a href="${esc(SITE.url)}" style="color:#6b7280;text-decoration:underline;font-weight:500">${esc(SITE.name)}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
