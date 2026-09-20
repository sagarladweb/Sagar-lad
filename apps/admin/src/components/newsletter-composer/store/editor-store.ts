"use client";

import { create } from "zustand";
import { cloneBlock, cloneBlocks, createBlock } from "@/components/newsletter-composer/lib/blockFactory";
import { uid } from "@/components/newsletter-composer/lib/utils";
import { TEMPLATES } from "@/components/newsletter-composer/templates/templates";
import type { Template } from "@/components/newsletter-composer/templates/templates";
import type {
  Block,
  BlockSettings,
  BlockStyle,
  BlockType,
  CommentThread,
  DeviceMode,
  InspectorTab,
  LeftTab,
  NewsletterDoc,
  SaveStatus,
  SavedTemplate,
  TemplateCategory,
  TemplateKind,
  TemplateTheme,
} from "@/components/newsletter-composer/types/editor";

type TemplateSource =
  | Template
  | { blocks?: Block[] | (() => Block[]); name?: string; id?: unknown }
  | (() => Block[]);

/** Templates store blocks as a factory; plain sources carry a live array. */
function resolveTemplateBlocks(source: TemplateSource): Block[] {
  if (typeof source === "function") return source();
  const blocks = source.blocks;
  if (typeof blocks === "function") return blocks();
  return blocks ?? [];
}

export const STORAGE_KEY = "sagarlad.newsletter.composer.v1";
const HISTORY_LIMIT = 80;

/* ------------------------------------------------------------------ *
 *  Helpers
 * ------------------------------------------------------------------ */
function snapshot(doc: NewsletterDoc): NewsletterDoc {
  return JSON.parse(JSON.stringify(doc)) as NewsletterDoc;
}

export function emptyDoc(): NewsletterDoc {
  return {
    title: "The Sagar Lad Letter",
    issue: "Issue 001",
    author: "Sagar Lad",
    subject: "The Sagar Lad Letter",
    previewText: "Newslatter",
    blocks: [createBlock("hero")],
    updatedAt: Date.now(),
  };
}

interface PersistedState {
  doc: NewsletterDoc;
  favorites: string[];
  recents: string[];
  savedTemplates: SavedTemplate[];
  publishedAt: number | null;
}

export interface EditorState extends PersistedState {
  /* ui */
  selectedId: string | null;
  hoveredId: string | null;
  device: DeviceMode;
  leftTab: LeftTab;
  inspectorTab: InspectorTab;
  search: string;
  showHidden: boolean;
  focusMode: boolean;
  darkPreview: boolean;
  hydrated: boolean;

  /* persistence */
  saveStatus: SaveStatus;
  lastSavedAt: number | null;

  /* history */
  past: NewsletterDoc[];
  future: NewsletterDoc[];

  comments: Record<string, CommentThread[]>;

  /* actions — document */
  setDoc: (doc: NewsletterDoc) => void;
  setTitle: (title: string) => void;
  setIssue: (issue: string) => void;
  setAuthor: (author: string) => void;
  setSubject: (subject: string) => void;
  setPreviewText: (previewText: string) => void;

  /* actions — blocks */
  addBlock: (type: BlockType, index?: number) => void;
  insertBlocks: (blocks: Block[], index?: number) => void;
  updateData: (id: string, patch: Record<string, any>) => void;
  updateStyle: (id: string, patch: Partial<BlockStyle>) => void;
  updateSettings: (id: string, patch: Partial<BlockSettings>) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  duplicateBlock: (id: string) => void;
  removeBlock: (id: string) => void;
  clearBlocks: () => void;

  /* actions — ui */
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  setDevice: (device: DeviceMode) => void;
  setLeftTab: (tab: LeftTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setSearch: (search: string) => void;
  toggleShowHidden: () => void;
  toggleFocusMode: () => void;
  toggleDarkPreview: () => void;

  /* actions — history */
  undo: () => void;
  redo: () => void;

  /* actions — comments */
  addComment: (blockId: string, body: string, author?: string) => void;
  resolveComment: (blockId: string, commentId: string) => void;

  /* actions — templates */
  applyTemplate: (template: TemplateSource, name?: string) => void;
  applyTemplateFromBlocks: (blocks: Block[], name?: string) => void;
  duplicateTemplate: (templateId: string) => void;
  toggleFavorite: (templateId: string) => void;
  markTemplateUsed: (templateId: string) => void;
  saveAsTemplate: (name: string, theme?: TemplateTheme) => void;
  deleteSavedTemplate: (id: string) => void;

  /* actions — lifecycle */
  hydrate: () => void;
  resetAll: () => void;
  flushSave: () => void;
}

/* Coalescing refs live outside React so typing stays a single undo step. */
let lastTag: string | null = null;
let lastTagAt = 0;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

export const useEditorStore = create<EditorState>((set, get) => {
  const persist = () => {
    if (typeof window === "undefined") return;
    const { doc, favorites, recents, savedTemplates, publishedAt } = get();
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ doc, favorites, recents, savedTemplates, publishedAt }),
      );
      set({ saveStatus: "saved", lastSavedAt: Date.now() });
    } catch {
      set({ saveStatus: "saved", lastSavedAt: Date.now() });
    }
  };

  const scheduleSave = () => {
    set({ saveStatus: "saving" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 650);
  };

  /** Central mutation helper: history + autosave in one place. */
  const commit = (
    tag: string,
    updater: (doc: NewsletterDoc) => NewsletterDoc,
    extra: Partial<EditorState> = {},
  ) => {
    const now = Date.now();
    const coalesce = lastTag === tag && now - lastTagAt < 900;
    lastTag = tag;
    lastTagAt = now;

    const state = get();
    const nextDoc: NewsletterDoc = { ...updater(state.doc), updatedAt: now };
    const patch: Partial<EditorState> = { doc: nextDoc, ...extra };
    if (!coalesce) {
      patch.past = [...state.past, snapshot(state.doc)].slice(-HISTORY_LIMIT);
      patch.future = [];
    }
    set(patch);
    scheduleSave();
  };

  const DEFAULT_THEME: TemplateTheme = {
    cover: { from: "#F4F2EC", to: "#FFFFFF", accent: "#1D4ED8" },
    spacing: { blockGap: 16, sectionGap: 40, containerPaddingX: 28 },
    typography: {
      fontFamily: "sans",
      headingFontFamily: "serif",
      bodySize: 17,
      headingSize: 40,
      lineHeight: 1.7,
    },
  };

  function defaultThemeFor(blocks: Block[]): TemplateTheme {
    if (!blocks.length) return DEFAULT_THEME;
    return blocks.reduce((theme, block) => {
      if (block.style.accentColor && !theme.cover.accent) {
        theme.cover.accent = block.style.accentColor;
      }
      return theme;
    }, { ...DEFAULT_THEME });
  }

  return {
    /* ------------------------------ state ------------------------------ */
    doc: emptyDoc(),
    favorites: [],
    recents: [],
    savedTemplates: [],
    publishedAt: null,

    selectedId: null,
    hoveredId: null,
    device: "desktop",
    leftTab: "blocks",
    inspectorTab: "content",
    search: "",
    showHidden: false,
    focusMode: false,
    darkPreview: false,
    hydrated: false,

    saveStatus: "idle",
    lastSavedAt: null,

    past: [],
    future: [],

    comments: {},

    /* --------------------------- document ------------------------------ */
    setDoc: (doc) => {
      set({ doc: snapshot(doc), past: [], future: [], selectedId: null });
      scheduleSave();
    },
    setTitle: (title) => commit("title", (doc) => ({ ...doc, title })),
    setIssue: (issue) => commit("issue", (doc) => ({ ...doc, issue })),
    setAuthor: (author) => commit("author", (doc) => ({ ...doc, author })),
    setSubject: (subject) => commit("subject", (doc) => ({ ...doc, subject })),
    setPreviewText: (previewText) => commit("previewText", (doc) => ({ ...doc, previewText })),

    /* ----------------------------- blocks ------------------------------ */
    addBlock: (type, index) => {
      const block = createBlock(type);
      const current = get().doc.blocks;
      const at = index === undefined ? current.length : index;
      commit(
        `add:${block.id}`,
        (doc) => {
          const blocks = [...doc.blocks];
          blocks.splice(at, 0, block);
          return { ...doc, blocks };
        },
        { selectedId: block.id, inspectorTab: get().inspectorTab },
      );
    },

    insertBlocks: (incoming, index) => {
      const fresh = cloneBlocks(incoming);
      const at = index === undefined ? get().doc.blocks.length : index;
      commit(
        `insert:${uid("g")}`,
        (doc) => {
          const blocks = [...doc.blocks];
          blocks.splice(at, 0, ...fresh);
          return { ...doc, blocks };
        },
        { selectedId: fresh[0]?.id ?? null },
      );
    },

    updateData: (id, patch) =>
      commit(`data:${id}`, (doc) =>
        ({
          ...doc,
          blocks: doc.blocks.map((block) =>
            block.id === id ? { ...block, data: { ...block.data, ...patch } } : block,
          ),
        }),
      ),

    updateStyle: (id, patch) =>
      commit(`style:${id}:${Object.keys(patch).join(",")}`, (doc) =>
        ({
          ...doc,
          blocks: doc.blocks.map((block) =>
            block.id === id ? { ...block, style: { ...block.style, ...patch } } : block,
          ),
        }),
      ),

    updateSettings: (id, patch) =>
      commit(`settings:${id}:${Object.keys(patch).join(",")}`, (doc) =>
        ({
          ...doc,
          blocks: doc.blocks.map((block) =>
            block.id === id
              ? { ...block, settings: { ...block.settings, ...patch } }
              : block,
          ),
        }),
      ),

    moveBlock: (id, direction) =>
      commit(`move:${id}:${direction}`, (doc) => {
        const index = doc.blocks.findIndex((b) => b.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= doc.blocks.length) return doc;
        const blocks = [...doc.blocks];
        const [moved] = blocks.splice(index, 1);
        blocks.splice(target, 0, moved);
        return { ...doc, blocks };
      }),

    reorderBlocks: (activeId, overId) =>
      commit(`reorder:${uid("r")}`, (doc) => {
        const from = doc.blocks.findIndex((b) => b.id === activeId);
        const to = doc.blocks.findIndex((b) => b.id === overId);
        if (from < 0 || to < 0 || from === to) return doc;
        const blocks = [...doc.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        return { ...doc, blocks };
      }),

    duplicateBlock: (id) => {
      const doc = get().doc;
      const index = doc.blocks.findIndex((b) => b.id === id);
      if (index < 0) return;
      const copy = cloneBlock(doc.blocks[index]);
      commit(`duplicate:${id}`, (d) => {
        const blocks = [...d.blocks];
        blocks.splice(index + 1, 0, copy);
        return { ...d, blocks };
      });
    },

    removeBlock: (id) =>
      commit(
        `remove:${id}`,
        (doc) => ({ ...doc, blocks: doc.blocks.filter((b) => b.id !== id) }),
        { selectedId: get().selectedId === id ? null : get().selectedId },
      ),

    clearBlocks: () =>
      commit("clear", (doc) => ({ ...doc, blocks: [] }), { selectedId: null }),

    /* ------------------------------- ui -------------------------------- */
    selectBlock: (id) =>
      set((state) => ({
        selectedId: id,
        inspectorTab: id ? state.inspectorTab : state.inspectorTab,
      })),
    hoverBlock: (id) => set({ hoveredId: id }),
    setDevice: (device) => set({ device }),
    setLeftTab: (leftTab) => set({ leftTab }),
    setInspectorTab: (inspectorTab) => set({ inspectorTab }),
    setSearch: (search) => set({ search }),
    toggleShowHidden: () => set((s) => ({ showHidden: !s.showHidden })),
    toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
    toggleDarkPreview: () => set((s) => ({ darkPreview: !s.darkPreview })),

    /* ----------------------------- history ----------------------------- */
    undo: () => {
      const { past, doc, future } = get();
      if (!past.length) return;
      const previous = past[past.length - 1];
      lastTag = null;
      set({
        doc: snapshot(previous),
        past: past.slice(0, -1),
        future: [snapshot(doc), ...future].slice(0, HISTORY_LIMIT),
        selectedId: null,
      });
      scheduleSave();
    },

    redo: () => {
      const { past, doc, future } = get();
      if (!future.length) return;
      const [next, ...rest] = future;
      lastTag = null;
      set({
        doc: snapshot(next),
        past: [...past, snapshot(doc)].slice(-HISTORY_LIMIT),
        future: rest,
        selectedId: null,
      });
      scheduleSave();
    },

    /* ---------------------------- comments ----------------------------- */
    addComment: (blockId, body, author = "You") =>
      set((state) => {
        const thread = state.comments[blockId] ?? [];
        return {
          comments: {
            ...state.comments,
            [blockId]: [
              ...thread,
              { id: uid("cmt"), author, body, createdAt: Date.now() },
            ],
          },
        };
      }),

    resolveComment: (blockId, commentId) =>
      set((state) => ({
        comments: {
          ...state.comments,
          [blockId]: (state.comments[blockId] ?? []).map((c) =>
            c.id === commentId ? { ...c, resolved: !c.resolved } : c,
          ),
        },
      })),

    /* ---------------------------- templates ---------------------------- */
    applyTemplate: (source, name) => {
      const fresh = cloneBlocks(resolveTemplateBlocks(source));
      commit(
        `template:${uid("t")}`,
        (doc) => ({
          ...doc,
          title: name ?? doc.title,
          blocks: fresh,
        }),
        { selectedId: fresh[0]?.id ?? null, leftTab: "blocks" },
      );
    },

    applyTemplateFromBlocks: (blocks, name) => {
      const fresh = cloneBlocks(blocks);
      commit(
        `template:${uid("t")}`,
        (doc) => ({
          ...doc,
          title: name ?? doc.title,
          blocks: fresh,
        }),
        { selectedId: fresh[0]?.id ?? null, leftTab: "blocks" },
      );
    },

    duplicateTemplate: (templateId) => {
      const state = get();
      const saved = state.savedTemplates.find((t) => t.id === templateId);
      if (saved) {
        const copy: SavedTemplate = {
          ...saved,
          id: uid("saved"),
          name: `${saved.name} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          savedTemplates: [...s.savedTemplates, copy].slice(0, 40),
        }));
        scheduleSave();
        return;
      }

      const curated = TEMPLATES.find((t) => t.id === templateId);
      if (!curated) return;

      const clone: SavedTemplate = {
        id: uid("saved"),
        name: `${curated.name} (copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        kind: "saved",
        theme: curated.theme,
        blocks: cloneBlocks(curated.blocks()),
      };
      set((s) => ({
        savedTemplates: [...s.savedTemplates, clone].slice(0, 40),
      }));
      scheduleSave();
      return;
    },

    toggleFavorite: (templateId) =>
      set((state) => {
        const next = state.favorites.includes(templateId)
          ? state.favorites.filter((id) => id !== templateId)
          : [...state.favorites, templateId];
        scheduleSave();
        return { favorites: next };
      }),

    markTemplateUsed: (templateId) =>
      set((state) => {
        const next = [templateId, ...state.recents.filter((id) => id !== templateId)].slice(
          0,
          6,
        );
        scheduleSave();
        return { recents: next };
      }),

    saveAsTemplate: (name, theme) =>
      set((state) => {
        const themeVal = theme ?? defaultThemeFor(state.doc.blocks);
        const template: SavedTemplate = {
          id: uid("saved"),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          kind: "saved",
          theme: themeVal,
          blocks: snapshot(state.doc).blocks,
        };
        const next = [template, ...state.savedTemplates].slice(0, 40);
        scheduleSave();
        return { savedTemplates: next };
      }),

    deleteSavedTemplate: (id) =>
      set((state) => {
        const next = state.savedTemplates.filter((t) => t.id !== id);
        scheduleSave();
        return { savedTemplates: next };
      }),

    /* ---------------------------- lifecycle ---------------------------- */
    hydrate: () => {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          if (parsed.doc?.blocks) {
            set({
              doc: parsed.doc,
              favorites: parsed.favorites ?? [],
              recents: parsed.recents ?? [],
              savedTemplates: parsed.savedTemplates ?? [],
              publishedAt: parsed.publishedAt ?? null,
              lastSavedAt: parsed.doc.updatedAt ?? null,
              saveStatus: "saved",
              hydrated: true,
            });
            return;
          }
        }
      } catch {
        /* corrupted storage — fall through to a clean document */
      }
      set({ hydrated: true });
    },

    resetAll: () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      lastTag = null;
      set({
        doc: emptyDoc(),
        selectedId: null,
        hoveredId: null,
        past: [],
        future: [],
        comments: {},
        saveStatus: "idle",
        lastSavedAt: null,
        publishedAt: null,
      });
    },

    flushSave: () => {
      if (saveTimer) clearTimeout(saveTimer);
      persist();
    },
  };
});

/* ------------------------------------------------------------------ *
 *  Selectors
 * ------------------------------------------------------------------ */
export const selectBlockById = (id: string | null) => (state: EditorState) =>
  state.doc.blocks.find((b) => b.id === id) ?? null;

export const selectVisibleBlocks = (state: EditorState) =>
  state.doc.blocks.filter((block) => {
    const device = state.device;
    if (block.settings.hidden && !state.showHidden) return false;
    if (device === "desktop" && !block.settings.showDesktop) return false;
    if (device === "tablet" && !block.settings.showTablet) return false;
    if (device === "mobile" && !block.settings.showMobile) return false;
    return true;
  });
