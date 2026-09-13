"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";

export type ModalKind =
  | "preview"
  | "test"
  | "history"
  | "publish"
  | "template-preview"
  | "shortcuts"
  | "save-template"
  | "mobile-blocks"
  | "mobile-inspector"
  | null;

export interface ToastItem {
  id: number;
  message: string;
  tone: "info" | "success" | "warn";
}

interface UIContextValue {
  modal: ModalKind;
  payload: any;
  openModal: (kind: ModalKind, payload?: any) => void;
  closeModal: () => void;
  toast: (message: string, tone?: ToastItem["tone"]) => void;
}

const UIContext = React.createContext<UIContextValue | null>(null);

export function useUI() {
  const ctx = React.useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}

const TONE_ICON = {
  info: Info,
  success: CircleCheck,
  warn: TriangleAlert,
};

const TONE_STYLE = {
  info: "border-line bg-surface text-ink",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
};

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = React.useState<ModalKind>(null);
  const [payload, setPayload] = React.useState<any>(undefined);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const openModal = React.useCallback((kind: ModalKind, nextPayload?: any) => {
    setPayload(nextPayload);
    setModal(kind);
  }, []);

  const closeModal = React.useCallback(() => setModal(null), []);

  const toast = React.useCallback(
    (message: string, tone: ToastItem["tone"] = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 2600);
    },
    [],
  );

  const value = React.useMemo(
    () => ({ modal, payload, openModal, closeModal, toast }),
    [modal, payload, openModal, closeModal, toast],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((item) => {
            const Icon = TONE_ICON[item.tone];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-medium shadow-lift ${TONE_STYLE[item.tone]}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </UIContext.Provider>
  );
}

/** Small inline dismiss button used by modals rendered inside the provider. */
export function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-1 text-ink-muted transition hover:bg-black/5 hover:text-ink"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
