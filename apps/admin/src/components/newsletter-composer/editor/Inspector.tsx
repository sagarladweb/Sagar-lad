"use client";

import * as React from "react";
import {
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartHorizontal,
  CircleCheck,
  Copy,
  Eye,
  Gauge,
  Lightbulb,
  Link2,
  Lock,
  LockOpen,
  Palette,
  Square,
  Type as TypeIcon,
} from "lucide-react";
import {
  AccordionSection,
  Badge,
  Button,
  ColorInput,
  Field,
  Input,
  Segmented,
  Select,
  Slider,
  ToggleRow,
  Tooltip,
} from "@/components/newsletter-composer/ui/primitives";
import {
  Columns2,
  FileBarChart,
  MousePointer,
  PanelTop,
  Pointer,
  Type,
  Unlock,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  ControlGrid,
  FieldRenderer,
  ItemSelector,
  SegmentedChoice,
} from "@/components/newsletter-composer/editor/InspectorControls";
import { BLOCK_DEFS } from "@/components/newsletter-composer/blocks/registry";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type {
  AnimationPreset,
  BgType,
  Block,
  BlockStyle,
  DeviceMode,
  InspectorTab,
  ShadowPreset,
} from "@/components/newsletter-composer/types/editor";
import { cn, contrastGrade, contrastRatio, truncate } from "@/components/newsletter-composer/lib/utils";


/* ------------------------------------------------------------------ *
 *  Section grouping helper for schema-driven content fields
 * ------------------------------------------------------------------ */
function useGroupedFields(block: Block) {
  return React.useMemo(() => {
    const fields = BLOCK_DEFS[block.type]?.fields ?? [];
    const groups: { section: string; fields: typeof fields }[] = [];
    fields.forEach((field) => {
      const section = field.section ?? "Content";
      const existing = groups.find((group) => group.section === section);
      if (existing) existing.fields.push(field);
      else groups.push({ section, fields: [field] });
    });
    groups.sort((a, b) => {
      if (a.section === "Content") return -1;
      if (b.section === "Content") return 1;
      if (a.section === "Advanced") return 1;
      if (b.section === "Advanced") return -1;
      return 0;
    });
    return groups;
  }, [block]);
}

/* ------------------------------------------------------------------ *
 *  CONTENT TAB
 * ------------------------------------------------------------------ */
const DB_BLOCKS = ["booksRead", "booksPublished", "ebooks", "quotes", "videoFeed", "blogPosts"] as const;
type DBBlockType = (typeof DB_BLOCKS)[number];

function ContentTab({ block }: { block: Block }) {
  const updateData = useEditorStore((s) => s.updateData);
  const groups = useGroupedFields(block);
  const def = BLOCK_DEFS[block.type];
  const isDBBlock = (DB_BLOCKS as readonly string[]).includes(block.type);

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-line bg-canvas/50 px-4 py-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[10px]"
          style={{ background: `${def.swatch}16`, color: def.swatch }}
        >
          <def.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">{def.label}</p>
          <p className="truncate text-[11px] text-ink-muted">{def.description}</p>
        </div>
      </div>

      {isDBBlock ? (
        <div className="flex flex-col gap-3 px-4 py-4">
          <Field label="Section title">
            <Input
              value={String(block.data.title ?? "")}
              onChange={(e) => updateData(block.id, { title: e.target.value })}
              placeholder={def.label}
            />
          </Field>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Select items to show
            </label>
            <ItemSelector
              blockType={block.type as DBBlockType}
              selectedIds={Array.isArray(block.data.selectedIds) ? block.data.selectedIds : []}
              onChange={(ids) => updateData(block.id, { selectedIds: ids })}
            />
          </div>
        </div>
      ) : (
        groups.map((group, index) => (
          <AccordionSection
            key={group.section}
            title={group.section}
            defaultOpen={index < 2}
          >
            {group.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={block.data[field.key]}
                onChange={(value) => updateData(block.id, { [field.key]: value })}
              />
            ))}
          </AccordionSection>
        ))
      )}

      {!groups.length && !isDBBlock ? (
        <div className="px-4 py-8 text-center text-[12.5px] text-ink-muted">
          This block has no content controls.
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  STYLE TAB
 * ------------------------------------------------------------------ */
function StyleTab({ block }: { block: Block }) {
  const updateStyle = useEditorStore((s) => s.updateStyle);
  const s = block.style;
  const set = (patch: Partial<BlockStyle>) => updateStyle(block.id, patch);

  return (
    <>
      <AccordionSection
        title="Typography"
        right={<TypeIcon className="h-3.5 w-3.5 text-ink-muted" />}
      >
        <SegmentedChoice<"sans" | "serif">
          value={s.fontFamily}
          onChange={(value) => set({ fontFamily: value })}
          options={[
            { value: "sans", label: "Inter" },
            { value: "serif", label: "Instrument Serif" },
          ]}
        />
        <Field label="Size">
          <Slider value={s.fontSize} min={11} max={72} step={0.5} onChange={(v) => set({ fontSize: v })} suffix="px" />
        </Field>
        <ControlGrid>
          <Field label="Weight">
            <Select
              value={String(s.fontWeight)}
              onChange={(value) => set({ fontWeight: Number(value) })}
              options={[400, 500, 600, 700, 800].map((weight) => ({
                label: String(weight),
                value: String(weight),
              }))}
            />
          </Field>
          <Field label="Transform">
            <Select
              value={s.textTransform}
              onChange={(value) => set({ textTransform: value as BlockStyle["textTransform"] })}
              options={[
                { label: "None", value: "none" },
                { label: "UPPER", value: "uppercase" },
                { label: "lower", value: "lowercase" },
                { label: "Title", value: "capitalize" },
              ]}
            />
          </Field>
        </ControlGrid>
        <Field label="Letter spacing">
          <Slider
            value={s.letterSpacing}
            min={-2}
            max={6}
            step={0.1}
            onChange={(v) => set({ letterSpacing: v })}
            suffix="px"
          />
        </Field>
        <Field label="Line height">
          <Slider value={s.lineHeight} min={1} max={2.6} step={0.05} onChange={(v) => set({ lineHeight: v })} />
        </Field>
        <Field label="Alignment">
          <SegmentedChoice<BlockStyle["align"]>
            value={s.align}
            onChange={(value) => set({ align: value })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </Field>
        <Field label="Reading width" hint="0 = full width. 60–75 characters reads best.">
          <Slider
            value={s.readingWidth}
            min={0}
            max={720}
            step={20}
            onChange={(v) => set({ readingWidth: v })}
            suffix="px"
          />
        </Field>
        {block.type === "paragraph" ? (
          <ToggleRow
            label="Drop cap"
            hint="Large first letter on paragraphs"
            checked={s.dropCap}
            onChange={(value) => set({ dropCap: value })}
          />
        ) : null}
      </AccordionSection>

      <AccordionSection
        title="Colors"
        right={<Palette className="h-3.5 w-3.5 text-ink-muted" />}
      >
        <Field label="Text color">
          <ColorInput value={s.textColor} onChange={(v) => set({ textColor: v })} />
        </Field>
        <ControlGrid>
          <Field label="Accent">
            <ColorInput value={s.accentColor} onChange={(v) => set({ accentColor: v })} />
          </Field>
          <Field label="Link">
            <ColorInput value={s.linkColor} onChange={(v) => set({ linkColor: v })} />
          </Field>
        </ControlGrid>
        <Field label="Background">
          <ColorInput
            value={s.backgroundColor}
            onChange={(v) => set({ backgroundColor: v })}
            allowTransparent
          />
        </Field>
        <Field label="Highlight">
          <ColorInput value={s.highlightColor} onChange={(v) => set({ highlightColor: v })} />
        </Field>
        <Field label="Opacity">
          <Slider value={s.opacity} min={0.1} max={1} step={0.05} onChange={(v) => set({ opacity: v })} />
        </Field>
        {["heading", "subheading", "paragraph"].includes(block.type) ? (
          <ToggleRow
            label="Gradient text"
            hint="Fade the accent across the type"
            checked={s.gradientText}
            onChange={(value) => set({ gradientText: value })}
          />
        ) : null}
      </AccordionSection>

      <AccordionSection title="Spacing" defaultOpen={false}>
        <ControlGrid>
          <Field label="Padding top">
            <Slider value={s.paddingTop} min={0} max={88} onChange={(v) => set({ paddingTop: v })} suffix="px" />
          </Field>
          <Field label="Padding bottom">
            <Slider value={s.paddingBottom} min={0} max={88} onChange={(v) => set({ paddingBottom: v })} suffix="px" />
          </Field>
        </ControlGrid>
        <Field label="Left / right padding">
          <Slider value={s.paddingX} min={0} max={64} onChange={(v) => set({ paddingX: v })} suffix="px" />
        </Field>
        <ControlGrid>
          <Field label="Margin top">
            <Slider value={s.marginTop} min={0} max={96} onChange={(v) => set({ marginTop: v })} suffix="px" />
          </Field>
          <Field label="Margin bottom">
            <Slider value={s.marginBottom} min={0} max={96} onChange={(v) => set({ marginBottom: v })} suffix="px" />
          </Field>
        </ControlGrid>
        <Field label="Gap between children">
          <Slider value={s.gap} min={0} max={48} onChange={(v) => set({ gap: v })} suffix="px" />
        </Field>
      </AccordionSection>

      <AccordionSection title="Border & radius" defaultOpen={false}>
        <ToggleRow
          label="Border"
          checked={s.borderEnabled}
          onChange={(value) => set({ borderEnabled: value })}
        />
        {s.borderEnabled ? (
          <>
            <Field label="Border color">
              <ColorInput value={s.borderColor} onChange={(v) => set({ borderColor: v })} />
            </Field>
            <Field label="Border width">
              <Slider value={s.borderWidth} min={1} max={6} onChange={(v) => set({ borderWidth: v })} suffix="px" />
            </Field>
          </>
        ) : null}
        <Field label="Corner radius">
          <Slider value={s.radius} min={0} max={40} onChange={(v) => set({ radius: v })} suffix="px" />
        </Field>
        <Field label="Shadow">
          <SegmentedChoice<ShadowPreset>
            value={s.shadow}
            onChange={(value) => set({ shadow: value })}
            options={[
              { value: "none", label: "None" },
              { value: "soft", label: "Soft" },
              { value: "medium", label: "Med" },
              { value: "large", label: "Large" },
            ]}
          />
        </Field>
        <ToggleRow
          label="Outline"
          hint="Focus ring using the accent color"
          checked={s.outline}
          onChange={(value) => set({ outline: value })}
        />
      </AccordionSection>

      <AccordionSection title="Background" defaultOpen={false}>
        <SegmentedChoice<BgType>
          value={s.bgType}
          onChange={(value) => set({ bgType: value })}
          options={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
            { value: "image", label: "Image" },
            { value: "glass", label: "Glass" },
          ]}
        />
        {s.bgType === "gradient" ? (
          <>
            <ControlGrid>
              <Field label="From">
                <ColorInput value={s.gradientFrom} onChange={(v) => set({ gradientFrom: v })} />
              </Field>
              <Field label="To">
                <ColorInput value={s.gradientTo} onChange={(v) => set({ gradientTo: v })} />
              </Field>
            </ControlGrid>
            <Field label="Angle">
              <Slider value={s.gradientAngle} min={0} max={360} onChange={(v) => set({ gradientAngle: v })} suffix="°" />
            </Field>
          </>
        ) : null}
        {s.bgType === "image" ? (
          <>
            <Field label="Background image URL">
              <Input
                value={s.bgImage}
                placeholder="https://…"
                onChange={(event) => set({ bgImage: event.target.value })}
              />
            </Field>
            <Field label="Tint overlay">
              <Slider value={s.tint} min={0} max={0.8} step={0.05} onChange={(v) => set({ tint: v })} />
            </Field>
          </>
        ) : null}
        {s.bgType === "glass" ? (
          <Field label="Blur">
            <Slider value={s.blur} min={0} max={40} onChange={(v) => set({ blur: v })} suffix="px" />
          </Field>
        ) : null}
      </AccordionSection>

      <AccordionSection title="Layout" defaultOpen={false}>
        <Field label="Section width">
          <SegmentedChoice<BlockStyle["width"]>
            value={s.width}
            onChange={(value) => set({ width: value })}
            options={[
              { value: "center", label: "Contained" },
              { value: "full", label: "Full width" },
            ]}
          />
        </Field>
        <Field label="Vertical align">
          <SegmentedChoice<BlockStyle["vAlign"]>
            value={s.vAlign}
            onChange={(value) => set({ vAlign: value })}
            options={[
              { value: "flex-start", label: "Top" },
              { value: "center", label: "Middle" },
              { value: "flex-end", label: "Bottom" },
            ]}
          />
        </Field>
        <Field label="Horizontal align">
          <SegmentedChoice<BlockStyle["hAlign"]>
            value={s.hAlign}
            onChange={(value) => set({ hAlign: value })}
            options={[
              { value: "flex-start", label: "Start" },
              { value: "center", label: "Center" },
              { value: "flex-end", label: "End" },
            ]}
          />
        </Field>
        {block.type === "columns2" ? (
          <ToggleRow
            label="Stack on mobile"
            hint="Collapse columns on narrow screens"
            checked={s.stackOnMobile}
            onChange={(value) => set({ stackOnMobile: value })}
          />
        ) : null}
      </AccordionSection>

      <AccordionSection title="Effects" defaultOpen={false}>
        <Field label="Entrance animation" hint="Editor preview only — never sent in email.">
          <Select
            value={s.animation}
            onChange={(value) => set({ animation: value as AnimationPreset })}
            options={[
              { label: "None", value: "none" },
              { label: "Fade in", value: "fadeIn" },
              { label: "Slide up", value: "slideUp" },
              { label: "Scale", value: "scale" },
            ]}
          />
        </Field>
        <ToggleRow
          label="Hover lift"
          checked={s.hoverLift}
          onChange={(value) => set({ hoverLift: value })}
        />
        <ToggleRow
          label="Glow"
          hint="Accent-tinted shadow"
          checked={s.glow}
          onChange={(value) => set({ glow: value })}
        />
      </AccordionSection>
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  SETTINGS TAB
 * ------------------------------------------------------------------ */
function AccessibilityChecks({ block }: { block: Block }) {
  const blocks = useEditorStore((s) => s.doc.blocks);
  const index = blocks.findIndex((b) => b.id === block.id);

  const bg = block.style.backgroundColor;
  const effectiveBg =
    !bg || bg === "transparent"
      ? "#FFFFFF"
      : block.style.bgType === "gradient"
        ? block.style.gradientTo
        : bg;
  const ratio = contrastRatio(block.style.textColor, effectiveBg);
  const grade = contrastGrade(ratio);

  const altOk = block.type !== "image" && block.type !== "gif" ? null : Boolean(block.data.alt);

  const headingIssue = React.useMemo(() => {
    if (block.type !== "heading") return null;
    const level = String(block.data.level ?? "h1");
    if (level === "h1") return null;
    const before = blocks.slice(0, index);
    const hasH1 = before.some((b: Block) => b.type === "heading" && b.data.level === "h1");
    return hasH1 ? null : `First heading on the page is ${level.toUpperCase()}`;
  }, [block, blocks, index]);

  const width = block.style.readingWidth;
  const widthWarning = width > 0 && (width < 420 || width > 720);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-control border border-line bg-surface px-3 py-2">
        <span className="text-[12.5px] text-ink">Contrast (text on background)</span>
        <Badge tone={grade.tone === "pass" ? "success" : grade.tone === "warn" ? "accent" : "danger"}>
          {grade.label}
        </Badge>
      </div>
      {altOk !== null ? (
        <div className="flex items-center justify-between rounded-control border border-line bg-surface px-3 py-2">
          <span className="text-[12.5px] text-ink">Alt text</span>
          <Badge tone={altOk ? "success" : "danger"}>
            {altOk ? "Provided" : "Missing"}
          </Badge>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-control border border-line bg-surface px-3 py-2">
          <span className="text-[12.5px] text-ink">Alt text</span>
          <Badge tone="neutral">Not applicable</Badge>
        </div>
      )}
      <div className="flex items-center justify-between rounded-control border border-line bg-surface px-3 py-2">
        <span className="text-[12.5px] text-ink">Heading structure</span>
        <Badge tone={headingIssue ? "accent" : "success"}>
          {headingIssue ?? "OK"}
        </Badge>
      </div>
      <div className="flex items-center justify-between rounded-control border border-line bg-surface px-3 py-2">
        <span className="text-[12.5px] text-ink">Reading width</span>
        <Badge tone={widthWarning ? "accent" : "success"}>
          {width === 0 ? "Auto" : widthWarning ? `${width}px — cramped` : `${width}px`}
        </Badge>
      </div>
    </div>
  );
}

function PlainTextPreview({ block }: { block: Block }) {
  const lines = Object.entries(block.data)
    .filter(([, value]) => typeof value === "string" && String(value).trim())
    .map(([key, value]) => `${key}: ${truncate(String(value).replace(/<[^>]+>/g, " "), 90)}`);

  return (
    <pre className="max-h-40 overflow-auto rounded-control border border-line bg-canvas p-2.5 font-mono text-[11px] leading-relaxed text-ink-soft scroll-thin">
      {lines.length ? lines.join("\n") : "No text content"}
    </pre>
  );
}

function SettingsTab({ block }: { block: Block }) {
  const updateSettings = useEditorStore((s) => s.updateSettings);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const darkPreview = useEditorStore((s) => s.darkPreview);
  const toggleDarkPreview = useEditorStore((s) => s.toggleDarkPreview);
  const { toast } = useUI();
  const st = block.settings;

  const widthWarnings: string[] = [];
  if (block.style.fontSize < 13) widthWarnings.push("Body text under 13px is hard to read on mobile.");
  if (block.style.readingWidth > 720) widthWarnings.push("Sections wider than 720px scroll sideways in Gmail.");

  return (
    <>
      <AccordionSection title="Visibility">
        <ToggleRow
          label="Desktop"
          checked={st.showDesktop}
          onChange={(value) => updateSettings(block.id, { showDesktop: value })}
        />
        <ToggleRow
          label="Tablet"
          checked={st.showTablet}
          onChange={(value) => updateSettings(block.id, { showTablet: value })}
        />
        <ToggleRow
          label="Mobile"
          checked={st.showMobile}
          onChange={(value) => updateSettings(block.id, { showMobile: value })}
        />
        <ToggleRow
          label="Hide block"
          hint="Kept in the issue but not rendered"
          checked={st.hidden}
          onChange={(value) => updateSettings(block.id, { hidden: value })}
        />
        <ToggleRow
          label="Collapse in editor"
          hint="Shrink the block while editing"
          checked={st.collapsed}
          onChange={(value) => updateSettings(block.id, { collapsed: value })}
        />
      </AccordionSection>

      <AccordionSection title="Block metadata">
        <Field
          label="Block ID"
          action={
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(block.id);
                toast("Block ID copied", "success");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          }
        >
          <div className="truncate rounded-control border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-ink-muted">
            {block.id}
          </div>
        </Field>
        <Field label="Section name">
          <Input
            value={st.sectionName}
            placeholder="e.g. The lead story"
            onChange={(event) => updateSettings(block.id, { sectionName: event.target.value })}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => duplicateBlock(block.id)}>
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>
          <Button
            variant={st.locked ? "primary" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => updateSettings(block.id, { locked: !st.locked })}
          >
            {st.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
            {st.locked ? "Locked" : "Lock"}
          </Button>
        </div>
      </AccordionSection>

      <AccordionSection title="Layout" defaultOpen={false}>
        <ToggleRow
          label="Full bleed"
          hint="Break out of the email container"
          checked={st.fullBleed}
          onChange={(value) => updateSettings(block.id, { fullBleed: value })}
        />
        <ToggleRow
          label="Section divider"
          hint="Dashed rule under this block"
          checked={st.sectionDivider}
          onChange={(value) => updateSettings(block.id, { sectionDivider: value })}
        />
      </AccordionSection>

      <AccordionSection title="Accessibility" defaultOpen={false}>
        <AccessibilityChecks block={block} />
      </AccordionSection>

      <AccordionSection title="Email optimization" defaultOpen={false}>
        <ToggleRow
          label="Dark mode preview"
          hint="Applies to the whole canvas"
          checked={darkPreview}
          onChange={toggleDarkPreview}
        />
        <Field label="Plain text preview">
          <PlainTextPreview block={block} />
        </Field>
        <div className="space-y-1.5">
          {widthWarnings.length ? (
            widthWarnings.map((warning) => (
              <p
                key={warning}
                className="flex items-start gap-2 rounded-control border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11.5px] text-amber-800"
              >
                <Lightbulb className="mt-[1px] h-3.5 w-3.5 shrink-0" />
                {warning}
              </p>
            ))
          ) : (
            <p className="flex items-start gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[11.5px] text-emerald-800">
              <CircleCheck className="mt-[1px] h-3.5 w-3.5 shrink-0" />
              No email client warnings for this block.
            </p>
          )}
          <p className="rounded-control border border-line bg-canvas px-2.5 py-2 text-[11.5px] text-ink-muted">
            Images are served compressed at 2x width. Keep GIFs under 1&nbsp;MB.
          </p>
        </div>
      </AccordionSection>
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Right panel shell
 * ------------------------------------------------------------------ */
export function RightPanel() {
  const blocks = useEditorStore((s) => s.doc.blocks);
  const selectedId = useEditorStore((s) => s.selectedId);
  const inspectorTab = useEditorStore((s) => s.inspectorTab);
  const setInspectorTab = useEditorStore((s) => s.setInspectorTab);
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const showHidden = useEditorStore((s) => s.showHidden);
  const toggleShowHidden = useEditorStore((s) => s.toggleShowHidden);

  const block = blocks.find((b: Block) => b.id === selectedId) ?? null;
  const def = block ? BLOCK_DEFS[block.type] : null;

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-line bg-surface">
      <div className="shrink-0 border-b border-line px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Inspector
          </span>
          <div className="flex items-center gap-1">
            <Tooltip label={showHidden ? "Hide hidden blocks" : "Show hidden blocks"}>
              <button
                type="button"
                onClick={toggleShowHidden}
                className={cn(
                  "rounded-[8px] p-1.5 transition",
                  showHidden ? "bg-brand-50 text-brand" : "text-ink-muted hover:bg-black/[0.05]",
                )}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip label="Responsive checks">
              <button
                type="button"
                onClick={() => setDevice(device === "mobile" ? "desktop" : "mobile")}
                className="rounded-[8px] p-1.5 text-ink-muted transition hover:bg-black/[0.05]"
              >
                <Gauge className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>
        <Segmented<InspectorTab>
          layoutId="inspector-tabs"
          fullWidth
          size="sm"
          value={inspectorTab}
          onChange={setInspectorTab}
          items={[
            { value: "content", label: "Content" },
            { value: "style", label: "Style" },
            { value: "settings", label: "Settings" },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {block && def ? (
          <>
            {inspectorTab === "content" ? <ContentTab block={block} /> : null}
            {inspectorTab === "style" ? <StyleTab block={block} /> : null}
            {inspectorTab === "settings" ? <SettingsTab block={block} /> : null}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-canvas text-ink-muted">
              <Square className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">Select a block</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                Click any block on the canvas to edit it.
              </p>
            </div>
          </div>
        )}
      </div>

      {block ? (
        <div className="shrink-0 border-t border-line bg-canvas px-3 py-2">
          <p className="flex items-center gap-1.5 truncate text-[11px] text-ink-muted">
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {block.settings.sectionName || def?.label} · {block.type}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* Re-exported for convenience elsewhere in the editor. */
export { AlignCenterHorizontal, AlignEndHorizontal, AlignStartHorizontal };
