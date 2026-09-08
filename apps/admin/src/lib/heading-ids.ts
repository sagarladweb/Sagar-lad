/**
 * Inject slugified `id` attributes into h2/h3 tags that lack them.
 * Used before saving blog content so the frontend TOC can link to headings.
 */
export function injectHeadingIds(html: string): string {
  if (!html) return html;

  const seen = new Map<string, number>();

  return html.replace(
    /<(h[23])(\s[^>]*)?>((?:[^<]|<\/\1>)*)<\/\1>/gi,
    (match, tag, attrs = "", text) => {
      // Already has an id — skip
      if (/\bid=["'][^"']+["']/.test(attrs)) return match;

      const slug = slugify(text);
      const base = slug || `heading-${seen.size}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count > 0 ? `${base}-${count}` : base;

      return `<${tag} id="${id}"${attrs}>${text}</${tag}>`;
    }
  );
}

function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, "") // strip inner HTML tags
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
