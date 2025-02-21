const Transaction = require("../Models/Transaction");

// Get Transaction
const getUserTransaction_List = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        const Transaction_List = await Transaction.find({ user_id: userId });
        console.log(Transaction_List);
        res.status(200).json(Transaction_List);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Add in Transaction
const addInTransaction_List = async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

// Delete from Transaction
const deleteFromTransaction_List = async (req, res) => {
    try {
        const id = req.params.id;
        await Transaction.findByIdAndDelete(id);
        res.status(200).json({ message: "Transaction Deleted Successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// Update Transaction
const updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = { 
                    getUserTransaction_List, 
                    addInTransaction_List, 
                    deleteFromTransaction_List, 
                    updateTransaction
                };