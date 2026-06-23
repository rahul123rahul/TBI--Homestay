import React from "react";

export function Loader({
  variant = "spinner", // 'spinner' | 'skeleton'
  size = "md", // 'sm' | 'md' | 'lg' (for spinner)
  className = "",
  label = "",
  skeletonType = "line", // 'line' | 'card' | 'circle' (for skeleton)
  count = 1, // number of lines/elements for skeleton
  ...props
}) {
  if (variant === "skeleton") {
    const renders = Array.from({ length: count });
    
    return (
      <div className={`w-full space-y-3 animate-pulse ${className}`} {...props}>
        {renders.map((_, i) => (
          <React.Fragment key={i}>
            {skeletonType === "circle" && (
              <div className="h-12 w-12 rounded-full bg-muted border border-border/20 dark:bg-muted/80" />
            )}
            {skeletonType === "line" && (
              <div className="space-y-2 w-full">
                <div className="h-4 bg-muted border border-border/20 dark:bg-muted/80 rounded-xl w-3/4" />
                <div className="h-3.5 bg-muted/70 border border-border/10 dark:bg-muted/60 rounded-xl w-full" />
              </div>
            )}
            {skeletonType === "card" && (
              <div className="w-full rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted dark:bg-muted/80" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-muted dark:bg-muted/80 rounded w-1/3" />
                    <div className="h-2.5 bg-muted/60 dark:bg-muted/50 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted dark:bg-muted/80 rounded w-full" />
                  <div className="h-3 bg-muted dark:bg-muted/80 rounded w-5/6" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Spinner variant sizing
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      {...props}
    >
      <div
        className={`animate-spin rounded-full border-solid border-current border-t-transparent ${spinnerSize}`}
        role="status"
        aria-label="Loading"
      />
      {label && (
        <span className="text-xs font-semibold animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
