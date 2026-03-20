"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/lib/store";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-2",
            {
              "bg-green-50 border-green-200": toast.type === "success",
              "bg-red-50 border-red-200": toast.type === "error",
              "bg-blue-50 border-blue-200": toast.type === "info",
              "bg-yellow-50 border-yellow-200": toast.type === "warning",
            }
          )}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
