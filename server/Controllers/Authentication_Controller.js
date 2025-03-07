const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../Utils/jwtHelper");

// Store in DB or Cache in Production
let refreshTokens = []; 

// Signup User
const SignupUser = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, mobile_no, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user with the hashed password
        const newUser = new User({ name, email, mobile_no, password: hashedPassword, role });
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

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: "Your account is deactivated. Please contact support." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Generate Tokens
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Store refresh token in DB or Cache in Production
        refreshTokens.push(refreshToken);

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Token Refresh
const refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Token required" });
    if (!refreshTokens.includes(token)) return res.status(403).json({ message: "Invalid Refresh Token" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

        const newAccessToken = generateAccessToken({ _id: user.userId, role: user.role });
        res.status(200).json({ accessToken: newAccessToken });
    });
};

module.exports = { SignupUser, LoginUser, refreshToken };