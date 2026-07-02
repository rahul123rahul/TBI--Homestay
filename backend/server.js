import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewsRouter from "./routes/reviews.js";
import homestaysRouter from "./routes/homestays.js";
import ownerRouter from "./routes/owner.js";
import adminRouter from "./routes/admin.js";
import connectDB from "./config/db.js";
import { seedDatabase } from "./seed.js";
import Review from "./models/Review.js";

// Load environment variables
dotenv.config();

// Connect to Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      console.log("[Server] Database is empty. Running auto-seeding...");
      await seedDatabase();
    } else {
      console.log(`[Server] Database contains ${count} reviews. Skipping seeding.`);
    }
  } catch (err) {
    console.error("[Server] Auto-seeding check failed:", err.message);
  }
});

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

// Mount routers under /api
app.use("/api", reviewsRouter);
app.use("/api", homestaysRouter);
app.use("/api", ownerRouter);
app.use("/api", adminRouter);

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
