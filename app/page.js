"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Loader } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = [
  { name: "All Stays", value: "all", icon: "🏡" },
  { name: "Mountain", value: "Mountain", icon: "🏔️" },
  { name: "Beach", value: "Beach", icon: "🏖️" },
  { name: "Farm Stay", value: "Farm Stay", icon: "🚜" },
  { name: "Lake View", value: "Lake View", icon: "🌅" },
  { name: "Heritage", value: "Heritage", icon: "🏰" },
  { name: "Luxury", value: "Luxury", icon: "💎" },
  { name: "Budget", value: "Budget", icon: "🏷️" },
  { name: "Pet Friendly", value: "Pet Friendly", icon: "🐾" },
  { name: "Top Rated", value: "Top Rated", icon: "🌟" }
];

const DESTINATIONS = [
  { name: "Goa", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300", count: "Beachside Retreats" },
  { name: "Ooty", image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=300", count: "Heritage Bungalows" },
  { name: "Coorg", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300", count: "Coffee Estate Cabins" },
  { name: "Munnar", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=300", count: "Lake View Stays" },
  { name: "Araku", image: "https://images.unsplash.com/photo-1564507592937-25994a9015ba?w=300", count: "Budget Escapes" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300", count: "Top Rated Havens" }
];

const WHY_CHOOSE_US = [
  {
    title: "Verified Reviews",
    description: "Every review is analyzed using AI for sentiment integrity, ensuring real guest feedback.",
    icon: (
      <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: "Verified Owners",
    description: "We partner directly with native hosts in high-altitude zones to bring you authentic local hospitality.",
    icon: (
      <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    title: "Secure Booking",
    description: "Our state-of-the-art reservation engine secures your slots without hidden broker commissions.",
    icon: (
      <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: "24/7 Support",
    description: "Get direct phone assistance from our hill-station guides and caretakers at any time of day.",
    icon: (
      <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
];

export default function Home() {
  const [homestays, setHomestays] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Filters State
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [distance, setDistance] = useState(10);

  const fetchHomestays = async (cat = "all", loc = "", minP = minPrice, maxP = maxPrice, minR = minRating, amens = selectedAmenities, freeCancel = freeCancellation) => {
    setIsLoading(true);
    try {
      let url = `http://localhost:5000/api/homestays?category=${cat}`;
      if (loc) {
        url += `&search=${encodeURIComponent(loc)}`;
      }
      if (minP !== undefined) url += `&minPrice=${minP}`;
      if (maxP !== undefined) url += `&maxPrice=${maxP}`;
      if (minR > 0) url += `&minRating=${minR}`;
      if (amens && amens.length > 0) url += `&amenities=${encodeURIComponent(amens.join(","))}`;
      if (freeCancel) url += `&freeCancellation=true`;

      const res = await fetch(url);
      if (!res.ok) {
        let errMsg = "Failed to load listings";
        try {
          const resData = await res.json();
          if (resData && resData.error) {
            errMsg = resData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }
      const resData = await res.json();
      if (resData.success) {
        setHomestays(resData.data);
      }
    } catch (error) {
      console.warn("Fetch Stays Error:", error);
      toast.error(`Error loading homestays: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomestays(selectedCategory, searchLocation, minPrice, maxPrice, minRating, selectedAmenities, freeCancellation);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHomestays(selectedCategory, searchLocation, minPrice, maxPrice, minRating, selectedAmenities, freeCancellation);
    toast.info(`Smart searching for homestays: "${searchLocation || "All locations"}"`);
  };

  const handleApplyFilters = () => {
    fetchHomestays(selectedCategory, searchLocation, minPrice, maxPrice, minRating, selectedAmenities, freeCancellation);
    toast.success("Filters applied successfully!");
  };

  const handleResetFilters = () => {
    setMinPrice(1000);
    setMaxPrice(10000);
    setMinRating(0);
    setSelectedAmenities([]);
    setFreeCancellation(false);
    setDistance(10);
    setSearchLocation("");
    setSelectedCategory("all");
    fetchHomestays("all", "", 1000, 10000, 0, [], false);
    toast.info("Search and filters reset.");
  };

  const handleCategoryClick = (catVal) => {
    setSelectedCategory(catVal);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* 1. HERO SECTION WITH SEARCH */}
      <section className="relative bg-gradient-to-b from-primary/15 via-background to-background py-16 lg:py-24 overflow-hidden border-b border-border">
        <div className="absolute top-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary mb-6 border border-primary/20">
            🌳 Trishul Eco-Homestay Network
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-[1.12]">
            Discover Authentic Homestays in the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Heart of India
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Book local eco-homestays with real-time feedback ratings, validated hospitality, and home-cooked regional delicacies.
          </p>

          {/* SEARCH BAR PORTAL */}
          <form onSubmit={handleSearchSubmit} className="mt-10 mx-auto max-w-5xl bg-card border border-border p-4 md:p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 text-left relative z-25">
            <div className="md:col-span-4 flex flex-col">
              <label htmlFor="loc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Where to?</label>
              <div className="relative">
                <input
                  id="loc"
                  type="text"
                  placeholder="Goa, Ooty, Ranikhet..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="md:col-span-2.5 flex flex-col">
              <label htmlFor="chk-in" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Check-in</label>
              <input
                id="chk-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="md:col-span-2.5 flex flex-col">
              <label htmlFor="chk-out" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Check-out</label>
              <input
                id="chk-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="md:col-span-1.5 flex flex-col">
              <label htmlFor="guests" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Guests</label>
              <select
                id="guests"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1.5 flex items-end">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. CATEGORIES ROW */}
      <section className="bg-card border-b border-border py-4 sticky top-16 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-none items-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap cursor-pointer hover:border-primary ${
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROPERTY GRID */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">
              Available Stays {selectedCategory !== "all" && `in ${selectedCategory}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {homestays.length} stays based on your criteria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 space-y-6 bg-card border border-border p-6 rounded-3xl shadow-sm self-start">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <h3 className="text-xs font-bold text-primary dark:text-primary-foreground uppercase tracking-wider">Search Filters</h3>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-accent hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase block">Price Range (₹)</span>
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                <span>Min: ₹{minPrice}</span>
                <span>Max: ₹{maxPrice}</span>
              </div>
              <div className="space-y-3 pt-2">
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="500"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-muted rounded appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="5000"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-muted rounded appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase block">Minimum Rating</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner text-foreground font-semibold"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">Excellent (4.5★+)</option>
                <option value="4">Very Good (4.0★+)</option>
                <option value="3">Good (3.0★+)</option>
              </select>
            </div>

            {/* Amenities Filter */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase block">Amenities</span>
              <div className="space-y-2">
                {["WiFi", "AC", "Kitchen", "Pool", "Beach Access", "Mountain View", "Fireplace", "Eco-Toilet", "Hot Water"].map((amen) => {
                  const isChecked = selectedAmenities.includes(amen);
                  return (
                    <label key={amen} className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedAmenities(selectedAmenities.filter(a => a !== amen));
                          } else {
                            setSelectedAmenities([...selectedAmenities, amen]);
                          }
                        }}
                        className="rounded border-border accent-primary h-4 w-4"
                      />
                      {amen}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase block">Booking Terms</span>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) => setFreeCancellation(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4"
                />
                Free Cancellation
              </label>
            </div>

            {/* Proximity / Distance */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase block">Max Distance from Scenic Spots</span>
              <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                <span>Distance:</span>
                <span>{distance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-muted rounded appearance-none cursor-pointer mt-1"
              />
            </div>

            <Button onClick={handleApplyFilters} className="w-full text-xs py-3 mt-2 shadow-sm">
              Apply Search Filters
            </Button>
          </div>

          {/* Stays Grid */}
          <div className="lg:col-span-9">
            {isLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader variant="spinner" size="lg" label="Loading regional homestays..." />
              </div>
            ) : homestays.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border px-4">
                <span className="text-4xl">🏜️</span>
                <h3 className="text-lg font-bold text-primary mt-4">No Stays Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  We couldn't find any stays matching your filters. Try resetting to show all listings.
                </p>
                <Button variant="outline" onClick={handleResetFilters} className="mt-6">
                  Reset Search Criteria
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {homestays.map((stay) => {
                  const matchScores = {
                    Mountain: 98,
                    Beach: 96,
                    "Farm Stay": 95,
                    "Lake View": 94,
                    Heritage: 93,
                    Luxury: 99,
                    Budget: 90,
                    "Pet Friendly": 97,
                    "Top Rated": 98
                  };
                  const score = matchScores[stay.category] || 94;

                  return (
                    <div
                      key={stay._id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image Slider Wrapper */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={stay.images[0] || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600"}
                          alt={stay.name}
                          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider">
                          {stay.category}
                        </div>
                        <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm">
                          🪄 {score}% Match
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                          ₹{stay.startingPrice}/night
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            📍 {stay.location}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-primary">
                            ⭐ {stay.rating || "New"}
                            <span className="text-muted-foreground font-normal">
                              ({stay.reviewsCount || 0})
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
                          {stay.name}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 flex-1">
                          {stay.description}
                        </p>

                        {/* Latest Review Snippet Requirement */}
                        {stay.latestReview ? (
                          <div className="mt-4 border-t border-border/60 pt-3 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                            <p className="text-[10px] uppercase font-bold text-primary tracking-wide mb-1 flex justify-between items-center">
                              <span>Latest Review:</span>
                              <span className="text-amber-500">{"★".repeat(stay.latestReview.rating)}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                              "{stay.latestReview.text}"
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 border-t border-border/60 pt-3 text-[10px] text-muted-foreground italic text-center">
                            No guest reviews logged yet
                          </div>
                        )}

                        <div className="mt-5 pt-1.5">
                          <Link href={`/homestay/${stay._id}`} className="w-full">
                            <Button className="w-full text-xs" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. POPULAR DESTINATIONS */}
      <section className="bg-muted/30 border-t border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">Popular Destinations</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Explore nature and local hospitality at our highest-rated mountain and beach locations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => {
                  setSearchLocation(dest.name);
                  fetchHomestays(selectedCategory, dest.name);
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                className="group flex flex-col items-center text-center cursor-pointer focus:outline-none"
              >
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border shadow-sm group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-primary mt-3 group-hover:text-accent transition-colors">
                  {dest.name}
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
                  {dest.count}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GUEST TESTIMONIAL FEEDBACK */}
      <section className="bg-primary py-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary-foreground/30 to-accent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-center lg:text-left">
            <span className="text-xs uppercase font-bold tracking-wider text-accent bg-accent-foreground px-3 py-1 rounded-full">
              Guest Testimonials
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mt-4">
              What Travelers Are Saying
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-sm leading-relaxed">
              We compile thousands of feedback reviews directly from our guest logbook to help you make informed booking decisions.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-primary/20 p-6 rounded-2xl text-foreground shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-amber-500 text-base">★★★★★</span>
                <p className="text-xs text-muted-foreground italic mt-3 font-sans leading-relaxed">
                  "Amazing experience. Clean rooms and great hospitality. The Himalayan peaks were visible right from the wooden balcony! Exceeded expectations."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Guest"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-primary">Anjali Sharma</h4>
                  <p className="text-[10px] text-muted-foreground">Stayed in Ranikhet</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-primary/20 p-6 rounded-2xl text-foreground shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-amber-500 text-base">★★★★★</span>
                <p className="text-xs text-muted-foreground italic mt-3 font-sans leading-relaxed">
                  "The hosts treated us like their own family. Extremely warm gestures, local insights, and wonderful fresh Kumaoni breakfast cooked right in front of us!"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Guest"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-primary">Vikas Malhotra</h4>
                  <p className="text-[10px] text-muted-foreground">Stayed in Munnar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">Why Choose Trishul Homestays</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Providing premium, transparent lodging experiences backed by direct support and local owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-4 text-primary">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-primary mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
