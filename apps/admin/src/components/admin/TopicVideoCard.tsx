import Link from "next/link";
import { CalendarDays, ExternalLink, Play } from "lucide-react";
import { SITE } from "@/lib/site";

export type TopicVideo = {
  id: string;
  title: string;
  slug: string | null;
  thumbnail: string | null;
  published: boolean;
  createdAt: Date | string;
  categoryName: string;
};

// Same card language as TopicPostCard: hero thumb, category pill, bold
// title, date row. Links to the video editor; the globe previews it live.
export function TopicVideoCard({ post }: { post: TopicVideo }) {
  const previewUrl = post.slug ? `${SITE.url}/videos/${post.slug}` : SITE.url;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-150 hover:border-brand-light/60 hover:shadow-[0_0_0_1px_var(--brand-light)]">
      <Link
        href={`/admin/content?tab=videos&edit=${post.id}`}
        aria-label={`Edit video: ${post.title}`}
        className="flex h-full flex-col"
      >
        <span className="relative block aspect-[16/9] overflow-hidden bg-muted">
          {post.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.thumbnail}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid h-full w-full place-items-center bg-brand/5 text-brand/50">
              <Play className="h-8 w-8" aria-hidden="true" />
            </span>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 backdrop-blur-sm">
            {post.categoryName}
          </span>
          {!post.published && (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Draft
            </span>
          )}
          <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>

        <span className="flex flex-1 flex-col p-5">
          {/* Fixed slots keep every card pixel-identical regardless of text length */}
          <span className="font-display text-lg font-bold leading-snug text-foreground line-clamp-3 min-h-[4.65rem]">
            {post.title}
          </span>
          <span className="mt-auto block pt-4">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className={post.published ? "text-emerald-600" : ""}>
                {post.published ? "Published" : "Hidden"}
              </span>
            </span>
          </span>
        </span>
      </Link>
      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Preview live video: ${post.title}`}
        title="Preview live video"
        className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
