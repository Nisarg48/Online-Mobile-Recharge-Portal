const crypto = require("crypto");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const { sendMail } = require("../Utils/mailer");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Get All Users List (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Data For Profile Page
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json(user);
    } catch (error) {
        console.log("GetUser Controller Error:", error);
        res.status(404).json({ message: error.message });
    }
};

// Update User Profile
const updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    mobile_no: req.body.mobile_no,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email or mobile number already in use" });
        }
        console.error("UpdateUser Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Toggle Auto Recharge
const toggleAutoRecharge = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { autoRechargeEnabled } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { autoRechargeEnabled },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Toggle Auto Recharge Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Request a password reset (public). Always returns a generic response to
// avoid revealing whether an email is registered.
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const genericResponse = {
            message: "If an account with that email exists, a reset code has been sent.",
        };

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = hashToken(resetToken);
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendMail({
            to: user.email,
            subject: "Password Reset Code - RechargeHub",
            text: `Your password reset code is: ${resetToken}\n\nIt expires in 15 minutes. If you did not request this, ignore this email.`,
        });

        return res.status(200).json(genericResponse);
    } catch (error) {
        console.error("Request Password Reset Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Reset password with the emailed code (public)
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        const user = await User.findOne({ email })
            .select("+passwordResetToken +passwordResetExpires");

        const invalid = !user
            || !user.passwordResetToken
            || !user.passwordResetExpires
            || user.passwordResetExpires < new Date()
            || user.passwordResetToken !== hashToken(token);

        if (invalid) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // Invalidate existing sessions after a password reset.
        user.refreshTokenHash = undefined;
        user.refreshTokenExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Change password while logged in (requires current password)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.refreshTokenHash = undefined;
        user.refreshTokenExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete User (Admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

// Change User Role (Admin)
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
};

// Enable/Disable User (Admin)
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({ message: `User ${user.isActive ? "enabled" : "disabled"}` });
    } catch (error) {
        res.status(500).json({ message: "Error toggling user status" });
    }
};

// Update Last Login on User Login
const updateLastLogin = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ message: "Login successful", lastLogin: user.lastLogin });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
};

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    requestPasswordReset,
    resetPassword,
    changePassword,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    updateLastLogin,
    toggleAutoRecharge,
};
