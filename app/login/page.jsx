"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // If already logged in, redirect to dashboard immediately
  useEffect(() => {
    if (localStorage.getItem("isStaffLoggedIn") === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);

    // Simulate login response
    setTimeout(() => {
      setIsSubmitting(false);
      localStorage.setItem("isStaffLoggedIn", "true");
      // Notify other components (like Navbar) about login status change
      window.dispatchEvent(new Event("auth-change"));
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Top green accent gradient slice */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-6 w-6"
            >
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Staff Portal Access</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sign in to access Trishul Eco-Homestays review classifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-primary mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@trishulecohomestays.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-primary">
                Secret Access Key
              </label>
              <a href="#" className="text-[10px] font-semibold text-accent hover:underline">
                Forgot Key?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
