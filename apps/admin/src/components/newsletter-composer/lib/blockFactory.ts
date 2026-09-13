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

/** Build a fully-formed block, merging registry defaults with overrides. */
export function createBlock(type: BlockType, overrides: BlockOverrides = {}): Block {
  const def = BLOCK_DEFS[type];
  if (!def) {
    throw new Error(`Unknown block type: ${type}`);
  }
  return {
    id: overrides.id ?? uid(type),
    type,
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
  return specs.map(([type, data, style, settings]) =>
    createBlock(type, { data, style, settings }),
  );
}

/** Deep-ish clone with fresh ids — used by duplicate + templates. */
export function cloneBlock(block: Block): Block {
  return {
    ...block,
    id: uid(block.type),
    data: JSON.parse(JSON.stringify(block.data ?? {})),
    style: { ...block.style },
    settings: { ...block.settings, sectionName: "" },
  };
}

export function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(cloneBlock);
}
