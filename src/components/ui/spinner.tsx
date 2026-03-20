"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Spinner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn("animate-spin", className)}
      {...props}
    >
      <Loader2 className="h-4 w-4" />
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = "Spinner";

export { Spinner };
