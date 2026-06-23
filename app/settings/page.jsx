"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
  const router = useRouter();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [signature, setSignature] = useState("Warm regards, Trishul Eco-Homestays Team");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [minConfidence, setMinConfidence] = useState(70);
  const [autoApprove, setAutoApprove] = useState(false);

  // Authorization check
  useEffect(() => {
    const loggedIn = localStorage.getItem("isStaffLoggedIn") === "true";
    setIsAuthorized(loggedIn);
    if (!loggedIn) {
      router.push("/login");
    }

    // Load saved settings if any
    const savedSignature = localStorage.getItem("settings_signature");
    if (savedSignature) setSignature(savedSignature);

    const savedModel = localStorage.getItem("settings_model");
    if (savedModel) setSelectedModel(savedModel);

    const savedConfidence = localStorage.getItem("settings_confidence");
    if (savedConfidence) setMinConfidence(parseInt(savedConfidence, 10));

    const savedAutoApprove = localStorage.getItem("settings_auto_approve");
    if (savedAutoApprove) setAutoApprove(savedAutoApprove === "true");
  }, [router]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("settings_signature", signature);
    localStorage.setItem("settings_model", selectedModel);
    localStorage.setItem("settings_confidence", minConfidence.toString());
    localStorage.setItem("settings_auto_approve", autoApprove.toString());
    
    toast.success("Settings saved successfully!");
  };

  if (isAuthorized === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-muted-foreground">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">System Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure classification preferences, response parameters, and user interfaces.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8 divide-y divide-border/60">
        
        {/* Visual Theme Selection Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-primary dark:text-primary-foreground">Interface Aesthetics</h2>
          <p className="text-xs text-muted-foreground">Select your preferred viewing mode for the Trishul administrative workspace.</p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all cursor-pointer hover:border-primary/50
                ${
                  theme === "light"
                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground"
                }
              `}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border text-amber-500 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Light Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all cursor-pointer hover:border-primary/50
                ${
                  theme === "dark"
                    ? "bg-primary/5 border-primary text-primary dark:text-primary-foreground shadow-sm"
                    : "bg-card border-border text-muted-foreground"
                }
              `}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-900 text-amber-500 shadow-sm">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Dark Theme</span>
            </button>
          </div>
        </div>

        {/* AI & Response Model Parameters */}
        <div className="space-y-6 pt-8">
          <div>
            <h2 className="text-lg font-bold text-primary dark:text-primary-foreground">AI Engine Customization</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Control the underlying model parameters and thresholds used in classification.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="model-select" className="text-xs font-semibold text-primary dark:text-primary-foreground">
                Active LLM Model
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Optimized Speed)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Reasoning)</option>
                <option value="heuristics-local">Local Heuristics Engine (Mock Offline)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="confidence-slider" className="text-xs font-semibold text-primary dark:text-primary-foreground">
                  Minimum Confidence Level
                </label>
                <span className="text-xs font-bold text-accent">{minConfidence}%</span>
              </div>
              <input
                id="confidence-slider"
                type="range"
                min="50"
                max="95"
                step="5"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value, 10))}
                className="w-full accent-primary mt-3 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground block mt-1">Reviews tagged below this value require manual verification overrides.</span>
            </div>
          </div>

          <Input
            id="signature"
            label="Default Response Signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="e.g. Sincerely, Caretakers"
          />

          <div className="flex items-start gap-3 mt-4">
            <input
              id="auto-approve"
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary cursor-pointer"
            />
            <div className="space-y-0.5">
              <label htmlFor="auto-approve" className="text-xs font-semibold text-primary dark:text-primary-foreground cursor-pointer select-none">
                Enable Auto-Approve Suggestion
              </label>
              <p className="text-[10px] text-muted-foreground leading-normal">
                If checked, responses classified with high confidence (+90%) will automatically be marked ready for clipboard without reviewing.
              </p>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-8 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
          >
            Save Configurations
          </Button>
        </div>
      </form>
    </div>
  );
}
