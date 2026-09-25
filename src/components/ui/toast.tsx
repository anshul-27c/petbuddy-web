"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "error";

interface ToastInput {
  title: string;
  body?: string;
  tone?: ToastTone;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

const ICONS: Record<ToastTone, ReactNode> = {
  success: <CircleCheck className="size-5" />,
  info: <Info className="size-5" />,
  error: <CircleAlert className="size-5" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 pb-[env(safe-area-inset-bottom)]"
      >
        {toasts.map((toast) => {
          const tone = toast.tone ?? "success";
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full max-w-sm animate-rise-in items-start gap-3 rounded-card border border-surface/10 bg-ink/95 p-4 text-surface shadow-float backdrop-blur"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  tone === "error" && "bg-alert/25 text-alert-soft",
                  tone === "info" && "bg-leash/30 text-sky",
                  tone === "success" && "bg-trail/35 text-trail-soft",
                )}
                aria-hidden
              >
                {ICONS[tone]}
              </span>
              <div className="min-w-0 pt-1 text-sm">
                <p className="font-semibold">{toast.title}</p>
                {toast.body ? <p className="mt-1 text-surface/80">{toast.body}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
