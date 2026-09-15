import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/revalidate";

const HERO_PRESETS = {
  hero_sagar_lad: {
    key: "hero_sagar_lad",
    label: "Executive Modern Suite",
    imageUrl: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobilePosition: "object-[76%_56%]",
    tabletPosition: "sm:object-[71%_53%]",
    desktopPosition: "lg:object-[66%_48%]",
  },
  hero_home: {
    key: "hero_home",
    label: "Executive Modern Suite",
    imageUrl: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobilePosition: "object-[76%_56%]",
    tabletPosition: "sm:object-[71%_53%]",
    desktopPosition: "lg:object-[66%_48%]",
  },
};

const DEFAULT_HERO = {
  id: "default",
  activeImage: "hero_sagar_lad",
  imageUrl: HERO_PRESETS.hero_sagar_lad.imageUrl,
  mobilePosition: HERO_PRESETS.hero_sagar_lad.mobilePosition,
  tabletPosition: HERO_PRESETS.hero_sagar_lad.tabletPosition,
  desktopPosition: HERO_PRESETS.hero_sagar_lad.desktopPosition,
  designation: "Author · Public Speaker",
  title: "Sagar Lad",
  subtitle: "Your friend, mentor and Guide",
  tagline1: "MIND UP",
  tagline2: "Change your MIND",
  tagline3: "Change your life",
};

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hero = await prisma.homeHero.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      hero: hero ?? DEFAULT_HERO,
      presets: HERO_PRESETS,
    });
  } catch {
    return NextResponse.json({
      hero: DEFAULT_HERO,
      presets: HERO_PRESETS,
    });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const activeKey = body.activeImage in HERO_PRESETS ? body.activeImage : "hero_sagar_lad";
    const preset = HERO_PRESETS[activeKey as keyof typeof HERO_PRESETS] ?? HERO_PRESETS.hero_sagar_lad;

    const updated = await prisma.homeHero.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        activeImage: activeKey,
        imageUrl: body.imageUrl || preset.imageUrl,
        mobilePosition: body.mobilePosition || preset.mobilePosition,
        tabletPosition: body.tabletPosition || preset.tabletPosition,
        desktopPosition: body.desktopPosition || preset.desktopPosition,
        designation: body.designation?.trim() || "Author · Public Speaker",
        title: body.title?.trim() || "Sagar Lad",
        subtitle: body.subtitle?.trim() || "Your friend, mentor and Guide",
        tagline1: body.tagline1?.trim() || "MIND UP.",
        tagline2: body.tagline2?.trim() || "Change your MIND.",
        tagline3: body.tagline3?.trim() || "Change your life.",
      },
      update: {
        activeImage: activeKey,
        imageUrl: body.imageUrl || preset.imageUrl,
        mobilePosition: body.mobilePosition || preset.mobilePosition,
        tabletPosition: body.tabletPosition || preset.tabletPosition,
        desktopPosition: body.desktopPosition || preset.desktopPosition,
        designation: body.designation?.trim() || "Author · Public Speaker",
        title: body.title?.trim() || "Sagar Lad",
        subtitle: body.subtitle?.trim() || "Your friend, mentor and Guide",
        tagline1: body.tagline1?.trim() || "MIND UP.",
        tagline2: body.tagline2?.trim() || "Change your MIND.",
        tagline3: body.tagline3?.trim() || "Change your life.",
      },
    });

    await revalidatePublic();

    return NextResponse.json({ hero: updated, presets: HERO_PRESETS });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update hero settings" },
      { status: 500 }
    );
  }
}
