import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Eye } from "lucide-react";
import { SITE, formatDate, readingTime } from "@/lib/site";
import { SanitizedContent } from "@/components/SanitizedContent";
import { CommentsSection } from "@/components/blog/CommentsSection";
import { TimelineIndex } from "@/components/blog/TimelineIndex";

type PostWithRelations = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  kicker: string | null;
  showCover: boolean;
  footerNote: string | null;
  showAuthorBox: boolean;
  showTimeline: boolean;
  publishedAt: Date;
  views?: number;
  category?: { name: string; slug?: string } | null;
  author?: { name: string | null } | null;
};

function initials(name?: string | null): string {
  if (!name) return "S";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function PostArticle({
  post,
  showComments = true,
}: {
  post: PostWithRelations;
  showComments?: boolean;
}) {
  const authorName = post.author?.name ?? SITE.name;

  const header = (
    <header>
      <div className="flex flex-wrap items-center gap-3">
        {post.category && (
          <span className="inline-flex items-center rounded-full border border-brand-light/30 bg-brand-light/10 px-3 py-1 text-xs font-semibold text-brand">
            {post.category.name}
          </span>
        )}
        {post.kicker && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {post.kicker}
          </p>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight lg:text-[2.75rem]">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">
            {initials(authorName)}
          </span>
          <div className="text-sm leading-tight">
            <p className="font-semibold">{authorName}</p>
            <p className="text-[11px] text-muted-foreground">Author</p>
          </div>
        </div>
        <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <time
            dateTime={post.publishedAt.toISOString()}
            className="inline-flex items-center gap-1"
          >
            <CalendarDays className="w-3.5 h-3.5" /> {formatDate(post.publishedAt)}
          </time>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {readingTime(post.content)} min
          </span>
          {typeof post.views === "number" && post.views > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()} views
            </span>
          )}
        </div>
      </div>

      <div className="my-8 h-px bg-border" />
    </header>
  );

  const content = (
    <>
      {post.coverImage && post.showCover && (
        <div className="mb-8 overflow-hidden rounded-xl border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt="" className="w-full aspect-video object-cover" />
        </div>
      )}

      <div id="post-content">
        <SanitizedContent html={post.content} />
      </div>

      {post.footerNote && (
        <div className="mt-8 rounded-xl border border-border bg-muted/30 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          {post.footerNote}
        </div>
      )}

      {post.showAuthorBox && (
        <div className="mt-10 flex items-center gap-5 rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">
            {initials(authorName)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold">{authorName}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
          </div>
        </div>
      )}

      {showComments && (
        <div className="mt-14">
          <CommentsSection postSlug={post.slug} />
        </div>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> All articles
      </Link>

      {post.showTimeline ? (
        <div className="flex gap-10 lg:gap-14">
          <article className="flex-1 min-w-0 max-w-3xl">
            {header}
            {content}
          </article>
          <TimelineIndex contentSelector="#post-content" />
        </div>
      ) : (
        <article className="mx-auto max-w-3xl">
          {header}
          {content}
        </article>
      )}
    </div>
  );
}
