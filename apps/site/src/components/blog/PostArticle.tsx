import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Eye,
  Link2,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { SITE, formatDateShort, readingTime } from "@/lib/site";
import { getEngagement } from "@/lib/engagement";
import { SanitizedContent } from "@/components/SanitizedContent";
import { LikeButton } from "@/components/blog/LikeButton";
import { TimelineIndex } from "@/components/blog/TimelineIndex";

const ShareButtons = dynamic(() =>
  import("@/components/blog/ShareButtons").then((m) => m.ShareButtons)
);

const CommentsSection = dynamic(() =>
  import("@/components/blog/CommentsSection").then((m) => m.CommentsSection)
);

type PostWithRelations = {
  id: string;
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
  publishedAt: Date | string;
  updatedAt?: Date | string;
  views?: number;
  likes?: number;
  sources?: { type: string; url: string; title: string }[] | null;
  category?: { name: string; slug?: string } | null;
  author?: { name: string | null } | null;
};

export type RelatedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | string;
};

export function PostArticle({
  post,
  related = [],
  showShare = true,
  authorImage,
}: {
  post: PostWithRelations;
  related?: RelatedPost[];
  showShare?: boolean;
  authorImage?: string | null;
}) {
  const authorName = post.author?.name ?? SITE.name;
  const algorithmViews = getEngagement(post.slug, new Date(post.publishedAt).toISOString()).views;
  const realViews = post.views ?? 0;
  const metrics = { views: algorithmViews + realViews, likes: post.likes ?? 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12 lg:pb-16">
      {/* ── Back Navigation — icon only ── */}
      <nav className="mb-4 sm:mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to articles"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </nav>

      {post.showTimeline ? (
        /* ── Two-Column: Content + Sticky Sidebar TOC ── */
        <div className="flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-12 xl:gap-16">
          <article className="w-full max-w-2xl lg:max-w-[720px] min-w-0">
            <PostHeader
              post={post}
              authorName={authorName}
              authorImage={authorImage}
              metrics={metrics}
            />

            {post.coverImage && post.showCover && (
              <CoverImage src={post.coverImage} alt={post.title} />
            )}

            <div id="post-content" className="mt-6 sm:mt-8">
              <SanitizedContent html={post.content} />
            </div>

            <PostFooter
              post={post}
              authorName={authorName}
              authorImage={authorImage}
              metrics={metrics}
              related={related}
              showShare={showShare}
            />
          </article>

          <TimelineIndex contentSelector="#post-content" />
        </div>
      ) : (
        /* ── Single-Column Centered Layout ── */
        <article className="mx-auto w-full max-w-2xl lg:max-w-[720px] min-w-0">
          <PostHeader
            post={post}
            authorName={authorName}
            authorImage={authorImage}
            metrics={metrics}
          />

          {post.coverImage && post.showCover && (
            <CoverImage src={post.coverImage} alt={post.title} />
          )}

          <div id="post-content" className="mt-6 sm:mt-8">
            <SanitizedContent html={post.content} />
          </div>

          <PostFooter
            post={post}
            authorName={authorName}
            authorImage={authorImage}
            metrics={metrics}
            related={related}
            showShare={showShare}
          />
        </article>
      )}
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function PostHeader({
  post,
  authorName,
  authorImage,
  metrics,
}: {
  post: PostWithRelations;
  authorName: string;
  authorImage?: string | null;
  metrics: { views: number; likes: number };
}) {
  return (
    <header className="mb-6 sm:mb-8">
      {/* Category + kicker — centered on all viewports */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug ?? ""}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/15 transition-colors"
          >
            {post.category.name}
          </Link>
        )}
        {post.kicker && (
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {post.kicker}
          </span>
        )}
      </div>

      {/* Title — sans-serif, centered on all viewports */}
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-[1.18] tracking-tight text-foreground text-center">
        {post.title}
      </h1>

      {/* Excerpt — serif, centered on all viewports */}
      {post.excerpt && (
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground font-normal text-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {post.excerpt}
        </p>
      )}

      {/* Author & Meta — centered on all viewports */}
      <div className="mt-5 flex flex-col items-center gap-4">
        {/* Author row: profile pic + name + date */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted ring-1 ring-border">
            <Image
              src={authorImage ?? "/images/profile/about.webp"}
              alt={authorName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="text-sm leading-tight text-left">
            <p className="font-semibold text-foreground">{authorName}</p>
            <p className="text-[11px] text-muted-foreground">Author</p>
          </div>
          <span className="text-border select-none mx-1" aria-hidden="true">·</span>
          <time
            dateTime={new Date(post.publishedAt).toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatDateShort(post.publishedAt)}
          </time>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime(post.content)} min read
          </span>
          <span className="text-border select-none" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {metrics.views.toLocaleString()} views
          </span>
          <div className="pl-1">
            <LikeButton slug={post.slug} initialLikes={metrics.likes} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}

function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mb-6 sm:mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 800px"
        className="object-cover transition-transform duration-500 hover:scale-[1.01]"
      />
    </div>
  );
}

function PostFooter({
  post,
  authorName,
  authorImage,
  metrics,
  related,
  showShare,
}: {
  post: PostWithRelations;
  authorName: string;
  authorImage?: string | null;
  metrics: { views: number; likes: number };
  related: RelatedPost[];
  showShare: boolean;
}) {
  return (
    <footer className="mt-10 sm:mt-12 pt-8 border-t border-border">
      {/* ── Engagement & Reaction ── */}
      {showShare && (
        <section
          aria-label="Article reactions and sharing"
          className="rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/50 p-4 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-4">
              <LikeButton
                slug={post.slug}
                initialLikes={metrics.likes}
                size="lg"
              />
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">
                  Enjoyed this article?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Give it a like to let Sagar know it resonated with you
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-border/70 shrink-0" aria-hidden="true" />
            <div className="block sm:hidden h-px w-full bg-border/60" aria-hidden="true" />

            <div className="flex flex-col sm:items-end gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Share this piece
              </span>
              <ShareButtons
                title={post.title}
                slug={post.slug}
                url={`${SITE.url}/blog/${post.slug}`}
                variant="clean"
                showLabel={false}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Footer note ── */}
      {post.footerNote && (
        <div className="mt-8 rounded-2xl border border-border/80 bg-muted/40 p-4 sm:p-5 text-sm leading-relaxed text-muted-foreground">
          {post.footerNote}
        </div>
      )}

      {/* ── Sources & References ── */}
      {post.sources && post.sources.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-5">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Sources & References
          </h3>
          <ul className="space-y-2">
            {post.sources.map((src, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 shrink-0 text-muted-foreground">
                  {src.type === "link" && <Link2 className="w-4 h-4" />}
                  {src.type === "video" && <Video className="w-4 h-4" />}
                  {src.type === "image" && <ImageIcon className="w-4 h-4" />}
                </span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-brand hover:underline underline-offset-2 transition-colors font-medium break-all sm:break-normal"
                  >
                    {src.title || src.url}
                  </a>
                ) : (
                  <span className="text-foreground">{src.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Related Posts — Carousel on mobile/tablet, grid on desktop ── */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-14" aria-label="Related articles">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Keep reading
            </h2>
            <Link
              href="/blog"
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all articles →
            </Link>
          </div>

          {/* Mobile/tablet: horizontal scroll carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:hidden">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 transition-all duration-300 hover:border-brand/30 hover:shadow-md snap-start shrink-0 w-[260px] sm:w-[300px]"
              >
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="300px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-brand/5 font-display text-2xl font-bold text-brand/40">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-3.5">
                  <time
                    dateTime={new Date(p.publishedAt).toISOString()}
                    className="text-[11px] text-muted-foreground mb-1"
                  >
                    {formatDateShort(p.publishedAt)}
                  </time>
                  <h3 className="font-display text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 transition-all duration-300 hover:border-brand/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-brand/5 font-display text-2xl font-bold text-brand/40">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <time
                    dateTime={new Date(p.publishedAt).toISOString()}
                    className="text-[11px] text-muted-foreground mb-1.5"
                  >
                    {formatDateShort(p.publishedAt)}
                  </time>
                  <h3 className="font-display text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Comments Section ── */}
      <CommentsSection postSlug={post.slug} />
    </footer>
  );
}
