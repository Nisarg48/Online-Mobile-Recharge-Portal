const express = require("express");
const router = express.Router();
const { SignupUser, LoginUser, refreshToken } = require("../Controllers/Authentication_Controller");

// Register User
router.post("/signup", SignupUser);

// Login User
router.post("/login", LoginUser);

// Refresh Token
router.post("/refresh-token", refreshToken);




module.exports = router;
