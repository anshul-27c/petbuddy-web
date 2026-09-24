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
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-field bg-ink px-4 py-3 text-surface shadow-float"
          >
            <span
              className={cn(
                "mt-0.5 shrink-0",
                toast.tone === "error" ? "text-alert-soft" : toast.tone === "info" ? "text-sky" : "text-trail-soft",
              )}
              aria-hidden
            >
              {toast.tone === "error" ? (
                <CircleAlert className="size-5" />
              ) : toast.tone === "info" ? (
                <Info className="size-5" />
              ) : (
                <CircleCheck className="size-5" />
              )}
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.body ? <p className="mt-0.5 text-surface/80">{toast.body}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
