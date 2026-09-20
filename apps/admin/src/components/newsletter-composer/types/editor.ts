import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ *
 *  Device + panels
 * ------------------------------------------------------------------ */
export type DeviceMode = "desktop" | "tablet" | "mobile";
export type LeftTab = "blocks" | "templates";
export type InspectorTab = "content" | "style" | "settings";
export type SaveStatus = "idle" | "saving" | "saved";

export const DEVICE_WIDTH: Record<DeviceMode, number | null> = {
  desktop: 720,
  tablet: 600,
  mobile: 400,
};

/* ------------------------------------------------------------------ *
 *  Block catalogue
 * ------------------------------------------------------------------ */
export type BlockCategory = "Writing" | "Layout" | "Media" | "Newsletter";
export type BlockType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "richtext"
  | "highlight"
  | "quote"
  | "divider"
  | "spacer"
  | "list"
  | "checklist"
  | "code"
  | "columns2"
  | "callout"
  | "card"
  | "featureGrid"
  | "table"
  | "stats"
  | "timeline"
  | "image"
  | "banner"
  | "gallery"
  | "gif"
  | "video"
  | "tweet"
  | "hero"
  | "authorCard"
  | "subscribe"
  | "socialShare"
  | "signature"
  | "readingList"
  | "resources"
  | "button"
  | "footer"
  | "booksRead"
  | "booksPublished"
  | "ebooks"
  | "quotes"
  | "videoFeed"
  | "blogPosts";

/* ------------------------------------------------------------------ *
 *  Style model — universal, reused by every block
 * ------------------------------------------------------------------ */
export type ShadowPreset = "none" | "soft" | "medium" | "large";
export type BgType = "solid" | "gradient" | "image" | "glass";
export type AnimationPreset = "none" | "fadeIn" | "slideUp" | "scale";
export type VAlign = "flex-start" | "center" | "flex-end";
export type HAlign = "flex-start" | "center" | "flex-end";

export interface BlockStyle {
  fontFamily: "sans" | "serif";
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  align: "left" | "center" | "right";
  readingWidth: number;
  dropCap: boolean;

  textColor: string;
  accentColor: string;
  backgroundColor: string;
  highlightColor: string;
  linkColor: string;
  opacity: number;
  gradientText: boolean;

  paddingTop: number;
  paddingBottom: number;
  paddingX: number;
  marginTop: number;
  marginBottom: number;
  gap: number;

  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  radius: number;
  shadow: ShadowPreset;
  outline: boolean;

  bgType: BgType;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  bgImage: string;
  blur: number;
  tint: number;

  width: "center" | "full";
  vAlign: VAlign;
  hAlign: HAlign;
  stackOnMobile: boolean;

  animation: AnimationPreset;
  hoverLift: boolean;
  glow: boolean;
}

export const DEFAULT_STYLE: BlockStyle = {
  fontFamily: "sans",
  fontSize: 17,
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 1.7,
  textTransform: "none",
  align: "left",
  readingWidth: 0,
  dropCap: false,

  textColor: "#111827",
  accentColor: "#1D4ED8",
  backgroundColor: "transparent",
  highlightColor: "#FDF0B5",
  linkColor: "#1D4ED8",
  opacity: 1,
  gradientText: false,

  paddingTop: 8,
  paddingBottom: 8,
  paddingX: 0,
  marginTop: 0,
  marginBottom: 0,
  gap: 12,

  borderEnabled: false,
  borderColor: "#ECE9E2",
  borderWidth: 1,
  radius: 16,
  shadow: "none",
  outline: false,

  bgType: "solid",
  gradientFrom: "#EEF2FF",
  gradientTo: "#FFFFFF",
  gradientAngle: 135,
  bgImage: "",
  blur: 12,
  tint: 0.2,

  width: "center",
  vAlign: "flex-start",
  hAlign: "flex-start",
  stackOnMobile: true,

  animation: "fadeIn",
  hoverLift: false,
  glow: false,
};

/* ------------------------------------------------------------------ *
 *  Settings model
 * ------------------------------------------------------------------ */
export interface BlockSettings {
  showDesktop: boolean;
  showTablet: boolean;
  showMobile: boolean;
  hidden: boolean;
  collapsed: boolean;
  locked: boolean;
  sectionName: string;
  sectionDivider: boolean;
  fullBleed: boolean;
  openInNewTab: boolean;
  nofollow: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  analyticsLabel: string;
}

export const DEFAULT_SETTINGS: BlockSettings = {
  showDesktop: true,
  showTablet: true,
  showMobile: true,
  hidden: false,
  collapsed: false,
  locked: false,
  sectionName: "",
  sectionDivider: false,
  fullBleed: false,
  openInNewTab: true,
  nofollow: false,
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  analyticsLabel: "",
};

/* ------------------------------------------------------------------ *
 *  Blocks + document
 * ------------------------------------------------------------------ */
export type BlockData = Record<string, unknown>;

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
  style: BlockStyle;
  settings: BlockSettings;
}

export interface CommentThread {
  id: string;
  author: string;
  body: string;
  createdAt: number;
  resolved?: boolean;
}

export interface NewsletterDoc {
  title: string;
  issue: string;
  author: string;
  subject?: string;
  previewText?: string;
  blocks: Block[];
  updatedAt: number;
}

/* ------------------------------------------------------------------ *
 *  Inspector field schema (declarative, drives the Content tab)
 * ------------------------------------------------------------------ */
export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "select"
  | "toggle"
  | "color"
  | "image"
  | "range"
  | "repeat"
  | "colorDot";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  section?: string;
  placeholder?: string;
  hint?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  fields?: FieldDef[];
  itemLabel?: string;
  addLabel?: string;
}

/* ------------------------------------------------------------------ *
 *  Block definition
 * ------------------------------------------------------------------ */
export interface BlockDef {
  type: BlockType;
  label: string;
  description: string;
  category: BlockCategory;
  icon: LucideIcon;
  keywords: string[];
  defaultData: BlockData;
  fields: FieldDef[];
  styleOverride?: Partial<BlockStyle>;
  settingsOverride?: Partial<BlockSettings>;
  swatch: string;
}

/* ------------------------------------------------------------------ *
 *  Templates
 * ------------------------------------------------------------------ */
export type TemplateCategory =
  | "Featured"
  | "Sagar Lad Originals"
  | "Minimal"
  | "Personal"
  | "Business"
  | "Creator"
  | "Startup"
  | "Education"
  | "Marketing"
  | "Case Study"
  | "Book Notes"
  | "Travel";

export type TemplateKind = "curated" | "original" | "saved";

export interface TemplateTheme {
  cover: { from: string; to: string; accent: string };
  spacing: {
    blockGap: number;
    sectionGap: number;
    containerPaddingX: number;
  };
  typography: {
    fontFamily: "sans" | "serif";
    headingFontFamily: "sans" | "serif";
    bodySize: number;
    headingSize: number;
    lineHeight: number;
  };
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  readingTime: number;
  kind?: TemplateKind;
  theme: TemplateTheme;
  blocks: () => Block[];
  featured?: boolean;
  cover?: { from: string; to: string; accent: string };
}

export interface SavedTemplate {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  kind: "saved";
  theme: TemplateTheme;
  blocks: Block[];
  thumbnail?: string;
}
