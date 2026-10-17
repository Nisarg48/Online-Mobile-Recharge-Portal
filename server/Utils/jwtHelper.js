const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    // `jti` makes every refresh token unique so rotation invalidates the old one.
    return jwt.sign(
        { userId: user._id, jti: crypto.randomBytes(16).toString("hex") },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = { generateAccessToken, generateRefreshToken };
