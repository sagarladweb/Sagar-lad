import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Video } from "lucide-react";
import { prisma } from "@/lib/db";
import { TopicPostCard } from "@/components/admin/TopicPostCard";
import { TopicVideoCard } from "@/components/admin/TopicVideoCard";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let category: Awaited<ReturnType<typeof getCategory>> = null;
  try {
    category = await getCategory(slug);
  } catch (err) {
    console.warn("[admin topic] DB query failed:", (err as Error).message);
  }

  if (!category) notFound();

  const empty = category.posts.length === 0 && category.videos.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/content?tab=topics"
          className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
          aria-label="Back to topics"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.posts.length} post{category.posts.length === 1 ? "" : "s"} ·{" "}
            {category.videos.length} video{category.videos.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {empty ? (
        <p className="rounded-2xl border border-border bg-card card-grad p-6 text-sm text-muted-foreground">
          Nothing is assigned to this topic yet. Assign posts or videos from the{" "}
          <Link href="/admin/posts" className="font-semibold text-accent hover:underline">
            Posts
          </Link>{" "}
          or{" "}
          <Link href="/admin/content?tab=videos" className="font-semibold text-accent hover:underline">
            Videos
          </Link>{" "}
          pages.
        </p>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-accent" />
              Posts · {category.posts.length}
            </h2>
            {category.posts.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card card-grad p-5 text-sm text-muted-foreground">
                No posts in this topic yet.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.posts.map((p) => (
                  <TopicPostCard
                    key={p.id}
                    post={{ ...p, categoryName: category.name }}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Video className="h-4 w-4 text-accent" />
              Videos · {category.videos.length}
            </h2>
            {category.videos.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card card-grad p-5 text-sm text-muted-foreground">
                No videos in this topic yet.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.videos.map((v) => (
                  <TopicVideoCard
                    key={v.id}
                    post={{ ...v, categoryName: category.name }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          published: true,
          publishedAt: true,
          views: true,
        },
        orderBy: { createdAt: "desc" },
      },
      videos: {
        select: { id: true, title: true, slug: true, thumbnail: true, published: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
