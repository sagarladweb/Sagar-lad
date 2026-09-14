import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";
import {
  SpeakingGalleryData,
  SpeakingGalleryImage,
  DEFAULT_SPEAKING_GALLERY,
} from "./speaking-gallery-types";

export const getSpeakingGallery = cache(async (): Promise<SpeakingGalleryData> => {
  return unstable_cache(
    async (): Promise<SpeakingGalleryData> => {
      const row = await dbSafe(
        () => prisma.speakingGallery.findUnique({ where: { id: "default" } }),
        null
      );
      if (!row) return DEFAULT_SPEAKING_GALLERY;

      const rawImages = row.images as unknown as SpeakingGalleryImage[];
      const images =
        Array.isArray(rawImages) && rawImages.length === 6
          ? rawImages
          : DEFAULT_SPEAKING_GALLERY.images;

      return {
        id: row.id,
        enabled: row.enabled,
        images,
      };
    },
    ["speaking-gallery"],
    { revalidate: 300, tags: ["speaking-gallery", "speaking"] }
  )();
});
