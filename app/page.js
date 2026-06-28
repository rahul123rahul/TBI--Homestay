"use client";

import React, { useState, useRef } from "react";
import Hero from "@/components/Hero";
import Card from "@/components/Card";
import { Button, Loader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

export default function Home() {
  const consoleRef = useRef(null);
  const [reviewsInput, setReviewsInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const toast = useToast();

  const scrollToConsole = () => {
    consoleRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSampleLoad = () => {
    const samples = [
      "The host went above and beyond to make us feel at home. Best stay ever!",
      "Great mountain view but the food was a bit spicy for my kids.",
      "Rooms were dirty and dusty when we arrived. Disappointing cleanliness.",
      "The homestay is far from the main city, but it was peaceful and worth the value.",
      "Awesome experience overall, would definitely come back next summer!"
    ];
    setReviewsInput(samples.join("\n"));
    toast.info("Sample batch loaded into console.");
  };

  const classifyReview = (text) => {
    const cleanText = text.toLowerCase().trim();
    if (!cleanText) return null;

    let sentiment = "Positive";
    let theme = "Experience";
    let response = "";

    // Keyword heuristics
    if (cleanText.includes("clean") || cleanText.includes("dirty") || cleanText.includes("dust") || cleanText.includes("washroom") || cleanText.includes("bathroom")) {
      theme = "Cleanliness";
      if (cleanText.includes("dirty") || cleanText.includes("dust") || cleanText.includes("disappoint")) {
        sentiment = "Negative";
        response = "We apologize sincerely for the cleanliness issue. We have addressed this immediately with our housekeeping team to prevent recurrence.";
      } else {
        response = "Thank you! We pride ourselves on maintaining clean and comfortable spaces for our eco-homestay guests.";
      }
    } else if (cleanText.includes("food") || cleanText.includes("spicy") || cleanText.includes("cook") || cleanText.includes("breakfast") || cleanText.includes("dinner") || cleanText.includes("kitchen")) {
      theme = "Food";
      if (cleanText.includes("spicy") || cleanText.includes("bad") || cleanText.includes("cold")) {
        sentiment = "Neutral";
        response = "Thank you for the feedback on our meals. We will adjust our spice levels and temperature to better suit our guests' preferences.";
      } else {
        response = "We're glad you enjoyed our local cuisine! Our kitchen takes great pride in preparing fresh, home-cooked Kumaoni meals.";
      }
    } else if (cleanText.includes("host") || cleanText.includes("owner") || cleanText.includes("caretaker") || cleanText.includes("staff") || cleanText.includes("people")) {
      theme = "Host";
      if (cleanText.includes("rude") || cleanText.includes("unhelpful")) {
        sentiment = "Negative";
        response = "We are deeply sorry for your experience. We are retraining our team to ensure our guest service is warm and helpful.";
      } else {
        response = "Thank you so much! Our hosts strive to provide a warm, personalized family experience for every guest.";
      }
    } else if (cleanText.includes("view") || cleanText.includes("location") || cleanText.includes("far") || cleanText.includes("peaceful") || cleanText.includes("mountain") || cleanText.includes("hills")) {
      theme = "Location";
      if (cleanText.includes("far") || cleanText.includes("hard to find") || cleanText.includes("isolated")) {
        sentiment = "Neutral";
        response = "Thank you. Our secluded mountain location is chosen for peace and quiet, and we are working to make our driving directions clearer.";
      } else {
        response = "The Himalayan mountain views are indeed breathtaking! We're glad you enjoyed our serene and peaceful location.";
      }
    } else if (cleanText.includes("value") || cleanText.includes("price") || cleanText.includes("expensive") || cleanText.includes("cost") || cleanText.includes("money")) {
      theme = "Value";
      if (cleanText.includes("expensive") || cleanText.includes("overpriced")) {
        sentiment = "Negative";
        response = "We appreciate your feedback regarding our rates. We strive to offer unique eco-stays and are continuously enhancing our facilities to provide better value.";
      } else {
        response = "Thank you for your feedback. We are glad you found our eco-homestay experience well worth the value.";
      }
    } else {
      // Default Experience
      response = "Thank you for sharing your experience with us! We look forward to welcoming you back to Trishul Eco-Homestays in the future.";
    }

    return { text, sentiment, theme, response };
  };

  const handleAnalyze = async () => {
    if (!reviewsInput.trim()) return;
    setIsAnalyzing(true);
    setResults([]);

    try {
      const lines = reviewsInput.split("\n").filter((l) => l.trim() !== "");
      const res = await fetch("http://localhost:5000/api/reviews/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviews: lines,
          source: "Console Interface"
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const resData = await res.json();
      if (resData.success) {
        setResults(resData.data);
        toast.success(`Successfully analyzed ${resData.count} reviews.`);
      } else {
        throw new Error(resData.error || "Analysis failed.");
      }
    } catch (error) {
      console.error("API Error in handleAnalyze:", error);
      toast.error(`Classification error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Draft response copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setReviewsInput("");
    setResults([]);
    toast.info("Console input and results cleared.");
  };


  return (
    <div className="flex-1">
      {/* Hero Section */}
      <Hero onCtaClick={scrollToConsole} />

      {/* Analytics Summary Cards (Deliverable requirement: Card used at least twice) */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Performance at a Glance</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Mock metrics aggregated from Trishul Eco-Homestays' channels over the past 30 days.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Cleanliness Score"
            description="Recent ratings show guest satisfaction with cleanliness has peaked since our deep sanitization initiative."
            badgeText="98.2%"
            badgeType="positive"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.913-9.378m-8.913 9.378a3 3 0 11-5.717-1.95L5 15.09M17.913 11.622L18.75 3.75M17.913 11.622L10.5 15M18.75 3.75a3 3 0 10-5.717-1.95L12 9.91" />
              </svg>
            }
            actionText="View Cleanliness Logs"
            actionHref="/dashboard"
          />
          <Card
            title="Host Appreciation"
            description="Our local hosting staff and caretakers are the primary driver of positive 5-star feedback reviews."
            badgeText="Top Theme"
            badgeType="accent"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a6 6 0 00-3.44-5.32M18 18.72a6 6 0 01-3.44-5.32M15 13.4a6 6 0 00-6 0M15 13.4H9m6 0v2.6m-6-2.6V16M9 13.4a6 6 0 01-6-5.32M9 13.4v2.6M3 18.72V16.4a6 6 0 013.44-5.32" />
              </svg>
            }
            actionText="View Host Feedback"
            actionHref="/dashboard"
          />
          <Card
            title="Pending Responses"
            description="Reviews received across booking websites requiring a response draft within the 24-hour target window."
            badgeText="8 Unresolved"
            badgeType="negative"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            actionText="Process Queue Now"
            onClick={scrollToConsole}
          />
        </div>
      </section>

      {/* Main Console Section */}
      <section
        ref={consoleRef}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border"
      >
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-lg">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Classifier Console</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Paste guest reviews (one per line) below. Our engine will tag the sentiment and theme, and write a drafted Kumaoni hospitality reply.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="reviews" className="block text-sm font-semibold text-primary">
                  Review Text Input
                </label>
                <button
                  type="button"
                  onClick={handleSampleLoad}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Load Sample Batch
                </button>
              </div>

              <textarea
                id="reviews"
                rows={8}
                value={reviewsInput}
                onChange={(e) => setReviewsInput(e.target.value)}
                placeholder="Enter reviews here, one per line. For example:&#10;The hosts were extremely kind and welcoming...&#10;Food was great but the view was blocked by construction..."
                className="w-full rounded-xl border border-border bg-background p-4 text-sm shadow-inner focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !reviewsInput.trim()}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <Loader variant="spinner" size="sm" label="Analyzing Feedback..." className="flex-row gap-2" />
                  ) : (
                    "Analyze Reviews"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Results Table Column */}
            <div className="lg:col-span-7 flex flex-col">
              <span className="block text-sm font-semibold text-primary mb-4">
                Analysis Results {results.length > 0 && `(${results.length} reviews processed)`}
              </span>

              {results.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center bg-muted/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-10 w-10 text-muted-foreground mb-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm font-medium text-muted-foreground">No analysis results yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter reviews on the left and click "Analyze Reviews" or use a sample batch.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/65 text-primary font-bold">
                        <th className="px-4 py-3 w-1/3">Review Feedback</th>
                        <th className="px-3 py-3 w-20">Sentiment</th>
                        <th className="px-3 py-3 w-20">Theme</th>
                        <th className="px-4 py-3">Suggested Response</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {results.map((res, index) => (
                        <tr key={index} className="hover:bg-muted/30 transition-colors align-top">
                          <td className="px-4 py-3 font-normal text-muted-foreground break-words italic">
                            "{res.text}"
                          </td>
                          <td className="px-3 py-3 font-semibold">
                            <span
                              className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                res.sentiment === "Positive"
                                  ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                                  : res.sentiment === "Neutral"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                              }`}
                            >
                              {res.sentiment}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-primary">
                            #{res.theme.toLowerCase()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <p className="font-medium text-primary break-words">
                                {res.response}
                              </p>
                              <button
                                onClick={() => handleCopy(res.response, index)}
                                className="self-start inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-accent hover:underline mt-1 cursor-pointer"
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Draft
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
