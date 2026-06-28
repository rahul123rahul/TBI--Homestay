# Trishul Eco-Homestays Review Analytics & Classifier App

This is a full-stack web application designed for **Trishul Eco-Homestays** in the Himalayas. It provides an automated guest reviews classifier console and a telemetry analytics dashboard for homestay management staff. 

The application is built using a **Next.js (React)** frontend and an **Express.js (Node.js)** backend server.

---

## Folder Structure

```text
├── app/                    # Next.js frontend pages (App Router)
├── components/             # Reusable React components & UI elements
├── lib/                    # Frontend utility code
├── backend/                # Express.js REST API Server
│   ├── controllers/        # Express route controller actions
│   ├── routes/             # REST route path definitions
│   ├── server.js           # Express app entry point
│   ├── .env.example        # Environment template variables
│   └── .gitignore          # Backend ignored dependencies & secrets
└── reviews-api.postman_collection.json  # Postman test collection
```

---

## Getting Started

To run the application locally, you will need to start both the backend server and the frontend Next.js server.

### 1. Run the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your `GEMINI_API_KEY` inside `.env` to enable real-time Google Gemini AI review classification and hospitality response drafting. If left empty, the server automatically falls back to local heuristic keyword matching.
4. Start the Express development server (runs on `http://localhost:5000` via nodemon):
   ```bash
   npm run dev
   ```

You can verify the backend is running by visiting the health check endpoint: `http://localhost:5000/health`.

### 2. Run the Frontend Server

1. Navigate back to the project root directory.
2. Install the frontend dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Next.js development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

---

## API Endpoints

The backend Express application exposes a standard REST API under the `/api` prefix:

- **GET `/api/reviews`**: List all reviews. Supports optional query filters for `sentiment` and `theme` (e.g. `?sentiment=Positive&theme=Food`).
- **GET `/api/reviews/search`**: Searches reviews text and source using query `?q=...`.
- **GET `/api/reviews/stats`**: Dynamically aggregates counts, satisfaction indexes, response rates, and theme percentages for dashboard metrics.
- **GET `/api/reviews/:id`**: Retrieves details of a single review.
- **POST `/api/reviews`**: Creates a single review, runs classification heuristics/Gemini, saves to memory, and returns the review.
- **POST `/api/reviews/analyze`**: Batch processes a list of reviews for the main Classifier console.
- **PUT `/api/reviews/:id`**: Overrides review properties (manually adjust tags or response drafts).
- **DELETE `/api/reviews/:id`**: Deletes a review from the database.

---

## API Testing

An exported Postman collection is located at the root of the project:
- **[reviews-api.postman_collection.json](./reviews-api.postman_collection.json)**

You can import this collection directly into Postman or Thunder Client to test all 10 endpoint paths (GET, POST, PUT, DELETE, and query parameters) with pre-configured mock payloads.
