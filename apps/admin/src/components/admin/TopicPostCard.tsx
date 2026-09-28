import Link from "next/link";
import { CalendarDays, Clock, Eye, ExternalLink } from "lucide-react";
import { readingTime, postCover, SITE } from "@/lib/site";

export type TopicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | string;
  views: number;
  categoryName: string;
};

// Same look as the website blog card: hero image, category + views pills,
 // bold title, excerpt, date • read time. Links to the editor; the globe
// icon previews the live post.
export function TopicPostCard({ post }: { post: TopicPost }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-150 hover:border-brand-light/60 hover:shadow-[0_0_0_1px_var(--brand-light)]">
      <Link
        href={`/admin/posts/${post.slug}/edit`}
        aria-label={`Edit post: ${post.title}`}
        className="flex h-full flex-col"
      >
        <span className="relative block aspect-[16/9] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage || postCover(post.slug)}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 backdrop-blur-sm">
            {post.categoryName}
          </span>
          {!post.published && (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Draft
            </span>
          )}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {post.views.toLocaleString()}
          </span>
        </span>

        <span className="flex flex-1 flex-col p-5">
          {/* Fixed slots keep every card pixel-identical regardless of text length */}
          <span className="font-display text-lg font-bold leading-snug text-foreground line-clamp-3 min-h-[4.65rem]">
            {post.title}
          </span>
          <span className="mt-2 block min-h-[2.85rem] text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {post.excerpt ?? ""}
          </span>
          <span className="mt-auto block pt-4">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {readingTime(post.content || post.excerpt || post.title)} min read
              </span>
            </span>
          </span>
        </span>
      </Link>
      <a
        href={`${SITE.url}/blog/${post.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Preview live post: ${post.title}`}
        title="Preview live post"
        className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
