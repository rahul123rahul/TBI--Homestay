import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// In-memory Database Store
let reviews = [
  {
    id: "1",
    date: "June 18, 2026",
    source: "Airbnb",
    text: "The Himalayan peaks were visible right from the wooden balcony! Exceeded expectations.",
    sentiment: "Positive",
    theme: "Location",
    score: 95,
    response: "The Himalayan mountain views are indeed breathtaking! We are thrilled you enjoyed the wooden balcony views."
  },
  {
    id: "2",
    date: "June 17, 2026",
    source: "Booking.com",
    text: "Food was highly delicious and fresh, but room cleaning was done late in the afternoon.",
    sentiment: "Neutral",
    theme: "Food",
    score: 72,
    response: "Thank you for praising our local cuisine! We will adjust our cleanliness timings to ensure room updates occur earlier."
  },
  {
    id: "3",
    date: "June 15, 2026",
    source: "Google",
    text: "The hosts treated us like their own family. Extremely warm gestures and local insights.",
    sentiment: "Positive",
    theme: "Host",
    score: 98,
    response: "Thank you so much! Our hosts strive to provide a warm, personalized family experience for every guest."
  },
  {
    id: "4",
    date: "June 14, 2026",
    source: "Airbnb",
    text: "Water heater wasn't working on the first day, took several hours to fix.",
    sentiment: "Negative",
    theme: "Cleanliness",
    score: 41,
    response: "We apologize sincerely for the hot water issue. We have fixed the heater unit immediately with our technician."
  },
  {
    id: "5",
    date: "June 10, 2026",
    source: "Booking.com",
    text: "Lovely wooden cottage feel, but the room cost was a bit steep compared to other homestays nearby.",
    sentiment: "Neutral",
    theme: "Value",
    score: 65,
    response: "Thank you for your feedback regarding our rates. We strive to offer unique eco-stays and are continuously enhancing our facilities to provide better value."
  },
  {
    id: "6",
    date: "June 08, 2026",
    source: "Google",
    text: "Wonderful service! The caretaker took us on a guided village walk. Will visit again.",
    sentiment: "Positive",
    theme: "Host",
    score: 96,
    response: "Namaskar! Thank you so much. Our hosts strive to provide a warm, personalized family experience for every guest."
  }
];

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

// Controller Actions

// 1. GET /api/reviews - List all reviews (with optional sentiment/theme filters)
export const getReviews = async (req, res, next) => {
  try {
    const { sentiment, theme } = req.query;
    let filtered = [...reviews];

    if (sentiment) {
      filtered = filtered.filter(r => r.sentiment.toLowerCase() === sentiment.toLowerCase());
    }
    if (theme) {
      filtered = filtered.filter(r => r.theme.toLowerCase() === theme.toLowerCase());
    }

    // Sort by id descending (newest reviews first)
    filtered.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/reviews/search - Search reviews by text or source
export const searchReviews = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: "Search query param 'q' is required." });
    }

    const query = q.toLowerCase();
    const filtered = reviews.filter(
      r => r.text.toLowerCase().includes(query) || r.source.toLowerCase().includes(query)
    );

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
};

// 3. GET /api/reviews/:id - Get a single review
export const getReviewById = async (req, res, next) => {
  try {
    const review = reviews.find(r => r.id === req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: `Review with ID ${req.params.id} not found.` });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// 4. POST /api/reviews - Create a new review (runs classifier, appends, returns 201)
export const createReview = async (req, res, next) => {
  try {
    const { text, source, date } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Review 'text' is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let classification;

    if (apiKey) {
      try {
        console.log("[Controller] Classifying via Gemini API...");
        classification = await classifyReviewGemini(text, apiKey);
      } catch (err) {
        console.error("[Controller] Gemini API failed, falling back to heuristics:", err.message);
        classification = classifyReviewHeuristic(text);
      }
    } else {
      classification = classifyReviewHeuristic(text);
    }

    const newReview = {
      id: String(reviews.length > 0 ? Math.max(...reviews.map(r => parseInt(r.id))) + 1 : 1),
      date: date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      source: source || "Direct Feedback",
      ...classification
    };

    reviews.push(newReview);
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

// 5. POST /api/reviews/analyze - Batch analyze reviews (used in Main Console)
export const bulkAnalyzeReviews = async (req, res, next) => {
  try {
    const { reviews: inputReviews, source } = req.body;

    if (!inputReviews || !Array.isArray(inputReviews)) {
      return res.status(400).json({ success: false, error: "An array of 'reviews' is required in the body." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const results = [];
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const nextIdStart = reviews.length > 0 ? Math.max(...reviews.map(r => parseInt(r.id))) + 1 : 1;

    for (let i = 0; i < inputReviews.length; i++) {
      const text = inputReviews[i];
      if (!text || !text.trim()) continue;

      let classification;
      if (apiKey) {
        try {
          classification = await classifyReviewGemini(text, apiKey);
        } catch (err) {
          classification = classifyReviewHeuristic(text);
        }
      } else {
        classification = classifyReviewHeuristic(text);
      }

      const newReview = {
        id: String(nextIdStart + i),
        date: dateStr,
        source: source || "Console Upload",
        ...classification
      };

      reviews.push(newReview);
      results.push(newReview);
    }

    res.status(201).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

// 6. PUT /api/reviews/:id - Update review details
export const updateReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const index = reviews.findIndex(r => r.id === reviewId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: `Review with ID ${reviewId} not found.` });
    }

    const { sentiment, theme, response, text, source, score } = req.body;

    // Apply overrides or keep original
    reviews[index] = {
      ...reviews[index],
      ...(sentiment && { sentiment }),
      ...(theme && { theme }),
      ...(response !== undefined && { response }),
      ...(text && { text }),
      ...(source && { source }),
      ...(score !== undefined && { score: Number(score) })
    };

    res.status(200).json({ success: true, data: reviews[index] });
  } catch (error) {
    next(error);
  }
};

// 7. DELETE /api/reviews/:id - Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const index = reviews.findIndex(r => r.id === reviewId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: `Review with ID ${reviewId} not found.` });
    }

    reviews.splice(index, 1);
    res.status(204).end(); // No Content response on deletion
  } catch (error) {
    next(error);
  }
};

// 8. GET /api/reviews/stats - Get dynamic dashboard metrics
export const getStats = async (req, res, next) => {
  try {
    const totalReviews = reviews.length;

    // 1. Calculate Average Sentiment Score
    const totalScore = reviews.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScoreRaw = totalReviews > 0 ? (totalScore / totalReviews) / 20 : 0; // Scale to out of 5
    const averageSentiment = `${averageScoreRaw.toFixed(1)} / 5.0`;

    // 2. Response Rate (<24h)
    const respondedReviews = reviews.filter(r => r.response && r.response.trim().length > 0).length;
    const responseRate = totalReviews > 0 ? `${((respondedReviews / totalReviews) * 100).toFixed(1)}%` : "0.0%";

    // 3. Primary Booking Source
    const sources = {};
    reviews.forEach(r => {
      sources[r.source] = (sources[r.source] || 0) + 1;
    });
    let primarySource = "None";
    let maxCount = 0;
    Object.entries(sources).forEach(([src, count]) => {
      if (count > maxCount) {
        maxCount = count;
        primarySource = src;
      }
    });
    const sourcePercentage = totalReviews > 0 ? Math.round((maxCount / totalReviews) * 100) : 0;
    const primarySourceLabel = totalReviews > 0 
      ? `${primarySource} (${sourcePercentage}% of reviews)` 
      : "No reviews";

    // 4. Sentiment counts
    const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
    reviews.forEach(r => {
      if (sentiments[r.sentiment] !== undefined) {
        sentiments[r.sentiment]++;
      }
    });

    // 5. Theme Distribution counts
    const themeMap = {
      Host: { name: "Host & Staff", count: 0 },
      Food: { name: "Food & Meals", count: 0 },
      Location: { name: "Location & Views", count: 0 },
      Cleanliness: { name: "Cleanliness", count: 0 },
      Value: { name: "Value & Price", count: 0 },
      Experience: { name: "General Experience", count: 0 }
    };

    reviews.forEach(r => {
      if (themeMap[r.theme]) {
        themeMap[r.theme].count++;
      } else {
        themeMap.Experience.count++; // Fallback for experience or custom themes
      }
    });

    const themeCounts = Object.values(themeMap).map(t => {
      const percentage = totalReviews > 0 ? `${Math.round((t.count / totalReviews) * 100)}%` : "0%";
      return {
        name: t.name,
        count: t.count,
        percentage
      };
    }).sort((a, b) => b.count - a.count); // Show top themes first

    res.status(200).json({
      success: true,
      stats: [
        { name: "Total Reviews Processed", value: String(totalReviews), change: "+100% live database" },
        { name: "Average Sentiment Score", value: averageSentiment, change: "Based on satisfaction index" },
        { name: "Response Rate (<24h)", value: responseRate, change: "Within target" },
        { name: "Primary Booking Source", value: primarySource, change: primarySourceLabel }
      ],
      sentiments: {
        Positive: sentiments.Positive,
        Neutral: sentiments.Neutral,
        Negative: sentiments.Negative
      },
      themeCounts
    });
  } catch (error) {
    next(error);
  }
};
