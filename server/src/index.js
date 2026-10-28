import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import conversationRoutes from "./routes/conversations.js";
import chatRoutes from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration supporting comma-separated CLIENT_URL origins
const allowedOrigins = env.CLIENT_URL.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Body parsing with 100kb limit
app.use(express.json({ limit: "100kb" }));

// Health check endpoint (no auth required)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Protected routes
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat", chatRoutes);

// Central error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ChatPilot Server running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Allowed client origin(s): ${allowedOrigins.join(", ")}`);
});

