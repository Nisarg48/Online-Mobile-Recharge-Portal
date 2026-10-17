const crypto = require("crypto");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../Utils/jwtHelper");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Signup User
const SignupUser = async (req, res) => {
    try {
        const { name, email, mobile_no, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { mobile_no }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Role is never taken from the client: every signup is a normal user.
        const newUser = new User({
            name,
            email,
            mobile_no,
            password: hashedPassword,
            role: "user",
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login User
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Your account is deactivated. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Persist a hash of the refresh token so it can be validated/rotated/revoked.
        user.refreshTokenHash = hashToken(refreshToken);
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ accessToken, refreshToken, role: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Token Refresh (rotates the refresh token)
const refreshToken = async (req, res) => {
    // Accept both keys for backward compatibility with older clients.
    const token = req.body.refreshToken || req.body.token;
    if (!token) return res.status(401).json({ message: "Refresh token required" });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.userId)
            .select("+refreshTokenHash +refreshTokenExpiresAt");

        if (!user || !user.refreshTokenHash) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
            return res.status(403).json({ message: "Refresh Token expired" });
        }

        if (user.refreshTokenHash !== hashToken(token)) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        // Rotate: issue a fresh pair and store the new refresh hash.
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshTokenHash = hashToken(newRefreshToken);
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await user.save();

        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid Refresh Token" });
    }
};

module.exports = { SignupUser, LoginUser, refreshToken };
