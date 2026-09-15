import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
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
    console.error("Failed to save image config:", err);
    return NextResponse.json(
      { error: "Failed to write configuration file to disk." },
      { status: 500 }
    );
  }
}
