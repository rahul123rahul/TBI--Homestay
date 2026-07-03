"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button, Loader, Modal, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

const mockUserImages = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
];

export default function HomestayDetail({ params }) {
  const router = useRouter();
  const toast = useToast();

  // Resolve params using React.use() for Next.js App Router rules
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [stay, setStay] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking checkout wizard state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: dates, 2: payment selection, 3: processing loader, 4: receipt invoice
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, wallet
  const [paymentUpi, setPaymentUpi] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [walletProvider, setWalletProvider] = useState("gpay");
  const [isBookingSubmit, setIsBookingSubmit] = useState(false);
  const [txnCode, setTxnCode] = useState("");

  // Q&A form state
  const [newQuestion, setNewQuestion] = useState("");
  const [guestNameQA, setGuestNameQA] = useState("");
  const [isQASubmitting, setIsQASubmitting] = useState(false);

  // Write Review form state
  const [overallRating, setOverallRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [hospitality, setHospitality] = useState(5);
  const [food, setFood] = useState(5);
  const [locationVal, setLocationVal] = useState(5);
  const [valueVal, setValueVal] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [wifi, setWifi] = useState(5);
  const [safety, setSafety] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [travelType, setTravelType] = useState("Family");
  const [stayedMonth, setStayedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [recommend, setRecommend] = useState(true);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  // Sort and Translate state
  const [sortMethod, setSortMethod] = useState("newest");
  const [translatedReviews, setTranslatedReviews] = useState({}); // { [revId]: translatedText }
  const [translatingIds, setTranslatingIds] = useState({}); // { [revId]: boolean }

  const fetchStayDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/homestays/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Homestay not found");
          router.push("/");
          return;
        }
        let errMsg = `Server responded with ${res.status}`;
        try {
          const resData = await res.json();
          if (resData && resData.error) {
            errMsg = resData.error;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.success) {
        setStay(data.data);
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error("Fetch Stay Error:", error);
      toast.error(`Error loading details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStayDetails();
  }, [id]);

  // Booking Checkout Wizard handlers
  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!bookStart || !bookEnd) {
      toast.error("Please pick both check-in and check-out dates.");
      return;
    }
    if (new Date(bookStart) >= new Date(bookEnd)) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }
    setCheckoutStep(2); // Proceed to payment
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setCheckoutStep(3); // Loader screen

    // Generate simulated transaction code
    const generatedTxn = `TXN-TRISHUL-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnCode(generatedTxn);

    setTimeout(async () => {
      // API call to confirm booking and block dates in MongoDB
      try {
        const res = await fetch(`http://localhost:5000/api/homestays/${id}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: bookStart,
            endDate: bookEnd,
            guestName: "Active Explorer",
            guestEmail: "explorer@trishul.com",
            guestsCount: guestsCount,
            totalAmount: calculateTotalPrice()
          })
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Payment Authorized! Booking Confirmed.");
          setCheckoutStep(4); // Receipt screen
          fetchStayDetails(); // Reload calendar slots
        } else {
          throw new Error(data.error || "Booking failed");
        }
      } catch (err) {
        toast.error(`Reservation error: ${err.message}`);
        setCheckoutStep(2); // Fallback to payment screen
      }
    }, 2200);
  };

  const calculateNights = () => {
    if (!bookStart || !bookEnd) return 1;
    const start = new Date(bookStart);
    const end = new Date(bookEnd);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotalPrice = () => {
    if (!stay) return 0;
    const nights = calculateNights();
    return stay.startingPrice * nights;
  };

  // Printable receipt window trigger
  const handlePrintReceipt = () => {
    window.print();
  };

  // Helpful vote
  const handleHelpfulVote = async (revId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${revId}/vote`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Thanks for voting!");
        // Update state locally
        setReviews(reviews.map(r => r._id === revId ? { ...r, helpfulVotes: data.data.helpfulVotes } : r));
      }
    } catch (err) {
      toast.error("Failed to vote: " + err.message);
    }
  };

  // Report Review
  const handleReportReview = async (revId) => {
    if (!window.confirm("Are you sure you want to flag/report this review to administrative moderators?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${revId}/report`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.warning("Review flagged for review.");
        setReviews(reviews.map(r => r._id === revId ? { ...r, flagged: true } : r));
      }
    } catch (err) {
      toast.error("Failed to flag review: " + err.message);
    }
  };

  // Language translation toggle
  const handleToggleTranslation = async (revId) => {
    // If already translated, clear translation to toggle back
    if (translatedReviews[revId]) {
      const updated = { ...translatedReviews };
      delete updated[revId];
      setTranslatedReviews(updated);
      return;
    }

    setTranslatingIds({ ...translatingIds, [revId]: true });
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${revId}/translate`);
      const data = await res.json();
      if (data.success) {
        setTranslatedReviews({ ...translatedReviews, [revId]: data.translation });
      }
    } catch (err) {
      toast.error("Failed to translate: " + err.message);
    } finally {
      const loading = { ...translatingIds };
      delete loading[revId];
      setTranslatingIds(loading);
    }
  };

  // Review Sorting
  const getSortedReviews = () => {
    let sorted = [...reviews];
    if (sortMethod === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortMethod === "highest") {
      sorted.sort((a, b) => b.overallRating - a.overallRating);
    } else if (sortMethod === "lowest") {
      sorted.sort((a, b) => a.overallRating - b.overallRating);
    } else if (sortMethod === "helpful") {
      sorted.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
    }
    return sorted;
  };

  // Sentiment Breakdown Percentages
  const getSentimentPercentages = () => {
    if (reviews.length === 0) return { Positive: 0, Neutral: 0, Negative: 0 };
    const positive = reviews.filter(r => r.sentiment === "Positive").length;
    const neutral = reviews.filter(r => r.sentiment === "Neutral").length;
    const negative = reviews.filter(r => r.sentiment === "Negative").length;
    const total = reviews.length;
    return {
      Positive: Math.round((positive / total) * 100),
      Neutral: Math.round((neutral / total) * 100),
      Negative: Math.round((negative / total) * 100)
    };
  };

  // QA question posting
  const handleQASubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsQASubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/homestays/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, askedBy: guestNameQA || "Anonymous Guest" })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Question submitted successfully!");
        setNewQuestion("");
        setGuestNameQA("");
        fetchStayDetails();
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsQASubmitting(false);
    }
  };

  // Simulated Media Attachments
  const handleAddMedia = () => {
    if (!mediaUrlInput.trim()) return;
    setUploadedUrls([...uploadedUrls, mediaUrlInput.trim()]);
    setMediaUrlInput("");
    toast.info("Media URL attached successfully.");
  };

  // Review posting
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Please write a review comment.");
      return;
    }

    setIsReviewSubmitting(true);
    try {
      const payload = {
        overallRating,
        ratings: {
          cleanliness,
          hospitality,
          food,
          location: locationVal,
          value: valueVal,
          comfort,
          wifi,
          safety
        },
        text: commentText,
        travelType,
        stayedDuring: stayedMonth,
        recommend,
        images: uploadedUrls.filter(url => !url.match(/\.(mp4|webm|ogg)$/i)),
        videos: uploadedUrls.filter(url => url.match(/\.(mp4|webm|ogg)$/i)),
        source: "Direct Feedback"
      };

      const res = await fetch(`http://localhost:5000/api/homestays/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted! Sentiment cataloged.");
        setCommentText("");
        setUploadedUrls([]);
        fetchStayDetails();
      }
    } catch (err) {
      toast.error("Failed to post review: " + err.message);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const isDateBooked = (dateStr) => {
    if (!stay || !stay.bookings) return false;
    const target = new Date(dateStr).setHours(0, 0, 0, 0);
    return stay.bookings.some((b) => {
      const start = new Date(b.startDate).setHours(0, 0, 0, 0);
      const end = new Date(b.endDate).setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  };

  const generateMockCalendar = () => {
    const days = [];
    const year = 2026;
    const month = 6; // July
    const totalDays = 31;
    const offset = 3; // Wednesday start

    for (let i = 0; i < offset; i++) {
      days.push({ empty: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-07-${d < 10 ? "0" + d : d}`;
      days.push({
        day: d,
        date: dateStr,
        isBooked: isDateBooked(dateStr)
      });
    }
    return days;
  };

  const calculateAverageSubRating = (metric) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.ratings ? r.ratings[metric] || 5 : 5), 0);
    return (total / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-32 bg-background">
        <Loader variant="spinner" size="lg" label="Loading property profile..." />
      </div>
    );
  }

  if (!stay) return null;

  const calendarDays = generateMockCalendar();
  const sortedReviewsList = getSortedReviews();
  const sentimentPercentages = getSentimentPercentages();

  return (
    <div className="flex-1 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-background">
      
      {/* HEADER INFO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1 rounded-full uppercase">
              {stay.category}
            </span>
            <span className="text-xs text-muted-foreground">📍 {stay.location}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">{stay.name}</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/35 border border-border p-4 rounded-2xl shadow-sm">
          <div className="text-right">
            <span className="text-xs font-bold text-muted-foreground block uppercase">Starting from</span>
            <span className="text-2xl font-extrabold text-primary">
              ₹{stay.startingPrice} <span className="text-xs font-normal text-muted-foreground">/ night</span>
            </span>
          </div>
          <button
            onClick={() => {
              setCheckoutStep(1);
              setIsBookingModalOpen(true);
            }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 overflow-hidden rounded-3xl border border-border bg-muted/10 p-2 shadow-inner">
        <div className="md:col-span-2 aspect-video md:aspect-auto md:h-[380px] overflow-hidden rounded-2xl">
          <img src={stay.images[0]} alt={stay.name} className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 md:col-span-1 gap-4">
          <div className="aspect-square md:h-[182px] overflow-hidden rounded-2xl">
            <img src={stay.images[1]} alt="Gallery 2" className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" />
          </div>
          <div className="aspect-square md:h-[182px] overflow-hidden rounded-2xl">
            <img src={stay.images[2]} alt="Gallery 3" className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" />
          </div>
        </div>
        <div className="hidden md:block md:col-span-1 h-[380px] overflow-hidden rounded-2xl">
          <img src={stay.images[3]} alt="Gallery 4" className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT INFORMATION */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-4 font-sans">Property Profile</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {stay.description}
            </p>
          </div>

          {/* AMENITIES */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-4">Available Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stay.amenities.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-muted/20 border border-border/40 p-3.5 rounded-xl text-xs text-primary font-semibold">
                  <span className="text-base">✔️</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* AI PRICE PREDICTOR CHART */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold text-primary">📈 Seasonal AI Price Predictor</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Predicted demand fluctuations and pricing trends for the upcoming months.</p>
            </div>
            
            {/* Visual price prediction chart widget */}
            <div className="h-56 w-full pt-4 relative">
              <svg className="w-full h-40" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 50,150 Q 150,180 250,140 T 450,90 T 550,110 L 550,200 L 50,200 Z" fill="url(#priceGrad)" />
                <path d="M 50,150 Q 150,180 250,140 T 450,90 T 550,110" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
                
                {/* Dots on line */}
                <circle cx="50" cy="150" r="5" fill="var(--color-accent)" />
                <circle cx="150" cy="180" r="5" fill="var(--color-accent)" />
                <circle cx="250" cy="140" r="5" fill="var(--color-accent)" />
                <circle cx="350" cy="110" r="5" fill="var(--color-accent)" />
                <circle cx="450" cy="90" r="5" fill="var(--color-accent)" />
                <circle cx="550" cy="110" r="5" fill="var(--color-accent)" />
              </svg>
              <div className="flex justify-between text-[10px] font-bold text-primary px-2 mt-2 uppercase tracking-wider">
                <span>Jul (₹3.5k)</span>
                <span>Aug (₹3.2k)</span>
                <span>Sep (₹3.6k)</span>
                <span>Oct (₹4.2k)</span>
                <span>Nov (₹4.5k)</span>
                <span>Dec (₹5.5k)</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic text-center mt-3">
                💡 AI insight: Booking in August saves up to 15% due to monsoon off-season dip!
              </p>
            </div>
          </div>

          {/* AI REVIEWS SUMMARY & SENTIMENT BAR */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-primary">💬 AI Guest Review Summary</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Synthesized points generated by Trishul Hospitality Intelligence Engine.</p>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Summary Synthesis</span>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{stay.aiReviewSummary || "Excellent rating overall. Guests loved the breathtaking mountain vistas, clean and comfortable wooden cottage design, and warm hosting."}"
              </p>
            </div>

            {/* Sentiment Breakdown Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary">Sentiment Breakdown</span>
              <div className="h-4 w-full rounded-full bg-muted flex overflow-hidden border border-border/40">
                <div className="bg-green-600 h-full hover:opacity-90 transition-opacity" style={{ width: `${sentimentPercentages.Positive}%` }} title={`Positive: ${sentimentPercentages.Positive}%`} />
                <div className="bg-yellow-500 h-full hover:opacity-90 transition-opacity" style={{ width: `${sentimentPercentages.Neutral}%` }} title={`Neutral: ${sentimentPercentages.Neutral}%`} />
                <div className="bg-red-500 h-full hover:opacity-90 transition-opacity" style={{ width: `${sentimentPercentages.Negative}%` }} title={`Negative: ${sentimentPercentages.Negative}%`} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground px-1">
                <span className="text-green-600">🟢 Positive: {sentimentPercentages.Positive}%</span>
                <span className="text-yellow-600">🟡 Neutral: {sentimentPercentages.Neutral}%</span>
                <span className="text-red-600">🔴 Negative: {sentimentPercentages.Negative}%</span>
              </div>
            </div>
          </div>

          {/* GUEST REVIEWS HUB */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 gap-4">
              <h2 className="text-xl font-bold text-primary">Detailed Guest Logs</h2>
              
              {/* Sorter */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-feed" className="text-xs font-bold text-primary uppercase">Sort by:</label>
                <select
                  id="sort-feed"
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground font-semibold"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {sortedReviewsList.map((rev) => (
                <div
                  key={rev._id}
                  className={`border border-border/50 rounded-2xl p-5 bg-card/65 shadow-sm relative transition-all duration-300
                    ${rev.flagged ? "opacity-50 saturate-50 border-red-200" : "hover:border-primary/20"}
                  `}
                >
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mockUserImages[(rev.overallRating || 0) % mockUserImages.length]}
                        alt="Guest Avatar"
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-primary">{rev.travelType} Traveler</h4>
                          {rev.isVerifiedStay && (
                            <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                              ✓ Verified Stay
                            </span>
                          )}
                          {rev.spamScore > 75 && (
                            <span className="text-[8px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              ⚠ Spam Suspected ({rev.spamScore}%)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Stayed: {rev.stayedDuring} via {rev.source}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-500">{"★".repeat(rev.overallRating)}</span>
                      <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                        Sentiment: <span className={rev.sentiment === "Positive" ? "text-green-600 font-bold" : "text-yellow-600"}>{rev.sentiment}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{translatedReviews[rev._id] || rev.text}"
                  </p>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between border-t border-border/20 pt-3.5 mt-4 text-[10px] font-bold text-primary">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHelpfulVote(rev._id)}
                        className="flex items-center gap-1 hover:text-accent cursor-pointer"
                        title="Mark as helpful review comment"
                      >
                        👍 Helpful ({rev.helpfulVotes || 0})
                      </button>
                      <button
                        onClick={() => handleToggleTranslation(rev._id)}
                        className="flex items-center gap-1 hover:text-accent cursor-pointer"
                      >
                        🌐 {translatingIds[rev._id] ? "Translating..." : (translatedReviews[rev._id] ? "Show Original" : "Translate")}
                      </button>
                    </div>

                    {!rev.flagged && (
                      <button
                        onClick={() => handleReportReview(rev._id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        🚩 Report
                      </button>
                    )}
                  </div>

                  {rev.response && (
                    <div className="mt-4 bg-primary/5 border border-primary/20 p-3.5 rounded-xl text-xs text-muted-foreground">
                      <span className="font-bold text-primary block uppercase tracking-wider text-[8px] mb-1">Host Response:</span>
                      <p className="font-medium text-primary">"{rev.response}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* WRITE A REVIEW FORM */}
            <form onSubmit={handleReviewSubmit} className="border-t border-border mt-10 pt-10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary">Post Guest Feedback</h3>
                <p className="text-xs text-muted-foreground">Share your lodging experience and rate the homestay services.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 border border-border/60 p-6 rounded-3xl">
                <div className="space-y-4">
                  {[
                    { label: "Cleanliness", state: cleanliness, setter: setCleanliness },
                    { label: "Hospitality", state: hospitality, setter: setHospitality },
                    { label: "Food & Meals", state: food, setter: setFood },
                    { label: "Location & Views", state: locationVal, setter: setLocationVal }
                  ].map((sl) => (
                    <div key={sl.label} className="flex justify-between items-center gap-4 text-xs font-semibold">
                      <span className="text-primary w-28">{sl.label}</span>
                      <input
                        type="range" min="1" max="5" step="1"
                        value={sl.state}
                        onChange={(e) => sl.setter(Number(e.target.value))}
                        className="flex-1 accent-accent h-1 bg-muted rounded appearance-none cursor-pointer"
                      />
                      <span className="text-accent text-right w-6 font-bold">{sl.state}★</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Value for Money", state: valueVal, setter: setValueVal },
                    { label: "Comfort", state: comfort, setter: setComfort },
                    { label: "WiFi Internet", state: wifi, setter: setWifi },
                    { label: "Safety & Security", state: safety, setter: setSafety }
                  ].map((sl) => (
                    <div key={sl.label} className="flex justify-between items-center gap-4 text-xs font-semibold">
                      <span className="text-primary w-28">{sl.label}</span>
                      <input
                        type="range" min="1" max="5" step="1"
                        value={sl.state}
                        onChange={(e) => sl.setter(Number(e.target.value))}
                        className="flex-1 accent-accent h-1 bg-muted rounded appearance-none cursor-pointer"
                      />
                      <span className="text-accent text-right w-6 font-bold">{sl.state}★</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="ov-rate" className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Overall Rating</label>
                  <select
                    id="ov-rate"
                    value={overallRating}
                    onChange={(e) => setOverallRating(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground font-semibold"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="trav" className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Travel Type</label>
                  <select
                    id="trav"
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground font-semibold"
                  >
                    {["Family", "Solo", "Friends", "Couple", "Business"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="stay-d" className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Stayed During</label>
                  <input
                    id="stay-d"
                    type="month"
                    defaultValue={stayedMonth}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || val.length === 7) {
                        setStayedMonth(val);
                      }
                    }}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                    <input
                      type="checkbox"
                      checked={recommend}
                      onChange={(e) => setRecommend(e.target.checked)}
                      className="rounded border-border accent-accent h-4 w-4"
                    />
                    Recommend stays?
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="text-com" className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Review Comments</label>
                <textarea
                  id="text-com"
                  rows={4}
                  placeholder="Share details of hosts hospitality, food, cleanliness..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-4 text-xs focus:outline-none focus:border-primary text-foreground shadow-sm"
                  required
                />
              </div>

              {/* simulated media */}
              <div className="bg-muted/15 border border-border/80 rounded-2xl p-4 space-y-4">
                <span className="block text-xs font-bold text-primary uppercase tracking-wider">Simulate Upload Image/Video (Add URL)</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste sample photo/video URL..."
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    className="flex-1 bg-background border border-border/80 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMedia} className="text-xs">
                    Attach URL
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isReviewSubmitting || !commentText.trim()} className="w-full">
                {isReviewSubmitting ? <Loader variant="spinner" size="sm" label="Posting Review..." /> : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AVAILABILITY & HOST */}
        <div className="lg:col-span-4 space-y-8">
          {/* Host Profile */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm text-center">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Host Profile</h2>
            <img
              src={stay.hostDetails.photo}
              alt={stay.hostDetails.name}
              className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-primary/35 shadow-sm mb-3.5"
            />
            <h3 className="font-extrabold text-base text-primary mb-1">{stay.hostDetails.name}</h3>
            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full font-semibold">
              Joined {stay.hostDetails.joined}
            </span>
            <p className="text-xs text-muted-foreground italic mt-4 font-sans leading-relaxed">
              "{stay.hostDetails.bio}"
            </p>
          </div>

          {/* Calendar */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3.5">Availability Calendar</h2>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-primary">July 2026</span>
              <span className="text-[9px] text-muted-foreground font-semibold">● Red is booked</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-muted-foreground mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="py-1">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((cDay, idx) => (
                cDay.empty ? (
                  <div key={idx} className="py-2.5" />
                ) : (
                  <div
                    key={idx}
                    className={`py-2.5 rounded-lg font-semibold select-none flex flex-col justify-center items-center ${
                      cDay.isBooked
                        ? "bg-red-50 text-red-400 border border-red-100 line-through dark:bg-red-950/20"
                        : "bg-green-50/50 text-green-700 border border-green-100/50 dark:bg-green-950/10"
                    }`}
                  >
                    <span>{cDay.day}</span>
                  </div>
                )
              ))}
            </div>

            <div className="mt-5">
              <button
                onClick={() => {
                  setCheckoutStep(1);
                  setIsBookingModalOpen(true);
                }}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 px-4 rounded-xl shadow text-xs cursor-pointer"
              >
                Request Dates booking
              </button>
            </div>
          </div>

          {/* Attractions */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Nearby Attractions</h2>
            <div className="space-y-3.5">
              {stay.nearbyAttractions.map((att, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                  <span className="font-semibold text-primary">🌲 {att.name}</span>
                  <span className="text-muted-foreground font-medium">{att.distance} away</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT WIZARD MODAL */}
      {isBookingModalOpen && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title="Reserve Homestay Slots"
        >
          {checkoutStep === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-4 p-2 text-left">
              <p className="text-xs text-muted-foreground">Step 1 of 3: Select Check-In, Check-Out, and Guest Count.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="checkout-book-start"
                  label="Check-in Date"
                  type="date"
                  required
                  defaultValue={bookStart}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || val.length === 10) {
                      setBookStart(val);
                    }
                  }}
                />
                <Input
                  id="checkout-book-end"
                  label="Check-out Date"
                  type="date"
                  required
                  defaultValue={bookEnd}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || val.length === 10) {
                      setBookEnd(val);
                    }
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase">Number of Guests</label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs focus:border-primary focus:outline-none text-foreground font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>

              <div className="bg-muted/40 p-4 rounded-xl text-xs flex justify-between items-center font-bold">
                <span className="text-muted-foreground">Rate: ₹{stay.startingPrice} × {calculateNights()} night(s)</span>
                <span className="text-primary">Subtotal: ₹{calculateTotalPrice().toLocaleString()}</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
                <Button type="submit">Proceed to Payment</Button>
              </div>
            </form>
          )}

          {checkoutStep === 2 && (
            <form onSubmit={handleSimulatePayment} className="space-y-5 p-2 text-left">
              <p className="text-xs text-muted-foreground">Step 2 of 3: Select simulated payment method and enter credentials.</p>
              
              {/* Payment tabs */}
              <div className="grid grid-cols-3 gap-2 border-b border-border/60 pb-3">
                {["upi", "card", "wallet"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-lg border text-center text-xs font-bold uppercase tracking-wider cursor-pointer
                      ${paymentMethod === m ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}
                    `}
                  >
                    {m === "upi" ? "UPI ID" : m === "card" ? "Credit Card" : "Wallet"}
                  </button>
                ))}
              </div>

              {/* Tab forms */}
              {paymentMethod === "upi" && (
                <div className="space-y-1.5">
                  <Input
                    label="Virtual Payment Address (VPA)"
                    placeholder="e.g. guest@okaxis"
                    value={paymentUpi}
                    onChange={(e) => setPaymentUpi(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">A simulated authorization request will be sent to your UPI app.</span>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <Input
                    label="Cardholder Name"
                    placeholder="e.g. Aarav Mehta"
                    required
                  />
                  <Input
                    label="16-digit Card Number"
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      required
                    />
                    <Input
                      label="CVC / CVV"
                      placeholder="•••"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase block">Select Wallet Provider</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-muted-foreground">
                    {["gpay", "paytm", "phonepe"].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWalletProvider(w)}
                        className={`py-2 px-3 border rounded-xl cursor-pointer ${walletProvider === w ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
                      >
                        {w === "gpay" ? "Google Pay" : w === "paytm" ? "Paytm" : "PhonePe"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-xl text-xs flex justify-between items-center font-extrabold border border-primary/10">
                <span className="text-primary uppercase tracking-wider">Total Booking Cost:</span>
                <span className="text-primary text-sm">₹{calculateTotalPrice().toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" type="button" onClick={() => setCheckoutStep(1)}>Back</Button>
                <Button type="submit">Authorize Payment</Button>
              </div>
            </form>
          )}

          {checkoutStep === 3 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader variant="spinner" size="lg" label="Simulating secure payment gateway verification..." />
              <p className="text-[10px] text-muted-foreground">Please do not refresh this page or close the window.</p>
            </div>
          )}

          {checkoutStep === 4 && (
            <div id="receipt-invoice" className="p-4 space-y-6 text-left border border-border/80 bg-card rounded-2xl shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <div className="flex justify-between items-start border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Trishul Invoice Receipt</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Reference Code: {txnCode}</p>
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">PAID</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Property:</span><span className="font-semibold text-primary">{stay.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span className="font-semibold text-primary">{stay.location}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Check-in Date:</span><span className="font-semibold text-primary">{bookStart}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Check-out Date:</span><span className="font-semibold text-primary">{bookEnd}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nights Stayed:</span><span className="font-semibold text-primary">{calculateNights()} night(s)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Guests:</span><span className="font-semibold text-primary">{guestsCount} Persons</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment Method:</span><span className="font-semibold text-primary uppercase">{paymentMethod}</span></div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground"><span>Base Fare:</span><span>₹{(stay.startingPrice * calculateNights()).toLocaleString()}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>SGST & CGST (18%):</span><span>₹{Math.round((stay.startingPrice * calculateNights()) * 0.18).toLocaleString()}</span></div>
                <div className="flex justify-between text-primary font-bold border-t border-primary/10 pt-1.5 mt-1.5 text-sm">
                  <span>Net Amount Paid:</span>
                  <span>₹{Math.round(calculateTotalPrice() * 1.18).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1 text-xs" onClick={handlePrintReceipt}>Print Invoice</Button>
                <Button className="flex-1 text-xs" onClick={() => setIsBookingModalOpen(false)}>Done</Button>
              </div>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}
