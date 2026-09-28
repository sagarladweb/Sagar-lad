import Link from "next/link";
import { CalendarDays, Clock, Eye } from "lucide-react";
import { formatDateShort, readingTime, postCover } from "@/lib/site";
import { getEngagement } from "@/lib/engagement";

export type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  coverImage: string | null;
  publishedAt: Date | string;
  views?: number;
  likes?: number;
  category: { name: string; slug: string } | null;
};

export function BlogCard({ post }: { post: BlogCardPost; showStats?: boolean }) {
  const algorithmViews = getEngagement(post.slug, new Date(post.publishedAt).toISOString()).views;
  const realViews = post.views ?? 0;
  const views = algorithmViews + realViews;

  return (
    <Link
      href={`/blog/${post.slug}`}
      aria-label={`Read article: ${post.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-150 hover:border-brand-light/60 hover:shadow-[0_0_0_1px_var(--brand-light)]"
      suppressHydrationWarning
    >
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage || postCover(post.slug)}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {/* Category pill — top left */}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 backdrop-blur-sm">
            {post.category.name}
          </span>
        )}
        {/* Views pill — top right */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
          <Eye className="h-3 w-3" aria-hidden="true" />
          {views.toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-lg font-bold leading-snug text-foreground line-clamp-3">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Bottom metadata */}
        <div className="mt-auto pt-4">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {formatDateShort(post.publishedAt)}
              </time>
            </span>
            <span aria-hidden="true" className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readingTime(post.content || post.excerpt || post.title)} min read
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
