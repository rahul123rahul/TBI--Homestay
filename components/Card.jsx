import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Card({
  title,
  description,
  image,
  icon,
  actionText,
  actionHref,
  onClick,
  badgeText,
  badgeType = "default",
}) {
  const getBadgeClasses = () => {
    switch (badgeType) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "accent":
        return "bg-accent/15 text-accent border border-accent/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-primary/20">
      <div>
        {/* Card Image if provided */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            {/* Title & Optional Icon */}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </div>
              )}
              <h3 className="text-lg font-bold tracking-tight text-primary">
                {title}
              </h3>
            </div>
            
            {/* Optional Badge */}
            {badgeText && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getBadgeClasses()}`}>
                {badgeText}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Optional Card Action */}
      {(actionText && (actionHref || onClick)) && (
        <div className="border-t border-border px-6 py-4 bg-muted/40">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent group/btn"
            >
              {actionText}
              <svg
                className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={onClick}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent group/btn"
            >
              {actionText}
              <svg
                className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
