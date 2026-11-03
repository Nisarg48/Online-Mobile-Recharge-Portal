const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    // Don't penalize legitimate traffic: successful logins/refreshes shouldn't
    // consume quota (only failed attempts should count toward the limit).
    skipSuccessfulRequests: true,
    message: { message: "Too many attempts, please try again later." },
});

// Throttles user-generated content (queries/feedback) to blunt spam even when
// a single account is used.
const contentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many submissions, please try again later." },
});

module.exports = { generalLimiter, authLimiter, contentLimiter };
