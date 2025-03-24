import { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../Utils/API";
import { motion, AnimatePresence } from "framer-motion";

function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [lastTransaction, setLastTransaction] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile_no: "",
        autoRechargeEnabled: false,
    });

    // Fetch user data and last transaction
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const { data: userData } = await API.get("/user/getUser");
                setUser(userData);
                setFormData({
                    name: userData.name,
                    email: userData.email,
                    mobile_no: userData.mobile_no,
                    autoRechargeEnabled: userData.autoRechargeEnabled,
                });

                const { data: transactionData } = await API.get("/transactions/getLastTransaction", {
                    params: { mobileNumber: userData.mobile_no },
                });
                console.log("Last transaction data:", transactionData);
                setLastTransaction(transactionData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    // Toggle edit mode
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                mobile_no: user.mobile_no,
                autoRechargeEnabled: user.autoRechargeEnabled,
            });
        }
    };

    // Update user data
    const updateUser = async () => {
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                mobile_no: formData.mobile_no,
            };
            const { data } = await API.put("/user/updateUser", payload);
            setUser(data);
            setIsEditing(false);
            setUpdateSuccess(true);

            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error.message);
            alert("Failed to update profile");
        }
    };

    // Toggle auto recharge
    const toggleAutoRecharge = async () => {
        try {
            const newAutoRechargeEnabled = !formData.autoRechargeEnabled;
            const { data } = await API.put("/user/toggleAutoRecharge", {
                autoRechargeEnabled: newAutoRechargeEnabled,
            });
            setUser(data);
            setFormData((prev) => ({ ...prev, autoRechargeEnabled: newAutoRechargeEnabled }));

            // Show success message
            alert(`Auto recharge ${newAutoRechargeEnabled ? "enabled" : "disabled"}`);
        } catch (error) {
            console.error("Error toggling auto recharge:", error.response?.data || error.message);
            alert("Failed to toggle auto recharge");
        }
    };

    // Handle Add Funds
    const handleAddFunds = () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            setError("⚠ Please enter a valid amount!");
            return;
        }
        setError("");
        navigate("/payment-details", {
            state: { plan: parseFloat(amount), transactionType: "wallet", mobileNumber: user.mobile_no },
        });
    };

    // Display current running plan
    const renderCurrentPlan = () => {
        if (!lastTransaction || !lastTransaction.plan || new Date(lastTransaction.planExpiryDate) < new Date()) {
            return (
                <div className="text-center text-gray-400 my-4">
                    No active plan found. Please recharge to continue.
                </div>
            );
        }

        return (
            <div className="bg-[#333333] p-6 rounded-lg border border-[#444444] mb-6">
                <h3 className="text-xl font-semibold text-[#50c878] mb-4">Current Running Plan</h3>
                <div className="space-y-4 text-[#cfcfcf]">
                    <div className="flex justify-between">
                        <p><b>Plan:</b></p>
                        <p>{lastTransaction.plan.platform} - {lastTransaction.plan.category}</p>
                    </div>
                    <div className="flex justify-between">
                        <p><b>Price:</b></p>
                        <p>₹{lastTransaction.plan.price}</p>
                    </div>
                    <div className="flex justify-between">
                        <p><b>Validity:</b></p>
                        <p>{lastTransaction.plan.validity} days</p>
                    </div>
                    <div className="flex justify-between">
                        <p><b>Expiry Date:</b></p>
                        <p>{lastTransaction.planExpiryDate}</p>
                    </div>
                </div>
            </div>
        );
    };

    // Check if auto-recharge is possible
    const isAutoRechargePossible = () => {
        if (!lastTransaction || !lastTransaction.plan || !user) return false;

        const isPlanExpired = new Date(lastTransaction.planExpiryDate) < new Date();
        const hasSufficientBalance = user.wallet >= lastTransaction.plan.price;

        return isPlanExpired && hasSufficientBalance && formData.autoRechargeEnabled;
    };

    // Render auto-recharge status
    const renderAutoRechargeStatus = () => {
        if (!formData.autoRechargeEnabled) {
            return <div className="text-center text-gray-400 my-4">Auto recharge is disabled.</div>;
        }

        if (isAutoRechargePossible()) {
            return (
                <div className="text-center text-green-400 my-4">
                    Auto recharge will be triggered soon for your expired plan.
                </div>
            );
        }

        return (
            <div className="text-center text-gray-400 my-4">
                Auto recharge is enabled. No action required at the moment.
            </div>
        );
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e]">
                <div className="text-[#cfcfcf] text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#1e1e1e] p-6">
            <div className="w-full max-w-4xl">
                <motion.div
                    className="bg-[#2a2a2a] shadow-2xl rounded-3xl overflow-hidden border border-[#444444]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-[#50c878] to-[#3da861] p-8 text-[#cfcfcf] relative">
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute left-4 top-4 bg-[#444444]/20 rounded-lg p-1.5 hover:bg-[#444444]/30 transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-[#cfcfcf]" />
                        </button>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div className="w-28 h-28 bg-[#1e1e1e] rounded-full flex items-center justify-center shadow-lg border-4 border-[#50c878]">
                                    <Wallet className="w-16 h-16 text-[#50c878]" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-semibold text-[#1e1e1e]">{formData.name}</h1>
                                    <p className="text-lg text-[#1e1e1e]">Recharge Portal Profile</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleEdit}
                                className="bg-[#1e1e1e]/20 rounded-lg p-2 hover:bg-[#1e1e1e]/30 transition"
                            >
                                <Edit2 className="w-6 h-6 text-[#1e1e1e]" />
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    <AnimatePresence>
                        {updateSuccess && (
                            <motion.div
                                className="text-center text-green-500 font-medium my-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                Profile updated successfully
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Section */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            updateUser();
                        }}
                        className="p-8 space-y-8 bg-[#2a2a2a]"
                    >
                        <div className="space-y-6">
                            {/* Name and Email Fields (Horizontal Layout) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf] focus:border-[#50c878] focus:ring-2 focus:ring-[#50c878] transition"
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf] focus:border-[#50c878] focus:ring-2 focus:ring-[#50c878] transition"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {/* Phone Number Field */}
                            <div>
                                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    name="mobile_no"
                                    value={formData.mobile_no}
                                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf] focus:border-[#50c878] focus:ring-2 focus:ring-[#50c878] transition"
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Wallet Balance Field */}
                            <div>
                                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Wallet Balance</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        name="wallet"
                                        value={user.wallet}
                                        className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf] focus:border-[#50c878] focus:ring-2 focus:ring-[#50c878] transition"
                                        disabled
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAddFundsModal(true)}
                                        className="px-4 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg hover:bg-[#3da861] transition"
                                    >
                                        Add Money to Wallet
                                    </button>
                                </div>
                            </div>

                            {/* Current Running Plan */}
                            {renderCurrentPlan()}

                            {/* Auto Recharge Toggle */}
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-[#cfcfcf]">Auto Recharge</label>
                                <button
                                    type="button"
                                    onClick={toggleAutoRecharge}
                                    className={`relative w-14 h-7 rounded-full p-1 transition-colors ${formData.autoRechargeEnabled ? "bg-[#50c878]" : "bg-[#444444]"
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.autoRechargeEnabled ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Auto Recharge Status */}
                            {renderAutoRechargeStatus()}

                            {/* Save Button */}
                            {isEditing && (
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg hover:bg-[#3da861] transition"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            )}

                            {/* Change Password Button */}
                            <div className="flex justify-center items-center mb-2">
                                <button
                                    className="text-[#50c878] hover:text-[#3da861] text-lg flex items-center gap-2 transition"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/change-password");
                                    }}
                                >
                                    <Lock className="w-5 h-5" /> Change Password
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Add Funds Modal */}
            {showAddFundsModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-black p-8 rounded-lg shadow-lg text-white w-full max-w-lg border border-gray-700">
                        <h2 className="text-2xl mb-6 text-green-400 font-bold text-center">Add Money to Wallet</h2>
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-2">Amount</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddFunds}
                                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200"
                            >
                                Add Money
                            </button>
                            <button
                                onClick={() => setShowAddFundsModal(false)}
                                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;