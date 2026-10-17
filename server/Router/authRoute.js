const express = require("express");
const router = express.Router();
const { SignupUser, LoginUser, refreshToken } = require("../Controllers/Authentication_Controller");
const { requestPasswordReset, resetPassword } = require("../Controllers/User_Controller");
const validate = require("../Middleware/validate");
const { authLimiter } = require("../Middleware/rateLimit");
const {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require("../Validation/schemas");

router.use(authLimiter);

// Register User
router.post("/signup", validate(signupSchema), SignupUser);

// Login User
router.post("/login", validate(loginSchema), LoginUser);

// Refresh Token
router.post("/refresh-token", refreshToken);

// Password reset (public, code-based)
router.post("/forgot-password", validate(forgotPasswordSchema), requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

module.exports = router;
