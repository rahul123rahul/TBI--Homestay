import mongoose from "mongoose";
import { seedHomestaysData, seedReviewsData } from "../seed.js";

let mockHomestays = null;
let mockReviews = null;

export function initMockStore() {
  if (mockHomestays && mockReviews) return;

  console.log("[Mock Store] Initializing offline in-memory fallback database...");

  // 1. Initialize mock homestays and assign mongoose ObjectIds
  mockHomestays = seedHomestaysData.map((h, index) => {
    // Generate static deterministic ObjectId strings based on index for stability
    const mockId = new mongoose.Types.ObjectId();
    return {
      ...h,
      _id: mockId,
      rating: h.rating || 4.8,
      reviewsCount: h.reviewsCount || (index === 0 ? 6 : 2),
      aiReviewSummary: h.aiReviewSummary || `This property is highly recommended for its excellent location in ${h.location.split(",")[0]}.`
    };
  });

  // 2. Initialize mock reviews and link them to Trishul Eco-Homestay (index 0)
  const trishulId = mockHomestays[0]._id;
  mockReviews = seedReviewsData.map((r, index) => ({
    ...r,
    _id: new mongoose.Types.ObjectId(),
    homestay: trishulId,
    helpfulVotes: index * 3 + 1,
    spamScore: index === 3 ? 84 : 12,
    isVerifiedStay: index !== 4
  }));

  // 3. Add sample reviews for the remaining homestays to make stats look good
  let nextId = 7;
  for (let i = 1; i < mockHomestays.length; i++) {
    const homestay = mockHomestays[i];
    const rating1 = 4 + (i % 2);
    mockReviews.push({
      _id: new mongoose.Types.ObjectId(),
      id: String(nextId++),
      date: "June 25, 2026",
      source: "Direct Feedback",
      text: `Extremely wonderful homestay. The location in ${homestay.location.split(",")[0]} was beautiful, amenities were spot on, and the host was very friendly.`,
      sentiment: "Positive",
      theme: "Host",
      score: 95,
      overallRating: rating1,
      ratings: { cleanliness: rating1, hospitality: 5, food: 4, location: 5, value: rating1, comfort: 5, wifi: 4, safety: 5 },
      travelType: "Couple",
      stayedDuring: "2026-06",
      recommend: true,
      homestay: homestay._id,
      helpfulVotes: 2,
      spamScore: 8,
      isVerifiedStay: true
    });
  }
}

export function getMockHomestays() {
  initMockStore();
  return mockHomestays;
}

export function getMockReviews() {
  initMockStore();
  return mockReviews;
}

export function addMockReview(homestayId, reviewData) {
  initMockStore();
  const homestayIndex = mockHomestays.findIndex(h => String(h._id) === String(homestayId));
  if (homestayIndex === -1) {
    throw new Error(`Homestay with ID ${homestayId} not found.`);
  }

  const newReview = {
    _id: new mongoose.Types.ObjectId(),
    id: String(mockReviews.length + 1000),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    source: reviewData.source || "Direct Feedback",
    text: reviewData.text,
    overallRating: Number(reviewData.overallRating),
    ratings: {
      cleanliness: Number(reviewData.ratings?.cleanliness || 5),
      hospitality: Number(reviewData.ratings?.hospitality || 5),
      food: Number(reviewData.ratings?.food || 5),
      location: Number(reviewData.ratings?.location || 5),
      value: Number(reviewData.ratings?.value || 5),
      comfort: Number(reviewData.ratings?.comfort || 5),
      wifi: Number(reviewData.ratings?.wifi || 5),
      safety: Number(reviewData.ratings?.safety || 5)
    },
    travelType: reviewData.travelType || "Solo",
    stayedDuring: reviewData.stayedDuring || new Date().toISOString().substring(0, 7),
    recommend: reviewData.recommend === undefined ? true : Boolean(reviewData.recommend),
    homestay: mockHomestays[homestayIndex]._id,
    ...reviewData.classification
  };

  mockReviews.push(newReview);

  // Recalculate rating stats
  const reviews = mockReviews.filter(r => String(r.homestay) === String(mockHomestays[homestayIndex]._id));
  const ratingSum = reviews.reduce((sum, r) => sum + r.overallRating, 0);
  mockHomestays[homestayIndex].rating = parseFloat((ratingSum / reviews.length).toFixed(1));
  mockHomestays[homestayIndex].reviewsCount = reviews.length;

  return newReview;
}

export function addMockBooking(homestayId, startDate, endDate) {
  initMockStore();
  const homestay = mockHomestays.find(h => String(h._id) === String(homestayId));
  if (!homestay) {
    throw new Error(`Homestay with ID ${homestayId} not found.`);
  }

  if (!homestay.bookings) homestay.bookings = [];
  const newBooking = {
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  };
  homestay.bookings.push(newBooking);
  return homestay.bookings;
}

export function addMockQA(homestayId, question, askedBy) {
  initMockStore();
  const homestay = mockHomestays.find(h => String(h._id) === String(homestayId));
  if (!homestay) {
    throw new Error(`Homestay with ID ${homestayId} not found.`);
  }

  if (!homestay.questionsAndAnswers) homestay.questionsAndAnswers = [];
  const newQA = {
    question,
    askedBy: askedBy || "Anonymous Guest",
    createdAt: new Date()
  };
  homestay.questionsAndAnswers.push(newQA);
  return newQA;
}
