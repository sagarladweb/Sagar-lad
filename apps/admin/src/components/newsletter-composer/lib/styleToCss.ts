import type { CSSProperties } from "react";
import type { Block, BlockStyle, ShadowPreset } from "@/components/newsletter-composer/types/editor";

const SHADOWS: Record<ShadowPreset, string | undefined> = {
  none: undefined,
  soft: "0 1px 2px rgba(17,24,39,0.04), 0 10px 24px -16px rgba(17,24,39,0.18)",
  medium: "0 2px 6px rgba(17,24,39,0.06), 0 22px 44px -22px rgba(17,24,39,0.26)",
  large: "0 8px 18px rgba(17,24,39,0.08), 0 40px 70px -30px rgba(17,24,39,0.34)",
};

/** The email paper's horizontal gutter (Canvas renders the body as `px-7`). */
export const EMAIL_GUTTER = 28;

/** Outer wrapper styles — spacing, background, border, typography defaults. */
export function blockWrapperStyle(block: Block): CSSProperties {
  const s = block.style;
  const css: CSSProperties & Record<string, string | number> = {
    paddingTop: s.paddingTop,
    paddingBottom: s.paddingBottom,
    paddingLeft: s.paddingX,
    paddingRight: s.paddingX,
    marginTop: s.marginTop,
    marginBottom: s.marginBottom,
    borderRadius: s.radius,
    opacity: s.opacity,
    textAlign: s.align,
    color: s.textColor,
    fontFamily:
      s.fontFamily === "serif"
        ? 'var(--font-serif), Georgia, serif'
        : "var(--font-sans), system-ui, sans-serif",
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    letterSpacing: s.letterSpacing,
    lineHeight: s.lineHeight,
    textTransform: s.textTransform,
    gap: s.gap,
    "--highlight": s.highlightColor,
    "--accent": s.accentColor,
    "--link": s.linkColor,
  };

  switch (s.bgType) {
    case "gradient":
      css.backgroundImage = `linear-gradient(${s.gradientAngle}deg, ${s.gradientFrom}, ${s.gradientTo})`;
      break;
    case "image":
      if (s.bgImage) {
        css.backgroundImage = `linear-gradient(rgba(17,24,39,${s.tint}), rgba(17,24,39,${s.tint})), url(${s.bgImage})`;
        css.backgroundSize = "cover";
        css.backgroundPosition = "center";
      }
      break;
    case "glass":
      css.backgroundColor = "rgba(255,255,255,0.62)";
      css.backdropFilter = `blur(${s.blur}px)`;
      css.WebkitBackdropFilter = `blur(${s.blur}px)`;
      break;
    default:
      if (s.backgroundColor && s.backgroundColor !== "transparent") {
        css.backgroundColor = s.backgroundColor;
      }
  }

  /* Layout: "Contained" keeps the email gutter; "Full width" bleeds to the
     paper's edge; "Full bleed" pushes the background edge-to-edge and squares
     the corners while the text keeps its gutter. */
  if (block.settings.fullBleed) {
    css.marginLeft = -EMAIL_GUTTER;
    css.marginRight = -EMAIL_GUTTER;
    css.paddingLeft = Math.max(s.paddingX, EMAIL_GUTTER);
    css.paddingRight = Math.max(s.paddingX, EMAIL_GUTTER);
    css.borderRadius = 0;
  } else if (s.width === "full") {
    css.marginLeft = -EMAIL_GUTTER;
    css.marginRight = -EMAIL_GUTTER;
  }

  /* Alignment is opt-in: at the defaults the wrapper stays a plain block so
     nothing about the existing look shifts. */
  if (s.hAlign !== "flex-start" || s.vAlign !== "flex-start") {
    css.display = "flex";
    css.flexDirection = "column";
    css.alignItems =
      s.hAlign === "center" ? "center" : s.hAlign === "flex-end" ? "flex-end" : "stretch";
    css.justifyContent =
      s.vAlign === "center" ? "center" : s.vAlign === "flex-end" ? "flex-end" : "flex-start";
  }

  if (s.borderEnabled) {
    css.borderStyle = "solid";
    css.borderWidth = s.borderWidth;
    css.borderColor = s.borderColor;
  }
  if (s.outline) {
    css.outline = `2px solid ${s.accentColor}`;
    css.outlineOffset = 2;
  }
  if (s.glow) {
    css.boxShadow = `0 0 0 1px ${s.accentColor}22, 0 18px 48px -18px ${s.accentColor}66`;
  } else if (SHADOWS[s.shadow]) {
    css.boxShadow = SHADOWS[s.shadow] as string;
  }

  return css;
}

/** Inner content width controls (reading width). */
export function blockInnerStyle(block: Block): CSSProperties {
  const s = block.style;
  if (!s.readingWidth) return {};
  return {
    maxWidth: s.readingWidth,
    marginLeft: s.align === "center" ? "auto" : undefined,
    marginRight: s.align === "center" ? "auto" : undefined,
  };
}

export function gradientTextStyle(s: BlockStyle): CSSProperties {
  if (!s.gradientText) return {};
  return {
    backgroundImage: `linear-gradient(120deg, ${s.accentColor}, ${s.gradientFrom})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
}

export function flexAlign(v: BlockStyle["vAlign"]) {
  return { alignItems: v };
}
