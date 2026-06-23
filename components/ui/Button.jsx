import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  // Base classes for a premium button with nice transitions
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  // Variant classes
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
    secondary:
      "bg-muted text-primary hover:bg-muted/80 border border-border/40 dark:bg-muted dark:text-primary-foreground dark:hover:bg-muted/80",
    outline:
      "bg-transparent border border-border text-primary hover:bg-muted/40 dark:border-border dark:text-primary-foreground dark:hover:bg-muted/20",
  };

  // Size classes
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
