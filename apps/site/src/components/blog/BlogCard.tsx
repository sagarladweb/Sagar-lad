import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDateShort, readingTime, postCover } from "@/lib/site";
import { getEngagement } from "@/lib/engagement";

type Post = {
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

export function BlogCard({
  post,
  showStats = false,
}: {
  post: Post;
  showStats?: boolean;
}) {
  const metrics = { views: getEngagement(post.slug, new Date(post.publishedAt).toISOString()).views, likes: post.likes ?? 0 };

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col h-full min-h-[280px] sm:min-h-[310px] overflow-hidden rounded-2xl border border-border bg-card card-hover transition-all duration-300 hover:border-brand-light/60 hover:text-brand hover:shadow-[0_0_0_1px_var(--brand-light)]"
      suppressHydrationWarning
    >
      {/* Image — compact aspect ratio */}
      <div className="relative aspect-[16/7] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage || postCover(post.slug)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Views badge — top right */}
        {showStats && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/80">
            <Eye className="w-2.5 h-2.5" />
            {metrics.views.toLocaleString()}
          </div>
        )}

        {/* Category pill — top left */}
        {post.category && (
          <div className="absolute top-2.5 left-2.5 rounded-full bg-white/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/80">
            {post.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-display text-[15px] sm:text-base font-bold text-foreground leading-snug line-clamp-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta row — date, reading time, views */}
        <div className="mt-auto pt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <time dateTime={new Date(post.publishedAt).toISOString()}>
            {formatDateShort(post.publishedAt)}
          </time>
          <span aria-hidden="true" className="text-border">·</span>
          <span>{readingTime(post.content || post.excerpt || post.title)}m</span>
          {showStats && (
            <>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="inline-flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                {metrics.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
