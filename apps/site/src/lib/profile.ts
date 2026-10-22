import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

const DEFAULT_AVATAR = "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp";

export const getProfileAvatar = unstable_cache(
  async () => {
    try {
      const user = await dbSafe(
        () =>
          prisma.user.findFirst({
            select: { image: true, name: true },
            where: { role: "ADMIN" },
          }),
        null
      );

      return {
        image: user?.image || DEFAULT_AVATAR,
        name: user?.name ?? "Sagar Lad",
      };
    } catch {
      return {
        image: DEFAULT_AVATAR,
        name: "Sagar Lad",
      };
    }
  },
  ["profile-avatar-v2"],
  { revalidate: 604800, tags: ["profile"] }
);

