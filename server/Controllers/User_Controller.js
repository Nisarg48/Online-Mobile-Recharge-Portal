const User = require("../Models/User");
const bcrypt = require("bcrypt");

// Get All Users List
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
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

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
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
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

// Forget Password
const forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.log("Forget Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete User (Admin)
const deleteUser = async (req, res) => {
    if (req.user.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized" });

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
    if (req.user.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized" });

    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error updating role" });
    }
};

// Enable/Disable User (Admin)
const toggleUserStatus = async (req, res) => {
    if (req.user.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized" });

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
    forgetPassword,
    deleteUser,
    changeUserRole,
    toggleUserStatus,
    updateLastLogin,
    toggleAutoRecharge
};