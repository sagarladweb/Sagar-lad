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
      const size = lvl === "1" ? 32 : lvl === "2" ? 26 : lvl === "3" ? 22 : 18;
      const eyebrow = d.eyebrow
        ? `<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8b8f98">${esc(d.eyebrow)}</p>`
        : "";
      const emoji = d.emoji ? `<span style="margin-right:8px">${esc(d.emoji)}</span>` : "";
      return `
        <div style="margin:16px 0 8px 0;text-align:${align}">
          ${eyebrow}
          <h${lvl} style="margin:0;font-family:${fontFamily};font-size:${size}px;font-weight:700;line-height:1.2;color:${textColor}">
            ${emoji}${esc(d.text)}
          </h${lvl}>
        </div>`;
    }

    case "subheading": {
      return `
        <div style="margin:12px 0 6px 0;text-align:${align}">
          <h2 style="margin:0;font-family:${fontFamily};font-size:22px;font-weight:500;line-height:1.3;color:${textColor}">
            ${esc(d.text)}
          </h2>
        </div>`;
    }

    case "paragraph": {
      const fontSize = s.fontSize || 16;
      return `
        <p style="margin:0 0 16px 0;font-family:${fontFamily};font-size:${fontSize}px;line-height:1.65;color:${textColor};text-align:${align}">
          ${esc(d.text || "").replace(/\n/g, "<br />")}
        </p>`;
    }

    case "richtext": {
      return `
        <div style="margin:0 0 16px 0;font-family:${fontFamily};font-size:16px;line-height:1.65;color:${textColor};text-align:${align}">
          ${d.html || ""}
        </div>`;
    }

    case "highlight": {
      return `
        <div style="margin:16px 0;padding:16px 20px;background:#fffdf0;border-left:4px solid #ffd51d;border-radius:6px">
          <p style="margin:0;font-family:${fontFamily};font-size:16px;font-weight:600;line-height:1.5;color:#111827">
            ${esc(d.text)}
          </p>
          ${d.note ? `<p style="margin:6px 0 0 0;font-size:13px;color:#6b7280">${esc(d.note)}</p>` : ""}
        </div>`;
    }

    case "quote": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-left:4px solid ${accent}">
          <tr>
            <td style="padding:4px 0 4px 18px">
              <p style="margin:0 0 8px 0;font-family:Georgia,Cambria,serif;font-size:18px;font-style:italic;line-height:1.55;color:#1f2937">
                “${esc(d.text || "")}”
              </p>
              ${
                d.author
                  ? `<p style="margin:0;font-size:13px;font-weight:600;color:#6b7280">— ${esc(d.author)}${d.role ? `, <span style="font-weight:400">${esc(d.role)}</span>` : ""}</p>`
                  : ""
              }
            </td>
          </tr>
        </table>`;
    }

    case "callout": {
      const tone = d.tone || "tip";
      const bg = tone === "warning" ? "#fef2f2" : tone === "success" ? "#ecfdf5" : tone === "info" ? "#eff6ff" : "#fffbeb";
      const border = tone === "warning" ? "#fecaca" : tone === "success" ? "#a7f3d0" : tone === "info" ? "#bfdbfe" : "#fde68a";
      const accentTone = tone === "warning" ? "#b91c1c" : tone === "success" ? "#047857" : tone === "info" ? "#1d4ed8" : "#b45309";
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${bg};border:1px solid ${border};border-radius:10px">
          <tr>
            <td style="padding:16px 20px">
              ${d.title ? `<p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:${accentTone}">${esc(d.title)}</p>` : ""}
              <p style="margin:0;font-size:14px;line-height:1.55;color:#374151">${esc(d.text || "")}</p>
            </td>
          </tr>
        </table>`;
    }

    case "divider": {
      return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />`;
    }

    case "spacer": {
      const height = d.height || 24;
      return `<div style="height:${height}px;line-height:${height}px;font-size:0">&nbsp;</div>`;
    }

    case "button": {
      const btnAlign = d.align || align || "center";
      const btnBg = s.backgroundColor && s.backgroundColor !== "transparent" ? s.backgroundColor : "#0d21a1";
      const btnColor = s.textColor && s.textColor !== "#111827" ? s.textColor : "#ffffff";
      return `
        <table role="presentation" align="${btnAlign}" cellpadding="0" cellspacing="0" style="margin:22px 0">
          <tr>
            <td align="center" style="background:${btnBg};border-radius:8px">
              <a href="${esc(d.url || "#")}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;color:${btnColor};text-decoration:none;font-size:15px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.2px">
                ${esc(d.text || "Click here")}
              </a>
            </td>
          </tr>
        </table>`;
    }

    case "image": {
      if (!d.src) return "";
      return `
        <div style="margin:20px 0;text-align:${align}">
          ${d.url ? `<a href="${esc(d.url)}" target="_blank" style="text-decoration:none">` : ""}
            <img src="${esc(d.src)}" alt="${esc(d.alt || "")}" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto" />
          ${d.url ? `</a>` : ""}
          ${d.caption ? `<p style="margin:8px 0 0 0;font-size:12px;color:#8b8f98;text-align:center">${esc(d.caption)}</p>` : ""}
        </div>`;
    }

    case "hero": {
      return `
        <div style="margin:0 0 24px 0;padding:24px 20px;border-bottom:2px solid #0d21a1;text-align:${align}">
          ${d.logo ? `<p style="margin:0 0 8px 0;font-size:16px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#0d21a1">${esc(d.logo)}</p>` : ""}
          ${d.eyebrow ? `<p style="margin:0 0 6px 0;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#8b8f98">${esc(d.eyebrow)}</p>` : ""}
          <h1 style="margin:0 0 10px 0;font-family:Georgia,Cambria,serif;font-size:34px;font-weight:700;line-height:1.2;color:#111827">
            ${esc(d.title)}
          </h1>
          ${d.subtitle ? `<p style="margin:0;font-size:16px;line-height:1.55;color:#4b5563">${esc(d.subtitle)}</p>` : ""}
          ${d.image ? `<img src="${esc(d.image)}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin-top:16px;display:block" />` : ""}
        </div>`;
    }

    case "authorCard": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px">
          <tr>
            <td style="padding:18px 20px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${d.avatar ? `<td width="56" valign="top" style="padding-right:16px"><img src="${esc(d.avatar)}" alt="" width="56" height="56" style="border-radius:50%;display:block" /></td>` : ""}
                  <td valign="top">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#111827">${esc(d.name || "Sagar Lad")}</p>
                    ${d.role ? `<p style="margin:2px 0 8px 0;font-size:12.5px;color:#6b7280">${esc(d.role)}</p>` : ""}
                    ${d.bio ? `<p style="margin:0;font-size:13.5px;line-height:1.5;color:#4b5563">${esc(d.bio)}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case "signature": {
      return `
        <div style="margin:24px 0 12px 0">
          <p style="margin:0 0 8px 0;font-size:15px;line-height:1.55;color:#374151">${esc(d.text || "Warm regards,")}</p>
          <p style="margin:0;font-family:Georgia,Cambria,serif;font-size:22px;font-style:italic;color:#111827">${esc(d.name || "Sagar")}</p>
          ${d.role ? `<p style="margin:2px 0 0 0;font-size:12.5px;color:#8b8f98">${esc(d.role)}</p>` : ""}
        </div>`;
    }

    case "footer": {
      return `
        <div style="margin:32px 0 0 0;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#8b8f98;line-height:1.6">
          ${d.note ? `<p style="margin:0 0 4px 0">${esc(d.note)}</p>` : ""}
          ${d.address ? `<p style="margin:0 0 4px 0">${esc(d.address)}</p>` : ""}
          <p style="margin:0 0 12px 0">${esc(d.copyright || "© 2026 Sagar Lad. All rights reserved.")}</p>
          <p style="margin:0">
            <a href="${esc(d.unsubscribeUrl || "#")}" style="color:#6b7280;text-decoration:underline">
              ${esc(d.unsubscribeLabel || "Unsubscribe")}
            </a>
          </p>
        </div>`;
    }

    case "list": {
      const items = (d.items || []) as string[];
      const isOrdered = d.type === "ordered";
      const tag = isOrdered ? "ol" : "ul";
      const lis = items.map((it) => `<li style="margin-bottom:6px">${esc(it)}</li>`).join("");
      return `
        <${tag} style="margin:0 0 16px 0;padding-left:24px;font-size:15px;line-height:1.6;color:${textColor}">
          ${lis}
        </${tag}>`;
    }

    case "columns2": {
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
          <tr>
            <td width="48%" valign="top" style="padding-right:4%">
              <p style="margin:0;font-size:15px;line-height:1.6;color:${textColor}">${esc(d.col1 || "")}</p>
            </td>
            <td width="48%" valign="top">
              <p style="margin:0;font-size:15px;line-height:1.6;color:${textColor}">${esc(d.col2 || "")}</p>
            </td>
          </tr>
        </table>`;
    }

    case "faq": {
      const items = (d.items || []) as { question: string; answer: string }[];
      const faqs = items
        .map(
          (it) => `
        <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #f1efe9">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#111827">${esc(it.question)}</p>
          <p style="margin:0;font-size:14px;line-height:1.55;color:#4b5563">${esc(it.answer)}</p>
        </div>`
        )
        .join("");
      return `
        <div style="margin:18px 0">
          ${d.title ? `<h3 style="margin:0 0 12px 0;font-size:18px;font-weight:700;color:#111827">${esc(d.title)}</h3>` : ""}
          ${faqs}
        </div>`;
    }

    default: {
      if (d.text) {
        return `<p style="margin:0 0 16px 0;font-family:${fontFamily};font-size:15px;line-height:1.6;color:${textColor}">${esc(d.text)}</p>`;
      }
      return "";
    }
  }
}

/**
 * Compiles a NewsletterDoc into full, responsive email HTML ready for Brevo delivery.
 */
export function compileNewsletterToHtml(doc: NewsletterDoc, unsubscribeToken: string = "test"): string {
  const unsubscribeUrl = `${SITE.url}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const blocksHtml = doc.blocks.map(renderBlockHtml).join("\n");

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
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${doc.previewText ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${esc(doc.previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:32px 12px">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="email-container" style="max-width:620px;width:620px;background-color:#ffffff;border-radius:16px;border:1px solid #ece9e2;overflow:hidden">
          <!-- Header Bar -->
          <tr>
            <td style="padding:14px 28px;border-bottom:1px solid #ece9e2;background-color:#fafaf8">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0d21a1">
                    ${esc(doc.title || "The Sagar Lad Letter")}
                  </td>
                  <td align="right" style="font-size:12px;color:#8b8f98">
                    ${esc(doc.issue || "")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td class="email-content" style="padding:32px 28px">
              ${blocksHtml}
            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="padding:20px 28px;background-color:#fafaf8;border-top:1px solid #ece9e2;text-align:center;font-size:12px;color:#8b8f98">
              <p style="margin:0 0 6px 0">You received this email because you subscribed to ${esc(SITE.name)}.</p>
              <a href="${esc(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
