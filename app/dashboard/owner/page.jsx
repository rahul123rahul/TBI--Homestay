"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Loader, Modal, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { API_URL } from "@/lib/config";

export default function OwnerDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState([]);
  const [monthlyVisitors, setMonthlyVisitors] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState([]);
  const [homestay, setHomestay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponValidity, setCouponValidity] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");
  const [offerValidity, setOfferValidity] = useState("");

  // Verification & Auth Check
  useEffect(() => {
    const loggedIn = localStorage.getItem("isStaffLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    const isOwner = loggedIn && role === "Owner";
    setIsAuthorized(isOwner);

    if (!isOwner) {
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
      fetchOwnerData();
    }
  }, [router]);

  const fetchOwnerData = async () => {
    setIsLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch(`${API_URL}/api/owner/stats`);
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.data.stats);
        setMonthlyVisitors(statsJson.data.monthlyVisitors || []);
        setRevenueGrowth(statsJson.data.revenueGrowth || []);
      }

      // 2. Homestay Details & Calendar Bookings
      const homestayRes = await fetch(`${API_URL}/api/owner/homestay`);
      const homestayJson = await homestayRes.json();
      if (homestayJson.success) {
        setHomestay(homestayJson.data);
        setBookings(homestayJson.bookings || []);
      }

      // 3. Reviews
      const reviewsRes = await fetch(`${API_URL}/api/owner/reviews`);
      const reviewsJson = await reviewsRes.json();
      if (reviewsJson.success) {
        setReviews(reviewsJson.data);
      }

      // 4. Offers & Coupons
      const marketingRes = await fetch(`${API_URL}/api/owner/marketing`);
      const marketingJson = await marketingRes.json();
      if (marketingJson.success) {
        setOffers(marketingJson.data.offers || []);
        setCoupons(marketingJson.data.coupons || []);
      }

      // 5. Notifications
      const notifRes = await fetch(`${API_URL}/api/owner/notifications`);
      const notifJson = await notifRes.json();
      if (notifJson.success) {
        setNotifications(notifJson.data || []);
      }
    } catch (error) {
      console.error("Failed to load owner data:", error);
      toast.error(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Availability Toggling (blocking dates)
  const handleToggleDate = async (day) => {
    if (!homestay) return;
    const targetDate = new Date(2026, 6, day); // July 2026

    // Check if day is currently blocked/booked
    const isBooked = isDateBooked(day);
    if (isBooked) {
      // Find the booking/block ID
      const block = homestay.bookings.find(b => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        const current = new Date(2026, 6, day);
        return current >= start && current <= end;
      });

      if (block) {
        try {
          const res = await fetch(`${API_URL}/api/owner/calendar/block`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: block._id })
          });
          const json = await res.json();
          if (json.success) {
            setHomestay(json.data);
            toast.success(`Day ${day} is now marked as Available.`);
          }
        } catch (err) {
          toast.error("Failed to unblock date: " + err.message);
        }
      }
    } else {
      // Block this date as owner block (1 day)
      try {
        const res = await fetch(`${API_URL}/api/owner/calendar/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate: targetDate, endDate: targetDate })
        });
        const json = await res.json();
        if (json.success) {
          setHomestay(json.data);
          toast.success(`Day ${day} is now blocked.`);
        }
      } catch (err) {
        toast.error("Failed to block date: " + err.message);
      }
    }
  };

  // Review reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;
    try {
      const res = await fetch(`${API_URL}/api/owner/reviews/${selectedReview._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Reply submitted successfully!");
        setIsReplyModalOpen(false);
        setReplyText("");
        setSelectedReview(null);
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to submit reply: " + err.message);
    }
  };

  const generateAiReply = (review) => {
    toast.info("AI generating draft reply...");
    setTimeout(() => {
      let draft = "";
      if (review.sentiment === "Positive") {
        draft = `Namaskar! Thank you so much for the feedback. We are thrilled you enjoyed the ${review.theme.toLowerCase()} during your stay at Trishul Eco-Homestay. Looking forward to hosting you again!`;
      } else if (review.sentiment === "Negative") {
        draft = `We sincerely apologize for the inconvenience regarding the ${review.theme.toLowerCase()}. We have taken immediate action to rectify this issue. Thank you for helping us improve.`;
      } else {
        draft = `Thank you for sharing your experience. We appreciate the feedback on our ${review.theme.toLowerCase()} and will continuously work to improve our guest services.`;
      }
      setReplyText(draft);
      toast.success("AI draft populated!");
    }, 600);
  };

  // Photo uploads
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !homestay) return;
    try {
      const updatedImages = [...homestay.images, newPhotoUrl];
      const res = await fetch(`${API_URL}/api/owner/homestay/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages })
      });
      const json = await res.json();
      if (json.success) {
        setHomestay(json.data);
        setNewPhotoUrl("");
        toast.success("Photo added to listing!");
      }
    } catch (err) {
      toast.error("Failed to update photos: " + err.message);
    }
  };

  const handleDeletePhoto = async (indexToDelete) => {
    if (!homestay) return;
    try {
      const updatedImages = homestay.images.filter((_, i) => i !== indexToDelete);
      const res = await fetch(`${API_URL}/api/owner/homestay/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages })
      });
      const json = await res.json();
      if (json.success) {
        setHomestay(json.data);
        toast.success("Photo removed from listing.");
      }
    } catch (err) {
      toast.error("Failed to delete photo: " + err.message);
    }
  };

  const handleSetPrimaryPhoto = async (indexToPrimary) => {
    if (!homestay) return;
    try {
      const selected = homestay.images[indexToPrimary];
      const filtered = homestay.images.filter((_, i) => i !== indexToPrimary);
      const updatedImages = [selected, ...filtered]; // Move to index 0

      const res = await fetch(`${API_URL}/api/owner/homestay/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages })
      });
      const json = await res.json();
      if (json.success) {
        setHomestay(json.data);
        toast.success("Primary photo updated!");
      }
    } catch (err) {
      toast.error("Failed to set primary photo: " + err.message);
    }
  };

  // Coupons CRUD
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) return;
    try {
      const res = await fetch(`${API_URL}/api/owner/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountPercentage: Number(couponDiscount),
          validityDate: new Date(couponValidity || "2026-12-31")
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Coupon created successfully!");
        setCouponCode("");
        setCouponDiscount("");
        setCouponValidity("");
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to create coupon: " + err.message);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/owner/coupons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Coupon deleted.");
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to delete coupon: " + err.message);
    }
  };

  // Offers CRUD
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!offerTitle || !offerDiscount) return;
    try {
      const res = await fetch(`${API_URL}/api/owner/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: offerTitle,
          description: offerDescription,
          discountRate: Number(offerDiscount),
          validityDate: new Date(offerValidity || "2026-10-31")
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Offer package published!");
        setOfferTitle("");
        setOfferDescription("");
        setOfferDiscount("");
        setOfferValidity("");
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to publish offer: " + err.message);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/owner/offers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Offer package deleted.");
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to delete offer: " + err.message);
    }
  };

  // Notification read
  const handleMarkNotificationRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/owner/notifications/${id}/read`, { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        fetchOwnerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper date checker for Calendar
  const isDateBooked = (day) => {
    if (!homestay || !homestay.bookings) return false;
    const current = new Date(2026, 6, day); // July 2026
    return homestay.bookings.some((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return current >= start && current <= end;
    });
  };

  const getDayBookingDetails = (day) => {
    if (!bookings) return null;
    const current = new Date(2026, 6, day);
    return bookings.find((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return current >= start && current <= end;
    });
  };

  // Access Denied State
  if (isAuthorized === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-muted/10 min-h-[60vh]">
        <div className="w-full max-w-md bg-card border border-red-200 dark:border-red-900/30 rounded-3xl p-8 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-red-800 dark:text-red-400">Owner Access Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You must be signed in with an Owner Partner credentials to view this dashboard.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">
              Redirecting in <span className="font-bold text-sm text-red-800 dark:text-red-300">{countdown}s</span>...
            </p>
          </div>
          <Button onClick={() => router.push("/login")} className="w-full">Sign In as Owner</Button>
        </div>
      </div>
    );
  }

  if (isAuthorized === null || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/10 min-h-[50vh]">
        <Loader variant="spinner" size="lg" label="Loading Owner Space telemetry..." />
      </div>
    );
  }

  // Active Tab rendering methods
  const renderOverview = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Stats Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.name}</p>
              <p className="mt-2 text-2xl font-bold text-primary dark:text-primary-foreground">{stat.value}</p>
              <span className={`text-[10px] font-medium block mt-1 ${stat.change.includes("+") ? "text-green-600" : "text-amber-500"}`}>
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Visitors Chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Monthly Visitors (2026)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Visits logged for Trishul Eco-Homestay</p>
            <div className="mt-8 h-48 w-full flex items-end justify-between px-2 gap-3">
              {monthlyVisitors.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                  <span className="text-[10px] font-bold text-muted-foreground">{val}</span>
                  <div className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all duration-300" style={{ height: `${(val / 450) * 80}%` }} />
                  <span className="text-xs font-semibold text-primary mt-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue SVG Line Chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Cumulative Revenue Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Earnings across bookings (in ₹)</p>
            <div className="mt-8 h-48 w-full relative">
              {/* Dynamic SVG chart line */}
              <svg className="w-full h-36" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50,180 Q 150,150 250,120 T 450,70 T 550,20 L 550,200 L 50,200 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M 50,180 Q 150,150 250,120 T 450,70 T 550,20"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="flex justify-between text-xs font-semibold text-primary px-4 mt-2">
                <span>Jan (₹12k)</span>
                <span>Mar (₹25k)</span>
                <span>May (₹45k)</span>
                <span>Jun (₹52k)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = 31;
    const offsetDays = 2; // July 2026 starts on Wednesday (2 days offset in calendar grid)
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
        {/* Interactive Calendar view */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-primary-foreground">Availability Calendar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">July 2026. Click a day to toggle availability block status.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-100 border border-green-400" /> Available</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100 border border-red-400" /> Booked</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground uppercase border-b border-border/60 pb-3 mb-4">
            {weekdays.map(w => <div key={w}>{w}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {/* Blank offset days */}
            {Array.from({ length: offsetDays }).map((_, i) => (
              <div key={`offset-${i}`} className="h-16 rounded-xl bg-muted/20" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isBooked = isDateBooked(day);
              const bkDetails = getDayBookingDetails(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDate(day)}
                  className={`h-16 rounded-xl border p-2 flex flex-col justify-between text-left transition-all group cursor-pointer hover:shadow-sm
                    ${
                      isBooked
                        ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40 text-red-800 dark:text-red-400"
                        : "bg-green-50/20 border-green-100 dark:bg-green-950/5 dark:border-green-900/20 text-primary hover:border-primary"
                    }
                  `}
                >
                  <span className="text-xs font-bold">{day}</span>
                  {isBooked ? (
                    <span className="text-[8px] font-semibold tracking-tight truncate max-w-full block">
                      {bkDetails ? bkDetails.guestName : "Blocked"}
                    </span>
                  ) : (
                    <span className="text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Block</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Bookings list */}
        <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-primary dark:text-primary-foreground border-b border-border/60 pb-3">Upcoming Guest Reservations</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {bookings.map((b, idx) => (
              <div key={idx} className="bg-muted/40 dark:bg-muted/10 border border-border/50 p-4 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-primary dark:text-primary-foreground">{b.guestName}</h4>
                    <p className="text-[10px] text-muted-foreground">{b.guestEmail}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {b.status}
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] font-medium border-t border-border/20 pt-2 text-muted-foreground">
                  <span>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</span>
                  <span className="font-bold text-primary dark:text-primary-foreground">₹{b.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h3 className="text-lg font-bold text-primary dark:text-primary-foreground">Guest Feedback & Response Desk</h3>
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((rev, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-muted px-2.5 py-1 rounded-full border border-border/50">
                    {rev.source}
                  </span>
                  <span className="text-xs text-muted-foreground">{rev.date}</span>
                  <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    rev.sentiment === "Positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                      : rev.sentiment === "Neutral"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
                      : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {rev.sentiment}
                  </span>
                  <span className="text-xs font-bold text-accent">#{rev.theme.toLowerCase()}</span>
                </div>
                <p className="text-sm italic text-foreground leading-relaxed">"{rev.text}"</p>
                
                {rev.response ? (
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Your response:</span>
                    <p className="text-xs text-muted-foreground leading-normal">{rev.response}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-amber-700">No response logged yet. AI suggestion ready.</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedReview(rev);
                        setIsReplyModalOpen(true);
                      }}
                    >
                      Reply Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Modal */}
        <Modal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setReplyText("");
          }}
          title="Compose Host Reply"
        >
          {selectedReview && (
            <form onSubmit={handleReplySubmit} className="space-y-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Guest Feedback</span>
                <p className="text-xs italic bg-muted border border-border/40 p-4 rounded-xl mt-1">"{selectedReview.text}"</p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary">Response Draft</span>
                <Button variant="outline" size="sm" onClick={() => generateAiReply(selectedReview)}>
                  🪄 Generate AI Draft
                </Button>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your Kumaoni hospitality reply..."
                rows={5}
                className="w-full rounded-xl border border-border bg-background p-4 text-xs shadow-inner focus:outline-none focus:border-primary text-foreground"
                required
              />

              <div className="flex gap-3 pt-4 border-t border-border/60">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsReplyModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 text-xs">Publish Response</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    );
  };

  const renderPhotos = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-primary dark:text-primary-foreground">Photo Management</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage gallery images displayed on search detail listings.</p>
          </div>
          
          <form onSubmit={handleAddPhoto} className="flex gap-2">
            <Input
              id="new-photo"
              placeholder="Paste photo URL here..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="text-xs"
            />
            <Button type="submit" size="sm">Add Photo</Button>
          </form>
        </div>

        {homestay && homestay.images && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homestay.images.map((img, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-border group bg-card shadow-sm hover:shadow-md transition-shadow">
                <img src={img} alt={`Listing ${idx}`} className="w-full h-36 object-cover" />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5 rounded">
                    Primary Cover
                  </span>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                  {idx !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-[10px] py-1 border-white hover:bg-white text-white hover:text-primary"
                      onClick={() => handleSetPrimaryPhoto(idx)}
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] py-1 border-red-500 hover:bg-red-500 text-red-500 hover:text-white"
                    onClick={() => handleDeletePhoto(idx)}
                  >
                    Delete Photo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMarketing = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
        {/* Coupons section */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Coupons Center</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage discounts codes for guest bookings.</p>
          </div>

          <form onSubmit={handleCreateCoupon} className="grid grid-cols-3 gap-3 items-end bg-muted/40 p-4 rounded-2xl">
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Code</label>
              <input
                type="text"
                placeholder="e.g. MONSOON"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                required
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount (%)</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                min="5"
                max="90"
                required
              />
            </div>
            <div className="col-span-1">
              <Button type="submit" size="sm" className="w-full text-xs py-2">Create</Button>
            </div>
          </form>

          <div className="space-y-3">
            {coupons.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between border border-border/60 p-4 rounded-xl">
                <div>
                  <span className="text-sm font-bold bg-accent/10 text-accent px-2.5 py-1 rounded-md">{c.code}</span>
                  <p className="text-xs text-muted-foreground mt-2">
                    {c.discountPercentage}% discount • Exp {new Date(c.validityDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30"
                  onClick={() => handleDeleteCoupon(c._id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Offers section */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-primary dark:text-primary-foreground">Active Packages & Offers</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Promotional highlights shown to users on booking pages.</p>
          </div>

          <form onSubmit={handleCreateOffer} className="space-y-3 bg-muted/40 p-4 rounded-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Package Title</label>
                <input
                  type="text"
                  placeholder="e.g. Winter Special"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={offerDiscount}
                  onChange={(e) => setOfferDiscount(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <textarea
                placeholder="Enter offer inclusions..."
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-primary text-foreground"
                rows={2}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm">Publish Package</Button>
            </div>
          </form>

          <div className="space-y-3">
            {offers.map((o, idx) => (
              <div key={idx} className="border border-border/60 p-4 rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-primary dark:text-primary-foreground">{o.title}</h4>
                  <p className="text-xs text-muted-foreground">{o.description}</p>
                  <span className="inline-block text-[10px] text-accent font-semibold">₹{o.discountRate} off</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30"
                  onClick={() => handleDeleteOffer(o._id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary dark:text-primary-foreground">Alerts & System Notifications</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Keep track of guest booking requests and feedback alerts.</p>
          </div>
          <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md">
            {notifications.filter(n => !n.read).length} Unread
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {notifications.map((notif, idx) => (
            <div
              key={idx}
              className={`py-4 flex items-center justify-between gap-4 transition-colors ${
                notif.read ? "opacity-75" : "bg-primary/5 rounded-xl px-4 border border-primary/10 my-2"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center
                  ${
                    notif.type === "booking"
                      ? "bg-blue-50 text-blue-600"
                      : notif.type === "review"
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }
                `}>
                  {notif.type === "booking" ? "📅" : notif.type === "review" ? "💬" : "⚙️"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {!notif.read && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] py-1 border-primary/20 hover:bg-primary/10 text-primary"
                  onClick={() => handleMarkNotificationRead(notif._id)}
                >
                  Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full min-h-[70vh]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border p-6 space-y-6 hidden md:block">
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Host Workspace</h2>
          {homestay && <p className="text-base font-bold text-primary mt-1">{homestay.name}</p>}
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", name: "Overview Dashboard", icon: "📊" },
            { id: "calendar", name: "Calendar & Booking", icon: "📅" },
            { id: "reviews", name: "Guest Reviews", icon: "💬" },
            { id: "photos", name: "Photo Manager", icon: "🖼️" },
            { id: "marketing", name: "Marketing Codes", icon: "🏷️" },
            { id: "notifications", name: "Alerts Desk", icon: "🔔" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left rounded-xl px-4.5 py-3 text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer
                ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-x-hidden">
        {/* Mobile Navigation bar */}
        <div className="md:hidden border border-border p-3 rounded-2xl bg-card flex justify-around mb-4 text-lg">
          <button onClick={() => setActiveTab("overview")} title="Overview">📊</button>
          <button onClick={() => setActiveTab("calendar")} title="Calendar">📅</button>
          <button onClick={() => setActiveTab("reviews")} title="Reviews">💬</button>
          <button onClick={() => setActiveTab("photos")} title="Photos">🖼️</button>
          <button onClick={() => setActiveTab("marketing")} title="Marketing">🏷️</button>
          <button onClick={() => setActiveTab("notifications")} title="Alerts">🔔</button>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "calendar" && renderCalendar()}
        {activeTab === "reviews" && renderReviews()}
        {activeTab === "photos" && renderPhotos()}
        {activeTab === "marketing" && renderMarketing()}
        {activeTab === "notifications" && renderNotifications()}
      </main>
    </div>
  );
}
