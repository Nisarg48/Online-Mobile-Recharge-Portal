import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

function Buy_Plan() {
    const location = useLocation();
    const navigate = useNavigate();
    const plan = location.state?.plan;
    const mNumber = location.state?.mNumber;
    const [mobileNumber, setMobileNumber] = useState(mNumber || "");
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [showError, setShowError] = useState("");

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate(-1);
    };

    const handlePayment = () => {
        if (!mobileNumber) {
            setShowError("⚠ Please enter a mobile number!");
            return;
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            setShowError("⚠ Mobile number must be exactly 10 digits!");
            return;
        }

        const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
        const transactionData = {
            plan,
            mobileNumber,
            transactionId,
            timestamp: new Date().toISOString(),
        };

        navigate("/receipt", { state: { transactionData } });
    };

    return (
        <>
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Black background - same as Receipt */}
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 backdrop-blur-md z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <div className="bg-black border border-[#222] shadow-xl rounded-lg p-8 w-full max-w-lg relative">
                                <button
                                    className="absolute top-4 right-4 text-[#ffffff] hover:text-[#50c878]"
                                    onClick={handleCloseModal}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-[#50c878]">
                                    Plan Information
                                </h2>
                                <div className="space-y-4 text-[#bbbbbb]">
                                    <p><b>Plan:</b> {plan.platform} - {plan.category}</p>
                                    <p><b>Price:</b> ₹{plan.price}</p>
                                    <p><b>Data:</b> {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
                                    <p><b>Calls:</b> {plan.calls}</p>
                                    <p><b>SMS:</b> {plan.sms}</p>
                                    <p><b>Validity:</b> {plan.validity} days</p>
                                </div>
                                <div className="mt-8">
                                    <p className="mb-2 text-[#ffffff]"><b>Mobile Number:</b></p>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-[#50c878] bg-[#111] text-[#ffffff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878] transition-all"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setMobileNumber(value);
                                        }}
                                        placeholder="Enter mobile number"
                                        maxLength="10"
                                    />
                                </div>
                                <div className="flex justify-end mt-8 space-x-4">
                                    <button
                                        className="bg-[#222] text-[#ffffff] px-6 py-3 rounded-md hover:bg-[#333] transition-all"
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
                                        onClick={handlePayment}
                                    >
                                        Pay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Error Popup - Matches Theme */}
            <AnimatePresence>
                {showError && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-black border border-[#ff4444] text-white p-6 rounded-lg text-center w-full max-w-md shadow-lg"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                        >
                            <h3 className="text-lg font-semibold text-[#ff4444]">
                                {showError}
                            </h3>
                            <button
                                onClick={() => setShowError("")}
                                className="mt-4 bg-[#222] text-white px-6 py-2 rounded-md hover:bg-[#333] transition-all"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Buy_Plan;
