"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Loader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

// Mock review data matching the dashboard logs
const mockReviews = {
  "1": {
    id: "1",
    date: "June 18, 2026",
    source: "Airbnb",
    text: "The Himalayan peaks were visible right from the wooden balcony! Exceeded expectations.",
    sentiment: "Positive",
    theme: "Location",
    score: 95,
  },
  "2": {
    id: "2",
    date: "June 17, 2026",
    source: "Booking.com",
    text: "Food was highly delicious and fresh, but room cleaning was done late in the afternoon.",
    sentiment: "Neutral",
    theme: "Food",
    score: 72,
  },
  "3": {
    id: "3",
    date: "June 15, 2026",
    source: "Google",
    text: "The hosts treated us like their own family. Extremely warm gestures and local insights.",
    sentiment: "Positive",
    theme: "Host",
    score: 98,
  },
  "4": {
    id: "4",
    date: "June 14, 2026",
    source: "Airbnb",
    text: "Water heater wasn't working on the first day, took several hours to fix.",
    sentiment: "Negative",
    theme: "Cleanliness",
    score: 41,
  },
};

export default function ReviewDetail({ params }) {
  const router = useRouter();
  const toast = useToast();
  
  // Resolve params using React.use() for Next.js App Router rules
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isAuthorized, setIsAuthorized] = useState(null);
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interactive Overrides state
  const [sentiment, setSentiment] = useState("");
  const [theme, setTheme] = useState("");
  const [draftResponse, setDraftResponse] = useState("");
  const [appendSignature, setAppendSignature] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [promptOverride, setPromptOverride] = useState("");

  const defaultSignature = "Warm regards, Trishul Eco-Homestays Team";

  // Fetch individual review from backend
  useEffect(() => {
    const loggedIn = localStorage.getItem("isStaffLoggedIn") === "true";
    setIsAuthorized(loggedIn);
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    const fetchReview = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Review record not found in database.");
            router.push("/dashboard");
            return;
          }
          throw new Error(`Server responded with status ${res.status}`);
        }
        const resData = await res.json();
        if (resData.success) {
          setReview(resData.data);
          setSentiment(resData.data.sentiment);
          setTheme(resData.data.theme);
          setDraftResponse(resData.data.response || "");
        } else {
          throw new Error(resData.error || "Failed to load review details.");
        }
      } catch (err) {
        console.error("Fetch Review Error:", err);
        toast.error(`Error loading review: ${err.message}`);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [id, router]);

  const saveReviewChanges = async (updatedFields) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setReview(data.data);
        if (updatedFields.sentiment) setSentiment(data.data.sentiment);
        if (updatedFields.theme) setTheme(data.data.theme);
        if (updatedFields.response !== undefined) setDraftResponse(data.data.response);
      }
    } catch (err) {
      console.error("Save Overrides Error:", err);
      toast.error(`Failed to save changes: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review from the database? This action cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
      toast.success("Review deleted successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(`Failed to delete review: ${err.message}`);
    }
  };

  const getDefaultResponse = (th, sent) => {
    if (th === "Location") {
      return "The Himalayan mountain views are indeed breathtaking! We are thrilled you enjoyed the wooden balcony views.";
    }
    if (th === "Food") {
      return "Thank you for praising our local cuisine! We will adjust our cleanliness timings to ensure room updates occur earlier.";
    }
    if (th === "Host") {
      return "Thank you so much! Our hosts strive to provide a warm, personalized family experience for every guest.";
    }
    if (th === "Cleanliness") {
      return "We apologize sincerely for the hot water issue. We have fixed the heater unit immediately with our technician.";
    }
    return "Thank you for sharing your experience with us! We look forward to welcoming you back to Trishul Eco-Homestays.";
  };

  // Re-generate response based on current parameters and custom prompt instruction
  const handleRegenerate = () => {
    setIsRegenerating(true);
    toast.info("Sending prompt overrides to AI Engine...");
    
    setTimeout(async () => {
      setIsRegenerating(false);
      let newText = getDefaultResponse(theme, sentiment);
      if (promptOverride.trim()) {
        newText = `[AI Custom Response] Thank you for the request. In response to your prompt: "${promptOverride}", we are happy to specify that we will keep improving. ${newText}`;
      }
      setDraftResponse(newText);
      await saveReviewChanges({ response: newText });
      toast.success("AI draft response updated and saved!");
    }, 1500);
  };

  const handleCopy = async () => {
    const finalResponse = appendSignature
      ? `${draftResponse}\n\n${defaultSignature}`
      : draftResponse;
    
    navigator.clipboard.writeText(finalResponse);
    await saveReviewChanges({ response: draftResponse });
    toast.success("Final response copied and saved to database!");
  };

  if (isAuthorized === null || (isAuthorized && isLoading) || !review) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
        <Loader variant="spinner" size="lg" label={isAuthorized === null ? "Verifying staff credentials..." : "Loading review workspace logs..."} />
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Header breadcrumb */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Workspace Detail / ID #{review.id}</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary mt-1">Review Classifier Console</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Analyze, customize classification tags, and draft response templates.
          </p>
        </div>
        <div className="flex gap-2.5 self-start md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-950/20"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Review
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand Column: Feedback Details & Overrides */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Feedback Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {review.source} • {review.date}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                AI Confidence Score: <span className="font-bold text-primary dark:text-primary-foreground">{review.score}%</span>
              </span>
            </div>
            <p className="text-base italic text-foreground leading-relaxed">
              "{review.text}"
            </p>
          </div>

          {/* Classification Overrides */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-primary dark:text-primary-foreground">Classifier Tag Overrides</h2>
            
            {/* Sentiment Options */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary dark:text-primary-foreground">Adjust Sentiment Tag</span>
              <div className="grid grid-cols-3 gap-3">
                {["Positive", "Neutral", "Negative"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={async () => {
                      setSentiment(s);
                      await saveReviewChanges({ sentiment: s });
                      toast.success(`Sentiment updated to ${s}`);
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer
                      ${
                        sentiment === s
                          ? s === "Positive"
                            ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : s === "Neutral"
                            ? "bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                            : "bg-red-50 border-red-500 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          : "bg-background border-border text-muted-foreground"
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Options */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary dark:text-primary-foreground">Adjust Category Theme</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Food", "Host", "Location", "Cleanliness", "Value", "General"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={async () => {
                      setTheme(t);
                      const defaultResp = getDefaultResponse(t, sentiment);
                      setDraftResponse(defaultResp);
                      await saveReviewChanges({ theme: t, response: defaultResp });
                      toast.success(`Theme updated to #${t.toLowerCase()}`);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer
                      ${
                        theme === t
                          ? "bg-primary/5 border-primary text-primary dark:text-primary-foreground font-bold shadow-sm"
                          : "bg-background border-border text-muted-foreground hover:bg-muted/30"
                      }
                    `}
                  >
                    #{t.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* AI Custom Prompts */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-primary dark:text-primary-foreground">AI Generation Options</h2>
            <p className="text-xs text-muted-foreground">Add specific customization instructions for the next response draft draft.</p>
            
            <div className="space-y-3">
              <textarea
                value={promptOverride}
                onChange={(e) => setPromptOverride(e.target.value)}
                placeholder="e.g. Request they email us at contact@trishul.com or offer a 10% discount on next stay..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-4 text-xs shadow-inner focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <Loader variant="spinner" size="sm" label="Generating custom draft..." className="flex-row gap-2 text-primary" />
                ) : (
                  "Re-Generate Suggestion"
                )}
              </Button>
            </div>
          </div>

        </div>

        {/* Right Hand Column: Draft Work Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-md flex flex-col h-full justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-primary dark:text-primary-foreground">Response Suggestion Draft</h2>
              <p className="text-xs text-muted-foreground">Inspect or manually edit the final draft text before copying.</p>

              <textarea
                value={draftResponse}
                onChange={(e) => setDraftResponse(e.target.value)}
                rows={10}
                className="w-full rounded-xl border border-border bg-background p-4 text-sm shadow-inner focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium leading-relaxed text-foreground"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="append-sig"
                  type="checkbox"
                  checked={appendSignature}
                  onChange={(e) => setAppendSignature(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                />
                <label htmlFor="append-sig" className="text-xs font-semibold text-primary dark:text-primary-foreground cursor-pointer select-none">
                  Append default team signature
                </label>
              </div>

              {appendSignature && (
                <div className="bg-muted/50 border border-border/40 p-3 rounded-xl">
                  <p className="text-xs italic text-muted-foreground font-semibold">
                    Preview:
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line font-medium leading-relaxed">
                    {draftResponse}
                    {"\n\n"}
                    {defaultSignature}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border/60 mt-6">
              <Button
                variant="primary"
                className="w-full py-3.5 shadow-lg"
                onClick={handleCopy}
              >
                Copy Complete Response
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
