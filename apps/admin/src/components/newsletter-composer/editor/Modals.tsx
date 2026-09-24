"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  Clock,
  Copy,
  Eye,
  History,
  Layers,
  Mail,
  Monitor,
  RefreshCw,
  Rocket,
  Send,
  Settings,
  Smartphone,
  Trash2,
  Undo2,
} from "lucide-react";
import { SchedulePicker } from "@/components/ui/SchedulePicker";
import {
  Badge,
  Button,
  Field,
  Input,
  Modal,
  Segmented,
  Textarea,
} from "@/components/newsletter-composer/ui/primitives";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { Block, SavedTemplate } from "@/components/newsletter-composer/types/editor";
import { estimateReadingTime, formatClock } from "@/components/newsletter-composer/lib/utils";
import { TEMPLATES } from "@/components/newsletter-composer/templates/templates";
import { compileNewsletterToHtml } from "@/components/newsletter-composer/lib/compiler";

/* ------------------------------------------------------------------ *
 *  Read-only email rendering — uses the same compiler as send/publish
 * ------------------------------------------------------------------ */
function EmailPreview({
  blocks,
  dark,
  width = 680,
}: {
  blocks: Block[];
  dark: boolean;
  width?: number;
}) {
  const issue = useEditorStore((s) => s.doc.issue);
  const [dbData, setDbData] = React.useState<any>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = React.useState(800);

  React.useEffect(() => {
    fetch("/api/admin/newsletter/blocks")
      .then((r) => r.json())
      .then(setDbData)
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "email-preview-height" && typeof e.data.height === "number") {
        setIframeHeight(Math.max(e.data.height, 200));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const html = React.useMemo(() => {
    if (!blocks.length) return "";
    return compileNewsletterToHtml(
      { blocks, issue, style: {}, theme: "minimal" } as any,
      "#",
      dbData,
    );
  }, [blocks, issue, dbData]);

  return (
    <div className="mx-auto overflow-hidden rounded-[18px] border border-line" style={{ maxWidth: width }}>
      {html ? (
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="Email preview"
          className="w-full border-0"
          style={{ height: iframeHeight, background: "#FFFFFF", transition: "height 0.15s ease" }}
        />
      ) : (
        <div className="py-12 text-center text-[13px] text-ink-muted">
          This issue is empty. Add blocks to see the preview.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Preview
 * ------------------------------------------------------------------ */
function PreviewModal() {
  const { modal, closeModal } = useUI();
  const blocks = useEditorStore((s) => s.doc.blocks);
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop");

  return (
    <Modal
      open={modal === "preview"}
      onClose={closeModal}
      title="Preview"
      description={`${estimateReadingTime(blocks)} min read`}
      width="max-w-4xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-[12px] text-ink-muted">
            <Eye className="h-3.5 w-3.5" />
            {blocks.length} blocks rendered
          </div>
        </>
      }
    >
      <div className="bg-canvas p-5">
        <div className="mb-4 flex justify-center">
          <Segmented<"desktop" | "mobile">
            layoutId="preview-device"
            value={device}
            onChange={setDevice}
            items={[
              { value: "desktop", label: "Desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
              { value: "mobile", label: "Mobile", icon: <Smartphone className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>
        <EmailPreview
          blocks={blocks}
          dark={false}
          width={device === "desktop" ? 680 : 380}
        />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Test email
 * ------------------------------------------------------------------ */
const TEST_EMAIL_KEY = "nl_test_email";

function TestEmailModal() {
  const { modal, closeModal, toast } = useUI();
  const doc = useEditorStore((s) => s.doc);
  const docTitle = doc.title;
  const issue = doc.issue;

  const [storedEmail, setStoredEmail] = React.useState<string>("");
  const [editingConfig, setEditingConfig] = React.useState(false);
  const [configEmail, setConfigEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [note, setNote] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (modal === "test") {
      const email = typeof window !== "undefined" ? localStorage.getItem(TEST_EMAIL_KEY) ?? "" : "";
      setStoredEmail(email);
      setConfigEmail(email);
      setEditingConfig(!email.trim());
      setSubject(doc.subject || `${doc.title} — ${doc.issue}`);
      setNote("");
      setSent(false);
      setErrorMsg(null);
    }
  }, [modal, doc.subject, doc.title, doc.issue]);

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = configEmail.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    localStorage.setItem(TEST_EMAIL_KEY, clean);
    setStoredEmail(clean);
    setEditingConfig(false);
    setErrorMsg(null);
    toast("Test email recipient saved", "success");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedEmail.trim()) {
      setEditingConfig(true);
      return;
    }
    setSending(true);
    setErrorMsg(null);
    try {
      const dbData = await fetch("/api/admin/newsletter/blocks").then((r) => r.json()).catch(() => ({}));
      const html = compileNewsletterToHtml(doc, "test", dbData);
      const res = await fetch("/api/admin/newsletter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: storedEmail.trim(),
          subject: subject.trim() || `${docTitle} — ${issue}`,
          html,
          fallbackName: doc.fallbackName || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Brevo returned status ${res.status}`);
      }
      setSent(true);
      toast(`Test delivered to ${storedEmail} via Brevo`, "success");
    } catch (err: any) {
      const msg = err.message || "Failed to send test email";
      setErrorMsg(msg);
      toast(msg, "warn");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={modal === "test"}
      onClose={closeModal}
      title={editingConfig ? "Configure Test Email" : "Send Test Email"}
      description={
        editingConfig
          ? "Set your test email recipient. This connects to your newsletter settings."
          : "Deliver this issue to your verified inbox via Brevo before publishing."
      }
      width="max-w-lg"
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 px-6 py-12 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CircleCheck className="h-5 w-5" />
            </span>
            <p className="text-[15px] font-semibold text-ink">Test delivered via Brevo</p>
            <p className="max-w-[340px] text-[12.5px] leading-relaxed text-ink-muted">
              Delivered to <strong className="text-ink font-semibold">{storedEmail}</strong>. Check your inbox and spam folder in a few moments.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                Send another test
              </Button>
              <Button variant="primary" size="sm" onClick={closeModal}>
                Done
              </Button>
            </div>
          </motion.div>
        ) : editingConfig ? (
          <motion.form
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSaveEmail}
            className="space-y-4 px-5 py-5"
          >
            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Mail className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-ink">No test email address configured</p>
                <p className="text-ink-muted leading-relaxed">
                  Please specify which email address should receive test issues. This saves to your newsletter settings and connects with Brevo for all test previews.
                </p>
              </div>
            </div>

            {errorMsg ? (
              <div className="rounded-control border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            ) : null}

            <Field label="Test email address">
              <Input
                type="email"
                placeholder="you@example.com"
                value={configEmail}
                onChange={(e) => setConfigEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
              {storedEmail ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingConfig(false)}>
                  Cancel
                </Button>
              ) : (
                <p className="text-[11.5px] text-ink-muted">Saves to newsletter settings</p>
              )}
              <Button type="submit" variant="primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Save & Continue
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSend}
            className="space-y-4 px-5 py-5"
          >
            {errorMsg ? (
              <div className="rounded-control border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            ) : null}

            {/* Recipient card from settings */}
            <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-3.5 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="h-4 w-4 text-brand shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10.5px] uppercase font-semibold text-ink-muted tracking-wider">
                    Recipient (from Settings)
                  </div>
                  <div className="text-xs font-semibold text-ink truncate">
                    {storedEmail}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingConfig(true)}
                className="text-xs font-medium text-brand hover:underline shrink-0"
              >
                Change
              </button>
            </div>

            <Field label="Subject line">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                required
              />
            </Field>

            <Field label="Note to self" hint="Optional — not visible to subscribers.">
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Testing mobile rendering…"
              />
            </Field>

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-line">
              <p className="text-[11.5px] text-ink-muted">
                Direct Brevo SMTP test send. Doesn't affect subscribers.
              </p>
              <Button type="submit" variant="primary" disabled={sending}>
                <Send className="h-3.5 w-3.5" />
                {sending ? "Sending via Brevo…" : "Send test"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Publish
 * ------------------------------------------------------------------ */
function PublishModal() {
  const { modal, payload, closeModal, toast } = useUI();
  const doc = useEditorStore((s) => s.doc);
  const setStoreSubject = useEditorStore((s) => s.setSubject);
  const setStorePreviewText = useEditorStore((s) => s.setPreviewText);
  const docTitle = doc.title;
  const issue = doc.issue;
  const blocks = doc.blocks;

  const [mode, setMode] = React.useState<"now" | "schedule">("now");
  const [subject, setLocalSubject] = React.useState("");
  const [previewText, setLocalPreviewText] = React.useState("");
  const [scheduledFor, setScheduledFor] = React.useState<string>("");
  const [published, setPublished] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);
  const [resultInfo, setResultInfo] = React.useState<{ queued: number; scheduled: boolean } | null>(null);

  React.useEffect(() => {
    if (modal === "publish") {
      setPublished(false);
      setPublishError(null);
      setResultInfo(null);
      setMode(payload?.mode === "schedule" ? "schedule" : "now");
      setLocalSubject(doc.subject || docTitle || "The Sagar Lad Letter");
      setLocalPreviewText(doc.previewText || "");
      setScheduledFor("");
    }
  }, [modal, payload, doc.subject, doc.previewText, docTitle]);

  const handleSubjectChange = (val: string) => {
    setLocalSubject(val);
    setStoreSubject(val);
  };

  const handlePreviewTextChange = (val: string) => {
    setLocalPreviewText(val);
    setStorePreviewText(val);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setPublishError("A subject line is required");
      return;
    }
    if (mode === "schedule" && !scheduledFor) {
      setPublishError("Please choose a date and time to schedule this newsletter");
      return;
    }

    setPublishing(true);
    setPublishError(null);
    try {
      const dbData = await fetch("/api/admin/newsletter/blocks").then((r) => r.json()).catch(() => ({}));
      const html = compileNewsletterToHtml({
        ...doc,
        subject: subject.trim(),
        previewText: previewText.trim(),
      }, "test", dbData);
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          html,
          contentJson: {
            ...doc,
            subject: subject.trim(),
            previewText: previewText.trim(),
          },
          scheduledFor: mode === "schedule" ? scheduledFor : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Publish failed with status ${res.status}`);
      }
      setResultInfo({ queued: data.queued ?? 0, scheduled: !!data.scheduled });
      setPublished(true);
      toast(
        mode === "schedule" ? "Newsletter scheduled successfully" : "Issue queued for Brevo delivery",
        "success"
      );
    } catch (err: any) {
      const msg = err.message || "Failed to publish issue";
      setPublishError(msg);
      toast(msg, "warn");
    } finally {
      setPublishing(false);
    }
  };

  const formattedSchedule = scheduledFor
    ? new Date(scheduledFor).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Modal
      open={modal === "publish"}
      onClose={closeModal}
      title={mode === "schedule" ? "Schedule Newsletter" : "Publish Newsletter"}
      description={`${blocks.length} blocks · ${estimateReadingTime(blocks)} min read`}
      width="max-w-xl"
    >
      {published ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            {resultInfo?.scheduled ? <CalendarClock className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
          </span>
          <p className="text-[15px] font-semibold text-ink">
            {resultInfo?.scheduled ? "Newsletter Scheduled" : "Newsletter Queued for Delivery"}
          </p>
          <p className="max-w-[380px] text-[12.5px] leading-relaxed text-ink-muted">
            {resultInfo?.scheduled ? (
              <>
                “<strong className="text-ink">{subject}</strong>” is scheduled for{" "}
                <strong className="text-brand font-semibold">{formattedSchedule}</strong>. The 30-minute cron job will automatically initiate delivery.
              </>
            ) : (
              <>
                “<strong className="text-ink">{subject}</strong>” is being delivered via Brevo to{" "}
                <strong className="text-ink">{resultInfo?.queued ?? 0} active subscribers</strong> in chunks up to 300 emails/day.
              </>
            )}
          </p>
          <Badge tone="brand">
            <CircleCheck className="h-3 w-3" />
            {issue || "Issue Ready"}
          </Badge>
          <div className="flex items-center gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={closeModal}>
              Back to Editor
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closeModal();
                window.location.href = "/admin/newsletter";
              }}
            >
              View Campaigns
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
          {publishError ? (
            <div className="rounded-control border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {publishError}
            </div>
          ) : null}

          {/* Visual Live Inbox Preview Card */}
          <div className="rounded-xl border border-line bg-canvas p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <span>Live Inbox Appearance</span>
              <span className="text-[10px] text-ink-muted/70 font-normal">Gmail / Apple Mail</span>
            </div>

            <div className="rounded-lg border border-line bg-surface p-3 shadow-xs">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
                  <span className="text-xs font-bold text-ink truncate">Sagar Lad</span>
                  <span className="text-[11px] text-ink-muted hidden sm:inline">&lt;no-reply@sagarlad.com&gt;</span>
                </div>
                <span className="text-[11px] text-ink-muted shrink-0 tabular-nums">
                  {mode === "schedule" && scheduledFor
                    ? new Date(scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Just now"}
                </span>
              </div>

              <div className="mt-1 text-xs leading-snug">
                <span className="font-semibold text-ink">
                  {subject.trim() || "Subject line will appear here"}
                </span>
                <span className="text-ink-muted ml-1.5 font-normal">
                  {previewText.trim() ? `— ${previewText.trim()}` : "— (Preview snippet text will appear here…)"}
                </span>
              </div>
            </div>
          </div>

          <Field label="Subject line" hint="The main title recipients see in their inbox.">
            <Input
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="e.g. The Sagar Lad Letter — Issue 001"
              required
            />
          </Field>

          <Field label="Preview text" hint="The snippet shown directly next to the subject line in inboxes.">
            <Input
              value={previewText}
              onChange={(e) => handlePreviewTextChange(e.target.value)}
              placeholder="One idea, one framework, one case study…"
            />
          </Field>

          {/* Delivery Segmented Control */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-ink">Delivery Options</label>
            <Segmented<"now" | "schedule">
              layoutId="publish-delivery-tab"
              className="w-full"
              value={mode}
              onChange={(val) => setMode(val)}
              items={[
                { value: "now", label: "Send now", icon: <Rocket className="h-3.5 w-3.5" /> },
                { value: "schedule", label: "Schedule for later", icon: <CalendarClock className="h-3.5 w-3.5" /> },
              ]}
            />
          </div>

          {/* Custom SchedulePicker component from blog post form */}
          {mode === "schedule" && (
            <div className="space-y-2 rounded-xl border border-brand/20 bg-brand/5 p-3.5">
              <label className="block text-xs font-semibold text-ink">
                Schedule date & time
              </label>
              <SchedulePicker value={scheduledFor} onChange={setScheduledFor} />
              <p className="text-[11px] text-ink-muted">
                The 30-minute cron job will automatically publish and begin delivering when this time arrives.
              </p>
            </div>
          )}

          {/* Brevo chunking notification */}
          <div className="rounded-xl border border-line bg-canvas p-3 flex items-start gap-2.5">
            <CalendarClock className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <div className="text-[11.5px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">Brevo 300 emails/day quota chunking:</span> Deliveries are automatically batched. If your active subscriber list exceeds the 300/day limit, remaining deliveries stay safely queued and automatically resume sending on the next day's cron runs.
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <Button variant="outline" size="sm" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={publishing}>
              {mode === "schedule" ? (
                <>
                  <CalendarClock className="h-3.5 w-3.5" />
                  {publishing ? "Scheduling…" : "Schedule Newsletter"}
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  {publishing ? "Dispatching…" : "Publish & Send Now"}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  History
 * ------------------------------------------------------------------ */
function HistoryModal() {
  const { modal, closeModal, toast } = useUI();
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const blocks = useEditorStore((s) => s.doc.blocks);

  const snapshots = [...past].reverse();

  return (
    <Modal
      open={modal === "history"}
      onClose={closeModal}
      title="Version history"
      description={`${past.length} earlier versions · ${future.length} redoable`}
      width="max-w-lg"
      footer={
        <>
          <span className="text-[11.5px] text-ink-muted">
            Restoring steps the document back; you can always redo.
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!future.length}
              onClick={() => {
                redo();
                toast("Redone");
              }}
            >
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={closeModal}>
              Close
            </Button>
          </div>
        </>
      }
    >
      <div className="divide-y divide-line">
        <div className="flex items-center justify-between gap-3 bg-brand-50/40 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-brand" />
            <div>
              <p className="text-[13px] font-semibold text-ink">Current version</p>
              <p className="text-[11.5px] text-ink-muted">
                {blocks.length} blocks · just now
              </p>
            </div>
          </div>
          <Badge tone="brand">Live</Badge>
        </div>

        {snapshots.length ? (
          snapshots.map((snapshot, index) => (
            <div
              key={`${snapshot.updatedAt}-${index}`}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-ink-muted" />
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    {index === 0 ? "1 step back" : `${index + 1} steps back`}
                  </p>
                  <p className="text-[11.5px] text-ink-muted">
                    {snapshot.blocks.length} blocks ·{" "}
                    {formatClock(snapshot.updatedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  for (let step = 0; step <= index; step += 1) undo();
                  toast(`Restored ${index + 1} step${index ? "s" : ""} back`);
                  closeModal();
                }}
              >
                <Undo2 className="h-3.5 w-3.5" />
                Restore
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <History className="h-5 w-5 text-ink-muted" />
            <p className="text-[13px] font-medium text-ink">No changes yet</p>
            <p className="text-[12px] text-ink-muted">
              Edit a block and versions will start appearing here.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Save as template
 * ------------------------------------------------------------------ */
function SaveTemplateModal() {
  const { modal, closeModal, toast } = useUI();
  const saveAsTemplate = useEditorStore((s) => s.saveAsTemplate);
  const updateSavedTemplate = useEditorStore((s) => s.updateSavedTemplate);
  const savedTemplates = useEditorStore((s) => s.savedTemplates);
  const blocks = useEditorStore((s) => s.doc.blocks);
  const docTitle = useEditorStore((s) => s.doc.title);
  const [name, setName] = React.useState(docTitle || "");
  const [showDuplicateWarning, setShowDuplicateWarning] = React.useState(false);
  const [duplicateTemplate, setDuplicateTemplate] = React.useState<SavedTemplate | null>(null);

  // Check for duplicate template with same name and similar content
  const checkDuplicate = (templateName: string) => {
    const existing = savedTemplates.find((t) => t.name.toLowerCase() === templateName.toLowerCase());
    if (!existing) return null;
    // Compare blocks content (simplified comparison)
    const currentBlocksStr = JSON.stringify(blocks.map((b) => ({ type: b.type, data: b.data })));
    const existingBlocksStr = JSON.stringify(existing.blocks.map((b) => ({ type: b.type, data: b.data })));
    if (currentBlocksStr === existingBlocksStr) {
      return existing;
    }
    return null;
  };

  const handleSave = () => {
    const trimmedName = name.trim() || "Untitled template";
    const duplicate = checkDuplicate(trimmedName);
    if (duplicate) {
      setDuplicateTemplate(duplicate);
      setShowDuplicateWarning(true);
      return;
    }
    saveAsTemplate(trimmedName);
    toast("Template saved", "success");
    closeModal();
  };

  const handleUpdateExisting = () => {
    if (duplicateTemplate) {
      updateSavedTemplate(duplicateTemplate.id, duplicateTemplate.name);
      toast(`${duplicateTemplate.name} updated`, "success");
      closeModal();
    }
  };

  return (
    <Modal
      open={modal === "save-template"}
      onClose={closeModal}
      title={showDuplicateWarning ? "Template already exists" : "Save as template"}
      description={
        showDuplicateWarning
          ? `A template named "${duplicateTemplate?.name}" with identical content already exists.`
          : `${blocks.length} blocks will be stored as a reusable template.`
      }
      width="max-w-md"
    >
      <div className="space-y-4 px-5 py-5">
        {!showDuplicateWarning ? (
          <Field label="Template name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Issue #12"
              autoFocus
              className="w-full rounded-control border border-line bg-canvas px-3 py-2 text-[13px] font-medium text-ink outline-none placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </Field>
        ) : null}
        <p className="rounded-control border border-line bg-canvas px-3 py-2 text-[11.5px] text-ink-muted">
          {showDuplicateWarning
            ? "Choose to update the existing template or save as a new version."
            : "Templates keep every block's content, style and settings. Find it later under Templates → Your templates."}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => { setShowDuplicateWarning(false); setDuplicateTemplate(null); }}>
            {showDuplicateWarning ? "Back" : "Cancel"}
          </Button>
          {showDuplicateWarning ? (
            <>
              <Button variant="outline" type="button" onClick={handleUpdateExisting}>
                <RefreshCw className="h-3.5 w-3.5" />
                Update existing
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  // Force save as new template with a modified name
                  const newName = `${name.trim()} (copy)`;
                  saveAsTemplate(newName);
                  toast("Template saved as copy", "success");
                  closeModal();
                }}
              >
                <Bookmark className="h-3.5 w-3.5" />
                Save as copy
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={handleSave}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Save template
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Template preview
 * ------------------------------------------------------------------ */
function TemplatePreviewModal() {
  const { modal, payload, closeModal, toast } = useUI();
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const markTemplateUsed = useEditorStore((s) => s.markTemplateUsed);
  const template = payload as
    | (typeof TEMPLATES)[number]
    | undefined;
  const rawSource = payload as
    | { blocks?: Block[]; name?: string; id?: unknown }
    | undefined;

  const blocks = React.useMemo(
    () => {
      if (template) return template.blocks();
      if (rawSource?.blocks) return rawSource.blocks;
      return [];
    },
    [template, rawSource],
  );

  if (!template && !rawSource) return null;

  const metaName = template?.name ?? rawSource?.name ?? "Template";
  const metaDescription = template?.description ?? rawSource?.name ?? "";
  const metaKind = template?.kind ?? "curated";
  const metaReadingTime =
    template?.readingTime ??
    (rawSource && "readingTime" in rawSource
      ? (rawSource as { readingTime?: number }).readingTime ?? 0
      : 0);

  return (
    <Modal
      open={modal === "template-preview"}
      onClose={closeModal}
      title={metaName}
      description={metaDescription}
      width="max-w-3xl"
      footer={
        <>
          <div className="flex items-center gap-2">
            <Badge tone={metaKind === "original" ? "brand" : metaKind === "saved" ? "accent" : "neutral"}>
              {metaKind === "original"
                ? "Original"
                : metaKind === "saved"
                  ? "Your template"
                  : "Curated"}
            </Badge>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-muted">
              <Clock className="h-3 w-3" />
              {template ? template.readingTime : metaReadingTime} min read
            </span>
            <span className="text-[11.5px] text-ink-muted">
              · {blocks.length} blocks
            </span>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              if (template) {
                applyTemplate(template, template.name);
                markTemplateUsed(template.id);
              } else if (rawSource?.blocks) {
                applyTemplate(rawSource, rawSource.name);
              }
              toast(`${metaName} applied`, "success");
              closeModal();
            }}
          >
            Use this template
          </Button>
        </>
      }
    >
      <div className="bg-canvas p-5">
        <EmailPreview blocks={blocks} dark={false} width={640} />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Shortcuts
 * ------------------------------------------------------------------ */
const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘K", label: "Command menu" },
  { keys: "/", label: "Quick insert menu" },
  { keys: "⌘Z", label: "Undo" },
  { keys: "⇧⌘Z", label: "Redo" },
  { keys: "⌘S", label: "Force save" },
  { keys: "⌘D", label: "Duplicate selected block" },
  { keys: "⌫", label: "Delete selected block" },
  { keys: "⌘↑ / ⌘↓", label: "Select previous / next block" },
  { keys: "⇧⌘P", label: "Preview issue" },
  { keys: "Esc", label: "Deselect block" },
];

function ShortcutsModal() {
  const { modal, closeModal } = useUI();
  return (
    <Modal
      open={modal === "shortcuts"}
      onClose={closeModal}
      title="Keyboard shortcuts"
      description="Everything in the composer has a shortcut."
      width="max-w-md"
    >
      <div className="divide-y divide-line">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.keys}
            className="flex items-center justify-between px-5 py-2.5"
          >
            <span className="text-[13px] text-ink-soft">{shortcut.label}</span>
            <kbd className="rounded-[8px] border border-line bg-canvas px-2 py-1 font-mono text-[11px] text-ink">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 *  Root renderer
 * ------------------------------------------------------------------ */
export function EditorModals() {
  return (
    <>
      <PreviewModal />
      <TestEmailModal />
      <PublishModal />
      <HistoryModal />
      <SaveTemplateModal />
      <TemplatePreviewModal />
      <ShortcutsModal />
    </>
  );
}
