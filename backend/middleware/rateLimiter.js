import rateLimit from "express-rate-limit";

// Login Limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Register Limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 3,

  message: {
    success: false,
    message:
      "Too many registrations. Please try again later.",
  },
});

// General API Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});