import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/revalidate";

const DEFAULT_GALLERY = {
  id: "default",
  enabled: true,
  images: [
    { src: "/images/speaking/main-full-width.webp", alt: "Sagar Lad delivering a keynote" },
    { src: "/images/speaking/candid.webp", alt: "Sagar Lad candid" },
    { src: "/images/speaking/candid-speaking.webp", alt: "Sagar Lad speaking" },
    { src: "/images/speaking/candid-presentation.webp", alt: "Sagar Lad presenting" },
    { src: "/images/speaking/too-close.webp", alt: "Sagar Lad portrait" },
    { src: "/images/heroes/tedx.webp", alt: "Sagar Lad at TEDx" },
  ],
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const gallery = await prisma.speakingGallery.findUnique({
      where: { id: "default" },
    });

    if (!gallery) {
      return NextResponse.json({ gallery: DEFAULT_GALLERY });
    }

    const rawImages = gallery.images as unknown as { src: string; alt: string }[];
    const images = Array.isArray(rawImages) && rawImages.length === 6 ? rawImages : DEFAULT_GALLERY.images;

    return NextResponse.json({
      gallery: {
        id: gallery.id,
        enabled: gallery.enabled,
        images,
      },
    });
  } catch {
    return NextResponse.json({ gallery: DEFAULT_GALLERY });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const enabled = typeof body.enabled === "boolean" ? body.enabled : true;
    const rawImages = Array.isArray(body.images) ? body.images : DEFAULT_GALLERY.images;

    // Ensure exactly 6 images
    const images = Array.from({ length: 6 }).map((_, i) => {
      const item = rawImages[i];
      return {
        src: typeof item?.src === "string" && item.src.trim() ? item.src.trim() : DEFAULT_GALLERY.images[i].src,
        alt: typeof item?.alt === "string" ? item.alt.trim() : DEFAULT_GALLERY.images[i].alt,
      };
    });

    const updated = await prisma.speakingGallery.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        enabled,
        images,
      },
      update: {
        enabled,
        images,
      },
    });

    await revalidatePublic();

    return NextResponse.json({
      gallery: {
        id: updated.id,
        enabled: updated.enabled,
        images: updated.images,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to save speaking gallery" },
      { status: 500 }
    );
  }
}
