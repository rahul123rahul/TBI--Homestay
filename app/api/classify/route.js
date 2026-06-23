import { classifyReviewsGemini, classifyReviewHeuristic } from "@/lib/classifier";

export async function POST(request) {
  try {
    const body = await request.json();
    const { reviews } = body;

    if (!reviews || !Array.isArray(reviews)) {
      return Response.json(
        { success: false, error: "Missing or invalid 'reviews' array in request body." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        console.log(`[API Classify] Processing ${reviews.length} reviews via Google Gemini API...`);
        const classifications = await classifyReviewsGemini(reviews, apiKey);
        return Response.json({
          success: true,
          mode: "Google Gemini 1.5 Flash",
          classifications,
        });
      } catch (geminiError) {
        console.error("[API Classify] Gemini API execution failed. Falling back to Heuristics.", geminiError);
        // Fall through to heuristic processing
      }
    } else {
      console.warn("[API Classify] process.env.GEMINI_API_KEY not found. Running in Local Heuristic Fallback mode.");
    }

    // Heuristic Fallback Flow
    const classifications = reviews
      .map((text) => classifyReviewHeuristic(text))
      .filter(Boolean);

    return Response.json({
      success: true,
      mode: "Local Heuristic (Fallback)",
      classifications,
    });

  } catch (error) {
    console.error("[API Classify] Request processing failed:", error);
    return Response.json(
      { success: false, error: "An unexpected error occurred while processing classifications." },
      { status: 500 }
    );
  }
}
