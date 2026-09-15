import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

const isDev = process.env.NODE_ENV !== "production";
const DEFAULT_AVATAR = "/images/profile/about.webp";

export const getProfileAvatar = unstable_cache(
  async () => {
    const user = await prisma.user.findFirst({
      select: { image: true, name: true },
      where: { role: "ADMIN" },
    });
    return {
      image: user?.image ?? DEFAULT_AVATAR,
      name: user?.name ?? "Sagar Lad",
    };
  },
  ["profile-avatar-v1"],
  { revalidate: isDev ? 0 : 604800, tags: ["profile"] }
);
