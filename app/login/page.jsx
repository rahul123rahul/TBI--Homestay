"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const toast = useToast();

  // If already logged in, redirect to appropriate dashboard immediately
  useEffect(() => {
    if (localStorage.getItem("isStaffLoggedIn") === "true") {
      const role = localStorage.getItem("userRole");
      if (role === "Owner") {
        router.push("/dashboard/owner");
      } else if (role === "Admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setError("");

    // Simulate login response with authentication validation
    setTimeout(() => {
      if (email === "staff@trishul.com" && password === "staff123") {
        setIsSubmitting(false);
        localStorage.setItem("isStaffLoggedIn", "true");
        localStorage.setItem("userRole", "Staff");
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome back, staff member!");
        router.push("/dashboard");
      } else if (email === "owner@trishul.com" && password === "owner123") {
        setIsSubmitting(false);
        localStorage.setItem("isStaffLoggedIn", "true");
        localStorage.setItem("userRole", "Owner");
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome, Devendra Singh (Owner)!");
        router.push("/dashboard/owner");
      } else if (email === "admin@trishul.com" && password === "admin123") {
        setIsSubmitting(false);
        localStorage.setItem("isStaffLoggedIn", "true");
        localStorage.setItem("userRole", "Admin");
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome to Admin Console!");
        router.push("/dashboard/admin");
      } else {
        setIsSubmitting(false);
        setError("Invalid email address or access key. Access denied.");
        toast.error("Access Denied: Invalid email or key.");
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-background via-muted/30 to-background dark:from-background dark:via-muted/10 dark:to-background">
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
          <h2 className="text-2xl font-bold tracking-tight text-primary dark:text-primary-foreground">Staff Portal Access</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Sign in to access Trishul Eco-Homestays review classifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-xl p-3 text-left animate-shake">
              <span className="font-semibold">Authentication failed: </span>
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@trishul.com"
          />

          <div className="relative">
            <div className="absolute right-0 top-0 z-10">
              <a href="#" className="text-[10px] font-semibold text-accent hover:underline">
                Forgot Key?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              label="Secret Access Key"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2"
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
          </Button>
        </form>
      </div>
    </div>
  );
}

