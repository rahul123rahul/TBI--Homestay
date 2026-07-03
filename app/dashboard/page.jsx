"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Loader, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { API_URL } from "@/lib/config";

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [stats, setStats] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [themeCounts, setThemeCounts] = useState([]);
  const [sentiments, setSentiments] = useState({ Positive: 0, Neutral: 0, Negative: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Authorization checking and backend fetch
  useEffect(() => {
    const loggedIn = localStorage.getItem("isStaffLoggedIn") === "true";
    setIsAuthorized(loggedIn);

    if (!loggedIn) {
      // Start countdown to redirect
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      const fetchTelemetry = async () => {
        try {
          const statsRes = await fetch(`${API_URL}/api/reviews/stats`);
          if (!statsRes.ok) throw new Error(`Stats endpoint responded with status ${statsRes.status}`);
          const statsData = await statsRes.json();

          const reviewsRes = await fetch(`${API_URL}/api/reviews`);
          if (!reviewsRes.ok) throw new Error(`Reviews endpoint responded with status ${reviewsRes.status}`);
          const reviewsData = await reviewsRes.json();

          if (statsData.success && reviewsData.success) {
            setStats(statsData.stats);
            setThemeCounts(statsData.themeCounts);
            setSentiments(statsData.sentiments);
            setRecentReviews(reviewsData.data);
          } else {
            throw new Error("Invalid API response format");
          }
        } catch (error) {
          console.error("Failed to load telemetry:", error);
          toast.error(`Telemetry error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTelemetry();
    }
  }, [router]);

  // Loading state
  if (isAuthorized === null || (isAuthorized && isLoading)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10 min-h-[50vh]">
        <Loader variant="spinner" size="lg" label={isAuthorized === null ? "Verifying staff credentials..." : "Loading telemetry from backend..."} />
      </div>
    );
  }

  // Access Denied state
  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-muted/10 min-h-[60vh]">
        <div className="w-full max-w-md bg-card border border-red-200 dark:border-red-900/30 rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-8 w-8"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-red-800 dark:text-red-400">Access Denied</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The telemetry dashboard is restricted to authorized Trishul Eco-Homestays staff members only.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              Redirecting to Login Portal in <span className="font-bold text-sm text-red-800 dark:text-red-300">{countdown}s</span>...
            </p>
          </div>

          <Button
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  const maxSent = Math.max(sentiments.Positive || 0, sentiments.Neutral || 0, sentiments.Negative || 0, 1);
  const posHeight = `${((sentiments.Positive || 0) / maxSent) * 75 + 15}%`;
  const neutHeight = `${((sentiments.Neutral || 0) / maxSent) * 75 + 15}%`;
  const negHeight = `${((sentiments.Negative || 0) / maxSent) * 75 + 15}%`;

  // Render Authorized Dashboard
  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time insights and satisfaction telemetry for Trishul Eco-Homestays.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.name}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
            <p className="mt-2 text-xs font-medium text-accent">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sentiment Distribution SVG Chart */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold tracking-tight text-primary">Sentiment Trends</h2>
          <p className="text-xs text-muted-foreground">Weekly distribution of Positive, Neutral, and Negative reviews.</p>
          
          <div className="mt-6 h-64 w-full flex items-end justify-between gap-4 px-2">
            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <div className="w-full bg-green-100 dark:bg-green-950/40 rounded-t-lg flex flex-col justify-end overflow-hidden" style={{ height: posHeight }}>
                <div className="bg-primary/80 h-full w-full rounded-t-lg transition-all hover:bg-primary" />
              </div>
              <span className="mt-2 text-xs font-semibold text-primary">Positive</span>
              <span className="text-[10px] text-muted-foreground">{sentiments.Positive || 0} reviews</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <div className="w-full bg-yellow-100 dark:bg-yellow-950/40 rounded-t-lg flex flex-col justify-end overflow-hidden" style={{ height: neutHeight }}>
                <div className="bg-amber-500/80 h-full w-full rounded-t-lg transition-all hover:bg-amber-500" />
              </div>
              <span className="mt-2 text-xs font-semibold text-primary">Neutral</span>
              <span className="text-[10px] text-muted-foreground">{sentiments.Neutral || 0} reviews</span>
            </div>

            <div className="flex-1 flex flex-col items-center h-full justify-end">
              <div className="w-full bg-red-100 dark:bg-red-950/40 rounded-t-lg flex flex-col justify-end overflow-hidden" style={{ height: negHeight }}>
                <div className="bg-red-500/80 h-full w-full rounded-t-lg transition-all hover:bg-red-500" />
              </div>
              <span className="mt-2 text-xs font-semibold text-primary">Negative</span>
              <span className="text-[10px] text-muted-foreground">{sentiments.Negative || 0} reviews</span>
            </div>
          </div>
        </div>

        {/* Theme Distribution Column */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-primary">Key Guest Themes</h2>
            <p className="text-xs text-muted-foreground">Main topics mentioned in review text over the past month.</p>
            
            <div className="mt-6 space-y-4">
              {themeCounts.map((theme) => (
                <div key={theme.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-primary">{theme.name}</span>
                    <span className="text-muted-foreground">{theme.count} mentions ({theme.percentage})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: theme.percentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold tracking-tight text-primary">Recently Processed Reviews</h2>
        <p className="text-xs text-muted-foreground">Historical records of classified feedback logs.</p>
        
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/65 text-primary font-semibold">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 w-1/2">Review Text</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Theme</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentReviews.map((rev, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors align-middle">
                  <td className="px-4 py-3.5 text-muted-foreground font-medium">{rev.date}</td>
                  <td className="px-4 py-3.5 text-primary font-medium">{rev.source}</td>
                  <td className="px-4 py-3.5 text-muted-foreground italic">"{rev.text}"</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        rev.sentiment === "Positive"
                          ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                          : rev.sentiment === "Neutral"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                      }`}
                    >
                      {rev.sentiment}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-primary font-semibold">#{rev.theme.toLowerCase()}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(rev);
                        setIsModalOpen(true);
                      }}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Inspection Detail"
      >
        {selectedReview && (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Original Guest Feedback</span>
              <p className="mt-1 text-xs italic text-foreground bg-muted border border-border/40 p-4 rounded-xl">
                "{selectedReview.text}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Sentiment Tag</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedReview.sentiment === "Positive"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                        : selectedReview.sentiment === "Neutral"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {selectedReview.sentiment}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Identified Theme</span>
                <p className="mt-1 text-sm font-semibold text-primary dark:text-primary-foreground">
                  #{selectedReview.theme.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Source Channel</span>
                <p className="mt-1 text-xs font-semibold text-primary dark:text-primary-foreground">{selectedReview.source}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Submission Date</span>
                <p className="mt-1 text-xs font-semibold text-primary dark:text-primary-foreground">{selectedReview.date}</p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">AI response recommendation</span>
              <p className="mt-2 text-xs font-medium text-foreground bg-primary/5 dark:bg-primary/20 border border-primary/10 p-4 rounded-xl leading-relaxed">
                {selectedReview.response || "No suggested response template."}
              </p>
            </div>

            <div className="flex gap-3 border-t border-border/60 pt-6">
              <Button
                variant="primary"
                className="flex-1 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(selectedReview.response || "");
                  toast.success("Copied suggested response to clipboard!");
                }}
              >
                Copy Response
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => {
                  setIsModalOpen(false);
                  router.push(`/dashboard/review/${selectedReview.id}`);
                }}
              >
                Open Workspace Detail
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
