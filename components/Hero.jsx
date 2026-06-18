import React from "react";

export default function Hero({ onCtaClick }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-28">
      {/* Decorative blurred circles for premium glassmorphism aesthetic */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary mb-6 border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Eco-Homestay Sentiment Intelligence
            </span>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl leading-[1.15]">
              Understand Guest Feedback,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Respond Instantly
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl">
              Automated review analytics for Trishul Eco-Homestays. Paste a batch of reviews to categorize sentiment, identify core guest themes, and generate contextual, professional management replies in seconds.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={onCtaClick}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
              >
                Launch Console
              </button>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-muted focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn How It Works
              </a>
            </div>
          </div>

          {/* Hero Visual Mockup Right */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-[480px] rounded-2xl border border-border bg-card/65 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">sentiment_analysis.py</span>
              </div>
              
              {/* Simulated Card Elements */}
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4.5 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Positive
                    </span>
                    <span className="text-xs font-medium text-accent">
                      #host
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-sans">
                    "The caretakers at Trishul Eco-Homestay were incredibly welcoming! They cooked local Kumaoni food for us."
                  </p>
                  <div className="mt-3 border-t border-border/60 pt-2.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-primary">Response Draft:</p>
                    <p className="text-xs font-medium text-primary mt-1">
                      "Thank you so much! We are thrilled you loved our Kumaoni cuisine and warm hospitality."
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4.5 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Neutral
                    </span>
                    <span className="text-xs font-medium text-primary">
                      #location
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-sans">
                    "Beautiful mountain views, but the final 1km path leading to the cottage is quite narrow and steep."
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
