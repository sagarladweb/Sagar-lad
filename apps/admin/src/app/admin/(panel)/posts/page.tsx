import { prisma } from "@/lib/db";
import { PostsClientTable } from "@/components/admin/PostsClientTable";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let categories: string[] = [];

  try {
    [posts, categories] = await Promise.all([
      getPosts(),
      prisma.category
        .findMany({ orderBy: { name: "asc" }, select: { name: true } })
        .then((rows) => rows.map((r) => r.name))
        .catch(() => [] as string[]),
    ]);
  } catch (err) {
    console.warn("[admin posts] DB query failed:", (err as Error).message);
  }

  return <PostsClientTable initialPosts={posts} categories={categories} />;
}

async function getPosts() {
  return prisma.post.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      scheduledAt: true,
      views: true,
      likes: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}