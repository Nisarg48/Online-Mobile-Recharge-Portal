import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function Buy_Plan() {
    const location = useLocation();
    const navigate = useNavigate();
    const plan = location.state?.plan;
    const mNumber = location.state?.mNumber;
    const [mobileNumber, setMobileNumber] = useState(mNumber || "");
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [errorModal, setErrorModal] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate(-1);
    };

    const handlePayment = () => {
        if (!mobileNumber) {
            setErrorModal(true); // Show error modal if mobile number is empty
            return;
        }

        // Generate a unique transaction ID
        const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();

        // Create transaction data
        const transactionData = {
            plan,
            mobileNumber,
            transactionId,
            timestamp: new Date().toISOString(),
        };

        // Navigate to receipt page with transaction data
        navigate('/receipt', { state: { transactionData } });
    };

    return (
        <>
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Background Overlay */}
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full max-w-2xl relative">
                                <button
                                    className="absolute top-4 right-4 text-[#ffffff] hover:text-[#50c878]"
                                    onClick={handleCloseModal}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                                <h2 className="text-2xl font-bold mb-6 text-[#ffffff]">Plan Information</h2>
                                <div className="space-y-4 text-[#ffffff]">
                                    <p><b>Plan:</b> {plan.platform} - {plan.category}</p>
                                    <p><b>Price:</b> ₹{plan.price}</p>
                                    <p><b>Data:</b> {plan.data.dailyLimit ? `${plan.data.dailyLimit} GB/day` : `${plan.data.totalData} GB`}</p>
                                    <p><b>Calls:</b> {plan.calls}</p>
                                    <p><b>SMS:</b> {plan.sms}</p>
                                    <p><b>Validity:</b> {plan.validity} days</p>
                                </div>
                                <div className="mt-8">
                                    <p className="mb-2"><b>Mobile Number:</b></p>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-[#333333] bg-[#1e1e1e] text-[#ffffff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#50c878]"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                                <div className="flex justify-end mt-8 space-x-4">
                                    <button
                                        className="bg-[#333333] text-[#ffffff] px-6 py-3 rounded-md hover:bg-[#444444] transition-colors"
                                        onClick={handleCloseModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
                                        onClick={handlePayment}
                                    >
                                        Pay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* Error Modal */}
                {errorModal && (
                    <>
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-md z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="bg-[#2e2e2e] text-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-xl font-bold mb-4 text-red-500">Error</h3>
                                <p className="mb-4">Please enter a mobile number before proceeding.</p>
                                <button
                                    className="w-full bg-[#50c878] text-white px-4 py-2 rounded-md hover:bg-[#6a11cb] transition"
                                    onClick={() => setErrorModal(false)}
                                >
                                    OK
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default Buy_Plan;
