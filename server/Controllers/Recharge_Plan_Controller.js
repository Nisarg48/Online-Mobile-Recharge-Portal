const Recharge_Plan = require("../Models/Recharge_Plan");

// Get Recharge_Plan
const getRecharge_Plan = async (req, res) => {
    try{
        const recharge_Plan = await Recharge_Plan.find();
        res.status(200).json(recharge_Plan);
    } catch (error) {
        console.error("Error in getRecharge_Plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Get Recharge_Plan by id
const getRecharge_PlanById = async (req, res) => {
    try {
        const id = req.params.id;
        const recharge_Plan = await Recharge_Plan.findById(id);
        res.status(200).json(recharge_Plan);
    } catch (error) {
        console.error("Error in getRecharge_PlanById:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Post Recharge_Plan
const addRecharge_Plan = async (req, res) => {
    try {
        if(req.user.role === 'admin')
        {
            const newRecharge_Plan = new Recharge_Plan(req.body);
            await newRecharge_Plan.save();
            res.status(201).json({ message: "Recharge Plan Added Successfully" });
        }
        else
        {
            res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error in addRecharge_Plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update Recharge_Plan
const updateRecharge_Plan = async (req, res) => {
    try {
        if(req.user.role === 'admin')
        {
            const id = req.params.id;
            const updatedRecharge_Plan = await Recharge_Plan.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedRecharge_Plan);
        }
        else
        {
            res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error in updateRecharge_Plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};  

// Delete Recharge_Plan
const deleteRecharge_Plan = async (req, res) => {
    try {
        if(req.user.role === 'admin')
        {
            const id = req.params.id;
            await Recharge_Plan.findByIdAndDelete(id);
            res.status(200).json({ message: "Recharge Plan Deleted Successfully" });
        }
        else
        {
            res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error in deleteRecharge_Plan:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { 
    getRecharge_Plan,
    getRecharge_PlanById,
    addRecharge_Plan,
    updateRecharge_Plan,
    deleteRecharge_Plan,
};
