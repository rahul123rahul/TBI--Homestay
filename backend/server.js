import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewsRouter from "./routes/reviews.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow frontend origin
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON request bodies
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount reviews router under /api
app.use("/api", reviewsRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Trishul Eco-Homestays Backend is running." });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "An unexpected internal server error occurred."
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Trishul Eco-Homestays Backend listening on port ${PORT}`);
  console.log(` Health check available at http://localhost:${PORT}/health`);
  console.log(`==================================================`);
});
