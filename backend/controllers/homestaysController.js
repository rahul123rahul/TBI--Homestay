import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Homestay from "../models/Homestay.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";
import { getMockHomestays, getMockReviews, addMockReview, addMockBooking, addMockQA } from "../config/mockStore.js";

dotenv.config();

// Helper: Heuristic Rule Classifier
function classifyReviewHeuristic(text) {
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return null;

  let sentiment = "Positive";
  let theme = "Experience";
  let response = "";
  let score = 90; // Default positive score

  if (
    cleanText.includes("clean") ||
    cleanText.includes("dirty") ||
    cleanText.includes("dust") ||
    cleanText.includes("washroom") ||
    cleanText.includes("bathroom") ||
    cleanText.includes("toilet") ||
    cleanText.includes("linen") ||
    cleanText.includes("sheet") ||
    cleanText.includes("towel")
  ) {
    theme = "Cleanliness";
    if (cleanText.includes("dirty") || cleanText.includes("dust") || cleanText.includes("disappoint") || cleanText.includes("smell") || cleanText.includes("bad")) {
      sentiment = "Negative";
      score = 35;
      response = "We apologize sincerely for the cleanliness issue. We have addressed this immediately with our housekeeping team to prevent recurrence.";
    } else {
      response = "Thank you! We pride ourselves on maintaining clean and comfortable spaces for our eco-homestay guests.";
    }
  } else if (
    cleanText.includes("food") ||
    cleanText.includes("spicy") ||
    cleanText.includes("cook") ||
    cleanText.includes("breakfast") ||
    cleanText.includes("dinner") ||
    cleanText.includes("kitchen") ||
    cleanText.includes("meal") ||
    cleanText.includes("tea") ||
    cleanText.includes("coffee")
  ) {
    theme = "Food";
    if (cleanText.includes("spicy") || cleanText.includes("bad") || cleanText.includes("cold") || cleanText.includes("slow") || cleanText.includes("expensive")) {
      sentiment = "Neutral";
      score = 68;
      response = "Thank you for the feedback on our meals. We will adjust our spice levels and kitchen operations to better suit our guests' tastes.";
    } else {
      response = "We're glad you enjoyed our local cuisine! Our kitchen takes great pride in preparing fresh, home-cooked Kumaoni meals.";
    }
  } else if (
    cleanText.includes("host") ||
    cleanText.includes("owner") ||
    cleanText.includes("caretaker") ||
    cleanText.includes("staff") ||
    cleanText.includes("people") ||
    cleanText.includes("hospitality") ||
    cleanText.includes("family") ||
    cleanText.includes("uncle") ||
    cleanText.includes("aunty")
  ) {
    theme = "Host";
    if (cleanText.includes("rude") || cleanText.includes("unhelpful") || cleanText.includes("slow")) {
      sentiment = "Negative";
      score = 30;
      response = "We are deeply sorry for your experience. We are retraining our team to ensure our guest service is warm and helpful.";
    } else {
      response = "Namaskar! Thank you so much. Our hosts strive to provide a warm, personalized family experience for every guest.";
    }
  } else if (
    cleanText.includes("view") ||
    cleanText.includes("location") ||
    cleanText.includes("far") ||
    cleanText.includes("peaceful") ||
    cleanText.includes("mountain") ||
    cleanText.includes("hills") ||
    cleanText.includes("peaks") ||
    cleanText.includes("road") ||
    cleanText.includes("path") ||
    cleanText.includes("noise")
  ) {
    theme = "Location";
    if (cleanText.includes("far") || cleanText.includes("hard to find") || cleanText.includes("isolated") || cleanText.includes("narrow") || cleanText.includes("steep")) {
      sentiment = "Neutral";
      score = 70;
      response = "Thank you. Our secluded mountain location is chosen for peace and quiet, and we are working to make our driving directions clearer.";
    } else {
      response = "The Himalayan mountain views are indeed breathtaking! We're glad you enjoyed our serene and peaceful location.";
    }
  } else if (
    cleanText.includes("value") ||
    cleanText.includes("price") ||
    cleanText.includes("expensive") ||
    cleanText.includes("cost") ||
    cleanText.includes("money") ||
    cleanText.includes("worth") ||
    cleanText.includes("bill")
  ) {
    theme = "Value";
    if (cleanText.includes("expensive") || cleanText.includes("overpriced") || cleanText.includes("high price")) {
      sentiment = "Negative";
      score = 40;
      response = "We appreciate your feedback regarding our rates. We strive to offer unique eco-stays and are continuously enhancing our facilities to provide better value.";
    } else {
      response = "Thank you for your feedback. We are glad you found our eco-homestay experience well worth the value.";
    }
  } else {
    // Default Experience
    if (cleanText.includes("disappointed") || cleanText.includes("worst") || cleanText.includes("terrible") || cleanText.includes("horrible")) {
      sentiment = "Negative";
      score = 25;
      response = "We apologize sincerely that your stay fell short of expectations. We would love to get more details to resolve your concerns.";
    } else if (cleanText.includes("okay") || cleanText.includes("average") || cleanText.includes("fine")) {
      sentiment = "Neutral";
      score = 60;
      response = "Thank you for your review. We are continuously improving our eco-stay and hope to offer a better experience next time.";
    } else {
      response = "Thank you for sharing your experience with us! We look forward to welcoming you back to Trishul Eco-Homestays in the future.";
    }
  }

  return { text, sentiment, theme, response, score };
}

// Helper: Gemini API Classifier
async function classifyReviewGemini(text, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a hospitality intelligence assistant for Trishul Eco-Homestays in the Himalayas.
Analyze the following review:
"${text}"

Determine:
1. Sentiment: "Positive", "Neutral", or "Negative".
2. Theme: Choose the primary topic from: "Food", "Host", "Location", "Cleanliness", "Value", or "Experience".
3. Score: A guest satisfaction score from 0 to 100 based on the tone and content.
4. Suggested Response: Draft a one-line professional and welcoming response to the guest reflecting traditional Kumaoni hospitality. Address specific points (e.g. if cleanliness is negative, be apologetic; if host is positive, say "Namaskar" and thank them).

Output the result in JSON format.`;

  const responseSchema = {
    type: "object",
    properties: {
      sentiment: { type: "string", enum: ["Positive", "Neutral", "Negative"] },
      theme: { type: "string", enum: ["Food", "Host", "Location", "Cleanliness", "Value", "Experience"] },
      score: { type: "integer" },
      response: { type: "string" }
    },
    required: ["sentiment", "theme", "score", "response"]
  };

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1
    }
  });

  const parsed = JSON.parse(result.response.text());
  return {
    text,
    sentiment: parsed.sentiment,
    theme: parsed.theme,
    score: parsed.score,
    response: parsed.response
  };
}

// 1. GET /api/homestays - Retrieve list of homestays (with category filter / location search)
export const getHomestays = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockList = getMockHomestays();
      const { category, search, minPrice, maxPrice, minRating } = req.query;
      let result = [...mockList];
      
      if (category && category !== "all" && category !== "Top Rated") {
        result = result.filter(h => h.category.toLowerCase() === category.toLowerCase());
      }
      if (minPrice) {
        result = result.filter(h => h.startingPrice >= Number(minPrice));
      }
      if (maxPrice) {
        result = result.filter(h => h.startingPrice <= Number(maxPrice));
      }
      if (minRating) {
        result = result.filter(h => h.rating >= Number(minRating));
      }
      if (search) {
        const cleanSearch = search.toLowerCase();
        result = result.filter(h => 
          h.name.toLowerCase().includes(cleanSearch) ||
          h.location.toLowerCase().includes(cleanSearch) ||
          h.description.toLowerCase().includes(cleanSearch)
        );
      }
      if (category === "Top Rated") {
        result.sort((a, b) => b.rating - a.rating);
      }
      
      const mockRevList = getMockReviews();
      const resultWithReviews = result.map(h => {
        const latest = mockRevList
          .filter(r => String(r.homestay) === String(h._id))
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        return {
          ...h,
          latestReview: latest ? {
            rating: latest.overallRating,
            text: latest.text,
            guestName: latest.travelType + " Travelers"
          } : null
        };
      });
      
      return res.status(200).json({ success: true, count: resultWithReviews.length, data: resultWithReviews });
    }

    const { category, search, minPrice, maxPrice, minRating, amenities, freeCancellation } = req.query;
    const query = {};

    if (category && category !== "all" && category !== "Top Rated") {
      query.category = category;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Amenities Filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(",").map(a => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Free Cancellation Filter (mocked check)
    if (freeCancellation === "true") {
      query.rules = { $not: /no cancellation/i };
    }

    // Smart Search NLP keyword mapping
    if (search) {
      const cleanSearch = search.toLowerCase();
      const orConditions = [];

      if (cleanSearch.includes("mountain") || cleanSearch.includes("hill") || cleanSearch.includes("peak")) {
        orConditions.push({ category: "Mountain" });
      }
      if (cleanSearch.includes("beach") || cleanSearch.includes("ocean") || cleanSearch.includes("sea")) {
        orConditions.push({ category: "Beach" });
      }
      if (cleanSearch.includes("lake") || cleanSearch.includes("river") || cleanSearch.includes("waterfront")) {
        orConditions.push({ category: "Lake View" });
      }
      if (cleanSearch.includes("farm") || cleanSearch.includes("estate") || cleanSearch.includes("coffee") || cleanSearch.includes("tea")) {
        orConditions.push({ category: "Farm Stay" });
      }
      if (cleanSearch.includes("heritage") || cleanSearch.includes("colonial") || cleanSearch.includes("villa")) {
        orConditions.push({ category: "Heritage" });
      }
      if (cleanSearch.includes("luxury") || cleanSearch.includes("premium")) {
        orConditions.push({ category: "Luxury" });
      }
      if (cleanSearch.includes("budget") || cleanSearch.includes("cheap") || cleanSearch.includes("affordable")) {
        orConditions.push({ category: "Budget" });
      }
      if (cleanSearch.includes("pet") || cleanSearch.includes("dog") || cleanSearch.includes("cat")) {
        orConditions.push({ category: "Pet Friendly" });
      }

      const searchRegex = new RegExp(search, "i");
      orConditions.push({ name: searchRegex });
      orConditions.push({ location: searchRegex });
      orConditions.push({ description: searchRegex });
      orConditions.push({ amenities: searchRegex });

      query.$or = orConditions;
    }

    let homestays = await Homestay.find(query);

    // If Top Rated category is selected, sort by rating desc and take top ones
    if (category === "Top Rated") {
      homestays = await Homestay.find(query).sort({ rating: -1 });
    }

    // Attach latest review comment snippet for each card to satisfy front-end requirement
    const homestaysWithReviews = await Promise.all(
      homestays.map(async (h) => {
        const latestReview = await Review.findOne({ homestay: h._id }).sort({ createdAt: -1 });
        const hObj = h.toObject();
        hObj.latestReview = latestReview
          ? {
              rating: latestReview.overallRating,
              text: latestReview.text,
              guestName: latestReview.travelType + " Travelers"
            }
          : null;
        return hObj;
      })
    );

    res.status(200).json({ success: true, count: homestaysWithReviews.length, data: homestaysWithReviews });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/homestays/:id - Retrieve a single homestay details with populate reviews
export const getHomestayById = async (req, res, next) => {
  try {
    const homestayId = req.params.id;
    if (mongoose.connection.readyState !== 1) {
      const mockList = getMockHomestays();
      const homestay = mockList.find(h => String(h._id) === String(homestayId));
      if (!homestay) {
        return res.status(404).json({ success: false, error: `Homestay with ID ${homestayId} not found.` });
      }
      const mockRevList = getMockReviews();
      const reviews = mockRevList
        .filter(r => String(r.homestay) === String(homestay._id))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
        
      return res.status(200).json({ success: true, data: { ...homestay, reviews } });
    }

    let homestay = null;

    if (mongoose.Types.ObjectId.isValid(homestayId)) {
      homestay = await Homestay.findById(homestayId);
    }

    if (!homestay) {
      return res.status(404).json({ success: false, error: `Homestay with ID ${homestayId} not found.` });
    }

    // Fetch related reviews
    const reviews = await Review.find({ homestay: homestay._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { ...homestay.toObject(), reviews } });
  } catch (error) {
    next(error);
  }
};

// 3. POST /api/homestays/:id/reviews - Submit a guest review (runs sentiment analysis)
export const createHomestayReview = async (req, res, next) => {
  try {
    const homestayId = req.params.id;
    const {
      overallRating,
      ratings,
      text,
      travelType,
      stayedDuring,
      recommend,
      images,
      videos,
      source,
      date
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Review 'text' comment is required." });
    }
    if (!overallRating || !ratings) {
      return res.status(400).json({ success: false, error: "Overall rating and sub-ratings object are required." });
    }

    // Run classifier on text (W4/W5 AI Integration)
    const apiKey = process.env.GEMINI_API_KEY;
    let classification;

    if (apiKey) {
      try {
        console.log("[HomestaysController] Classifying via Gemini API...");
        classification = await classifyReviewGemini(text, apiKey);
      } catch (err) {
        console.error("[HomestaysController] Gemini API failed, falling back to heuristics:", err.message);
        classification = classifyReviewHeuristic(text);
      }
    } else {
      classification = classifyReviewHeuristic(text);
    }

    if (mongoose.connection.readyState !== 1) {
      try {
        const newReview = addMockReview(homestayId, {
          overallRating,
          ratings,
          text,
          travelType,
          stayedDuring,
          recommend,
          images,
          videos,
          source,
          date,
          classification
        });
        return res.status(201).json({ success: true, data: newReview });
      } catch (err) {
        return res.status(404).json({ success: false, error: err.message });
      }
    }

    let homestay = null;

    if (mongoose.Types.ObjectId.isValid(homestayId)) {
      homestay = await Homestay.findById(homestayId);
    }

    if (!homestay) {
      return res.status(404).json({ success: false, error: `Homestay with ID ${homestayId} not found.` });
    }

    // Generate custom numeric sequential ID
    const allReviews = await Review.find({}, { id: 1 });
    const numericIds = allReviews
      .map(r => parseInt(r.id))
      .filter(id => !isNaN(id));
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    const newId = String(maxId + 1);

    const newReview = new Review({
      id: newId,
      date: date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      source: source || "Direct Feedback",
      text,
      overallRating: Number(overallRating),
      ratings: {
        cleanliness: Number(ratings.cleanliness || 5),
        hospitality: Number(ratings.hospitality || 5),
        food: Number(ratings.food || 5),
        location: Number(ratings.location || 5),
        value: Number(ratings.value || 5),
        comfort: Number(ratings.comfort || 5),
        wifi: Number(ratings.wifi || 5),
        safety: Number(ratings.safety || 5)
      },
      images: images || [],
      videos: videos || [],
      travelType: travelType || "Solo",
      stayedDuring: stayedDuring || new Date().toISOString().substring(0, 7),
      recommend: recommend === undefined ? true : Boolean(recommend),
      homestay: homestay._id,
      ...classification
    });

    await newReview.save();

    // Recalculate average rating and review count for the Homestay
    const reviews = await Review.find({ homestay: homestay._id });
    const ratingSum = reviews.reduce((sum, r) => sum + r.overallRating, 0);
    homestay.rating = parseFloat((ratingSum / reviews.length).toFixed(1));
    homestay.reviewsCount = reviews.length;
    await homestay.save();

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/homestays/:id/bookings - Book a date range for a homestay
export const createHomestayBooking = async (req, res, next) => {
  try {
    const homestayId = req.params.id;
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Both 'startDate' and 'endDate' are required." });
    }

    if (mongoose.connection.readyState !== 1) {
      try {
        const bookings = addMockBooking(homestayId, startDate, endDate);
        return res.status(200).json({ success: true, message: "Booking confirmed successfully!", data: bookings });
      } catch (err) {
        return res.status(404).json({ success: false, error: err.message });
      }
    }

    const homestay = await Homestay.findById(homestayId);

    if (!homestay) {
      return res.status(404).json({ success: false, error: `Homestay with ID ${homestayId} not found.` });
    }

    homestay.bookings.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    await homestay.save();

    res.status(200).json({ success: true, message: "Booking confirmed successfully!", data: homestay.bookings });
  } catch (error) {
    next(error);
  }
};

// 5. POST /api/homestays/:id/questions - Submit a guest question
export const createHomestayQA = async (req, res, next) => {
  try {
    const homestayId = req.params.id;
    const { question, askedBy } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: "Question content is required." });
    }

    if (mongoose.connection.readyState !== 1) {
      try {
        const newQA = addMockQA(homestayId, question, askedBy);
        return res.status(201).json({ success: true, data: newQA });
      } catch (err) {
        return res.status(404).json({ success: false, error: err.message });
      }
    }

    const homestay = await Homestay.findById(homestayId);

    if (!homestay) {
      return res.status(404).json({ success: false, error: `Homestay with ID ${homestayId} not found.` });
    }

    homestay.questionsAndAnswers.push({
      question,
      askedBy: askedBy || "Anonymous Guest",
      createdAt: new Date()
    });

    await homestay.save();

    res.status(201).json({ success: true, data: homestay.questionsAndAnswers[homestay.questionsAndAnswers.length - 1] });
  } catch (error) {
    next(error);
  }
};

// 6. POST /api/homestays - Add a new homestay (Admin / Staff use)
export const createHomestay = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockList = getMockHomestays();
      const newHomestay = {
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        rating: 5.0,
        reviewsCount: 0,
        bookings: [],
        questionsAndAnswers: []
      };
      mockList.push(newHomestay);
      return res.status(201).json({ success: true, data: newHomestay });
    }

    const homestay = await Homestay.create(req.body);
    res.status(201).json({ success: true, data: homestay });
  } catch (error) {
    next(error);
  }
};
