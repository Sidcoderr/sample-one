import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  const isProd = env.NODE_ENV === "production";
  const statusCode = err.statusCode || err.status || 500;

  // Log error in non-production environments or without sensitive credentials
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  res.status(statusCode).json({
    error: isProd
      ? (statusCode === 500 ? "Internal server error" : err.message)
      : (err.message || "Internal server error"),
    ...(isProd ? {} : { stack: err.stack }),
  });
}

