import { BLOCK_DEFS } from "@/components/newsletter-composer/blocks/registry";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STYLE,
  type Block,
  type BlockData,
  type BlockSettings,
  type BlockStyle,
  type BlockType,
} from "@/components/newsletter-composer/types/editor";
import { uid } from "@/components/newsletter-composer/lib/utils";

export interface BlockOverrides {
  id?: string;
  data?: BlockData;
  style?: Partial<BlockStyle>;
  settings?: Partial<BlockSettings>;
}

/** Build a fully-formed block, merging registry defaults with overrides.
 *  Returns null for unknown/legacy block types (e.g. removed "banner"). */
export function createBlock(type: string, overrides: BlockOverrides = {}): Block | null {
  const def = BLOCK_DEFS[type as BlockType];
  if (!def) return null;
  return {
    id: overrides.id ?? uid(type),
    type: type as BlockType,
    data: { ...def.defaultData, ...(overrides.data ?? {}) },
    style: { ...DEFAULT_STYLE, ...def.styleOverride, ...(overrides.style ?? {}) },
    settings: {
      ...DEFAULT_SETTINGS,
      ...def.settingsOverride,
      ...(overrides.settings ?? {}),
    },
  };
}

/** Declarative shorthand: [type, data?, style?] */
export type BlockSpec = [
  BlockType,
  BlockData?,
  Partial<BlockStyle>?,
  Partial<BlockSettings>?,
];

export function createBlocks(specs: BlockSpec[]): Block[] {
  return specs
    .map(([type, data, style, settings]) =>
      createBlock(type, { data, style, settings }),
    )
    .filter(Boolean) as Block[];
}

/** Legacy drafts predate the overlay controls — seed them from Layout so the
 *  pickers show what the canvas already renders. New blocks get defaults from
 *  defaultData and never hit this. */
function seedOverlayControls(block: Block): void {
  if (block.type !== "image") return;
  const d = block.data as Record<string, unknown>;
  d.overlayVAlign ??= block.style?.vAlign ?? "flex-start";
  d.overlayHAlign ??= block.style?.hAlign ?? "flex-start";
  d.overlayFontSize ??= 15;
}

export function seedOverlayBlocks(blocks: Block[]): void {
  for (const b of blocks) seedOverlayControls(b);
}

/** Deep-ish clone with fresh ids — used by duplicate + templates. */
export function cloneBlock(block: Block): Block {
  const copy: Block = {
    ...block,
    id: uid(block.type),
    data: JSON.parse(JSON.stringify(block.data ?? {})),
    style: { ...block.style },
    settings: { ...block.settings, sectionName: "" },
  };
  seedOverlayControls(copy);
  return copy;
}

export function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(cloneBlock);
}
