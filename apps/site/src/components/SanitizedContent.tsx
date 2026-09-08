import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Renders HTML content with defense-in-depth sanitization via DOMPurify.
 * Content is sanitized at write time in the admin panel AND re-sanitized here
 * on render. If the admin session is ever compromised, XSS is still blocked.
 */
function enhanceTables(html: string): string {
  if (!html.includes("<table")) return html;

  return html.replace(/<table(\s*[^>]*)>([\s\S]*?)<\/table>/gi, (_match, attrs, inner) => {
    const firstRowMatch = inner.match(/<tr(\s*[^>]*)>([\s\S]*?)<\/tr>/i);
    let colCount = 0;
    if (firstRowMatch) {
      const cells = firstRowMatch[2].match(/<(th|td)(\s*[^>]*)>/gi);
      colCount = cells ? cells.length : 0;
    }

    const colClass = colCount === 3 ? " table-cols-3" : colCount > 3 ? " table-wide" : "";
    let updatedAttrs = attrs;
    if (/class=["']/i.test(updatedAttrs)) {
      updatedAttrs = updatedAttrs.replace(/class=["']([^"']*)["']/i, `class="$1${colClass}"`);
    } else {
      updatedAttrs = `${updatedAttrs} class="${colClass.trim()}"`;
    }

    return `<div class="table-responsive-wrapper"><table${updatedAttrs}>${inner}</table></div>`;
  });
}

export function SanitizedContent({ html }: { html: string }) {
  const sanitized = sanitizeHtml(html);
  const enhanced = enhanceTables(sanitized);

  return (
    <div
      className="tip-content"
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}
