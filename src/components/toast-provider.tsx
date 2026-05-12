"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(() => {
    const showToast = (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const duration = tone === "error" ? 4600 : tone === "success" ? 2600 : 3400;
      setToasts((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
    };

    return { showToast };
  }, []);

  useEffect(() => {
    return () => setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto border px-4 py-3 text-xs tracking-[0.12em] shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur ${
              toast.tone === "success"
                ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-50"
                : toast.tone === "error"
                ? "border-red-500/40 bg-red-950/95 text-red-50"
                : "border-zinc-700 bg-zinc-950/95 text-zinc-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  {toast.tone === "success" ? "Success" : toast.tone === "error" ? "Error" : "Info"}
                </p>
                <p className="mt-1 leading-5 text-sm tracking-[0.08em] normal-case">{toast.message}</p>
              </div>
              <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${toast.tone === "success" ? "bg-emerald-400" : toast.tone === "error" ? "bg-red-400" : "bg-white"}`} />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}