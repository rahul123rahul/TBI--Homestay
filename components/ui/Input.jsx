import React from "react";

export function Input({
  label,
  placeholder = "",
  type = "text",
  value = "",
  onChange,
  error = "",
  className = "",
  id,
  required = false,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-primary dark:text-primary-foreground"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary shadow-inner
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-border focus:border-primary focus:ring-primary/20 dark:border-border/80"
          }
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-600 dark:text-red-400 mt-0.5 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}
