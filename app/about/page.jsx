import React from "react";

export default function About() {
  const themes = [
    {
      name: "Food",
      description: "Mentions of meals, cooking, breakfast, dinner, spices, or local Kumaoni cuisine prepared by homestay caretakers.",
      icon: "🍲",
    },
    {
      name: "Host & Staff",
      description: "Feedback regarding owners, hosts, guides, hospitality gestures, greeting warmness, or staff helpfulness.",
      icon: "🧑‍🌾",
    },
    {
      name: "Location & Views",
      description: "Mentions of Himalayan scenic peaks, altitude, quiet trails, walking paths, isolation, or directions to the property.",
      icon: "🏔️",
    },
    {
      name: "Cleanliness",
      description: "Comments on room dusting, bathroom status, fresh bed linens, towel setups, and sanitation quality.",
      icon: "🧹",
    },
    {
      name: "Value",
      description: "Assessments of room booking prices, meal costs, transportation rates, and overall worth of the homestay experience.",
      icon: "🏷️",
    },
    {
      name: "General Experience",
      description: "Broad reviews, summer retreats, seasonal bookings, overall ratings, or returning recommendations.",
      icon: "✨",
    },
  ];

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">About the Sentiment Classifier</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Understanding the background, engineering scope, and operational metrics of Trishul Eco-Homestays.
        </p>
      </div>

      {/* Main Context */}
      <div className="mt-8 space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Context: Trishul Eco-Homestays</h2>
          <p>
            Nestled in the serene hills, <strong>Trishul Eco-Homestays</strong> offers guests a chance to slow down, connect with nature, and experience traditional Himalayan hospitality. Over the past year, as our capacity expanded across booking platforms (like Airbnb, Booking.com, and Google Maps), the volume of guest reviews grew exponentially.
          </p>
          <p className="mt-3">
            With a small, localized team focusing on active hosting, we had no dedicated capacity to read, categorize, and draft appropriate management replies for these reviews. This Web Tool is designed to assist our administrative and hosting staff by streamlining feedback management.
          </p>
        </section>

        {/* How It Works */}
        <section className="border-t border-border pt-8">
          <h2 className="text-xl font-bold text-primary mb-3">Core Objectives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div className="rounded-xl bg-muted p-5 border border-border/80">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-primary mt-2">1. Sentiment Tagging</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Automatically identifies whether feedback is <strong>Positive</strong>, <strong>Neutral</strong>, or <strong>Negative</strong>. Helpful for filtering alerts.
              </p>
            </div>
            <div className="rounded-xl bg-muted p-5 border border-border/80">
              <span className="text-2xl">🏷️</span>
              <h3 className="font-bold text-primary mt-2">2. Theme Identification</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Categorizes review sentences into 6 core themes to pinpoint operational issues or highlight customer service wins.
              </p>
            </div>
            <div className="rounded-xl bg-muted p-5 border border-border/80">
              <span className="text-2xl">✍️</span>
              <h3 className="font-bold text-primary mt-2">3. Draft Responses</h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Generates a one-line professional, welcoming response tailored to the theme, respecting local hospitality ethics.
              </p>
            </div>
          </div>
        </section>

        {/* Theme Guides */}
        <section id="guide" className="border-t border-border pt-8">
          <h2 className="text-xl font-bold text-primary mb-4">Theme Classification Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <div key={theme.name} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="text-3xl shrink-0 select-none">{theme.icon}</div>
                <div>
                  <h3 className="font-bold text-primary text-sm">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">{theme.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
