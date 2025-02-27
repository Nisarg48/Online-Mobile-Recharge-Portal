const User = require("../Models/User")
const bcrypt = require("bcrypt")







// Get User Data For Profile Page
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json(user);
    } catch (error) {
        console.log("GetUser Contrller Error : ", error);      
        res.status(404).json({ message: error.message }); 
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        console.log("Request Body: ", req.body);
        console.log("User in Request: ", req.user);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const userId = req.user.userId;
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        console.log("Updated User: ", updatedUser);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Updated User in DB: ", updatedUser);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("UpdateUser Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// User Forget Password
const forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Update the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();

        // Send success response
        return res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.log("Forget Password Error (Controller): ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = { 
                    getUser,
                    updateUser,
                    forgetPassword,
                };