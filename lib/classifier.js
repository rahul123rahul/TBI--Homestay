import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Local Rule Heuristic Classifier (Fallback & Evaluation Baseline)
 */
export function classifyReviewHeuristic(text) {
  const cleanText = text.toLowerCase().trim();
  if (!cleanText) return null;

  let sentiment = "Positive";
  let theme = "Experience";
  let response = "";

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
      response = "We appreciate your feedback regarding our rates. We strive to offer unique eco-stays and are continuously enhancing our facilities to provide better value.";
    } else {
      response = "Thank you for your feedback. We are glad you found our eco-homestay experience well worth the value.";
    }
  } else {
    // Default Experience
    if (cleanText.includes("disappointed") || cleanText.includes("worst") || cleanText.includes("terrible") || cleanText.includes("horrible")) {
      sentiment = "Negative";
      response = "We apologize sincerely that your stay fell short of expectations. We would love to get more details to resolve your concerns.";
    } else if (cleanText.includes("okay") || cleanText.includes("average") || cleanText.includes("fine")) {
      sentiment = "Neutral";
      response = "Thank you for your review. We are continuously improving our eco-stay and hope to offer a better experience next time.";
    } else {
      response = "Thank you for sharing your experience with us! We look forward to welcoming you back to Trishul Eco-Homestays in the future.";
    }
  }

  return { text, sentiment, theme, response };
}

/**
 * Google Gemini API Classifier (Structured Outputs)
 */
export async function classifyReviewsGemini(reviews, apiKey) {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash for optimized token costs and speed
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `You are a hospitality intelligence assistant for Trishul Eco-Homestays in the Himalayas.
Analyze the following list of reviews. For each review, determine:
1. Sentiment: "Positive", "Neutral", or "Negative".
2. Theme: Choose the primary topic from: "Food", "Host", "Location", "Cleanliness", "Value", or "Experience".
3. Suggested Response: Draft a one-line professional and welcoming response to the guest reflecting traditional Kumaoni hospitality. Address specific points (e.g. if cleanliness is negative, be apologetic; if host is positive, say "Namaskar" and thank them).

Input Reviews List:
${reviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}

Ensure you process all ${reviews.length} reviews and output them in the exact order requested in the array.`;

  const responseSchema = {
    type: "object",
    properties: {
      classifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            sentiment: {
              type: "string",
              enum: ["Positive", "Neutral", "Negative"],
            },
            theme: {
              type: "string",
              enum: ["Food", "Host", "Location", "Cleanliness", "Value", "Experience"],
            },
            response: { type: "string" },
          },
          required: ["text", "sentiment", "theme", "response"],
        },
      },
    },
    required: ["classifications"],
  };

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1, // Low temperature for deterministic classification
    },
  });

  const responseText = response.response.text();
  const parsedData = JSON.parse(responseText);

  if (!parsedData.classifications || !Array.isArray(parsedData.classifications)) {
    throw new Error("Invalid output format returned from Gemini model.");
  }

  return parsedData.classifications;
}
