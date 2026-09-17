import { sanitizeHtml } from "@/lib/sanitize";

export function SanitizedContent({ html }: { html: string }) {
  return (
    <div className="tip-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
  );
}