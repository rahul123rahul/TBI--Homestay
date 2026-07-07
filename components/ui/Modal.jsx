"use client";

import React, { useEffect, useRef } from "react";

export function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep ref updated to avoid stale closure in event listener
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus Trapping and Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore later
    previousFocus.current = document.activeElement;

    // Disable body scroll when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Select all focusable elements
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleKeyDown = (e) => {
      // Close on Escape key
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll(focusableSelector)
        );
        
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: Wrap back to the end
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: Wrap to the start
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus the modal container or the first focusable element initially
    if (modalRef.current) {
      const focusables = modalRef.current.querySelectorAll(focusableSelector);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore focus to the element that was focused before modal opened
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card border border-border text-foreground p-6 shadow-2xl transition-all scale-100 flex flex-col max-h-[85vh] animate-scaleIn focus:outline-none"
      >
        {/* Top accent slice */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4 mt-2">
          <h2
            id="modal-title"
            className="text-lg font-bold tracking-tight text-primary dark:text-primary-foreground"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-primary transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto text-sm text-muted-foreground pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
