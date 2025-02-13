import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function Buy_Plan() {
    const location = useLocation();
    const plan = location.state?.plan;
    const mNumber = location.state?.mNumber;
    const [mobileNumber, setMobileNumber] = useState(mNumber || "");
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <>
            <AnimatePresence>
                {isModalOpen && (
                    <>
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
                                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:from-[#50c878] hover:to-[#6a11cb] transition-all"
                                        onClick={() => {
                                            if (!mobileNumber) {
                                                alert("Please enter a mobile number.");
                                                return;
                                            }
                                            alert(`Payment successful for ${mobileNumber}`);
                                            handleCloseModal();
                                        }}
                                    >
                                        Pay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default Buy_Plan;
