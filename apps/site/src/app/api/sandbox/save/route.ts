import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const { ok } = await rateLimitByIp(ip, 5, 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "src/lib/image-responsive-config.ts");

    const fileContent = `// Centralized Responsive Image Configuration for Sagar Lad Website
// Automatically updated via /sandbox or calibrated per breakpoint

export type ImageAlignmentSetting = {
  x: number;
  y: number;
  scale: number;
};

export type ImageBreakpointConfig = {
  id: string;
  name: string;
  section: string;
  src: string;
  mobile: ImageAlignmentSetting;
  tablet: ImageAlignmentSetting;
  desktop: ImageAlignmentSetting;
  tailwind: string;
};

export const DEFAULT_IMAGE_CONFIGS: Record<string, ImageBreakpointConfig> = ${JSON.stringify(
      body,
      null,
      2
    )};
`;

    await fs.writeFile(filePath, fileContent, "utf-8");

    return NextResponse.json({ success: true, message: "Configurations saved successfully!" });
  } catch (err) {
    console.error("Failed to save image config");
    return NextResponse.json(
      { error: "Failed to write configuration file to disk." },
      { status: 500 }
    );
  }
}
