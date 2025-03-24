// /* eslint-disable no-unused-vars */
// import { useLocation, useNavigate } from "react-router-dom";
// import API from "../Utils/API";
// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";

// function Receipt() {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const transaction_id = location.state.transaction_id;
//     const [transactionData, setTransactionData] = useState({
//         transaction_id: transaction_id,
//         user_id: '',
//         mobile_number: '',
//         plan: {
//             platform: '',
//             category: '',
//             price: '',
//             validity: '',
//             data: {
//                 dailyLimit: '',
//                 totalData: '',
//             },
//             calls: '',
//             sms: '',
//             extraBenefits: '',
//         },
//         platformCharge: '',
//         transaction_date_time: '',
//         status: '',
//         payment_method: '',
//         transactionType: '',
//         amount_to_pay: 0,
//     });

//     useEffect(() => {
//         const fetchTransactionData = async () => {
//             try {
//                 const response = await API.get(`/transactions/getTransactionById/${transaction_id}`);
//                 setTransactionData(response.data);
//             } catch (error) {
//                 console.error(error);
//             }
//         };

//         fetchTransactionData();
//     }, []);

//     const handlePrintReceipt = () => {
//         const doc = new jsPDF();

//         const pageWidth = doc.internal.pageSize.getWidth();
//         const margin = 15;

//         const logoWidth = 15, logoHeight = 15;
//         const logoX = (pageWidth / 2) - (logoWidth / 2) - 10, logoY = 10;
//         doc.addImage("./Logo.png", "PNG", logoX, logoY, logoWidth, logoHeight);

//         doc.setFontSize(16);
//         doc.setFont("helvetica", "bold");
//         doc.text("RechargeHub", logoX + logoWidth + 5, logoY + logoHeight / 2 + 2);

//         let currentY = logoY + logoHeight + 10;

//         doc.setFontSize(18);
//         doc.text("Transaction Receipt", pageWidth / 2, currentY, { align: "center" });
//         doc.line(10, currentY + 5, 200, currentY + 5);
//         currentY += 15;

//         const transactionDetails = [
//             ["Transaction ID", transactionData._id],
//             ["Date", transactionData.transaction_date_time],
//             ["Mobile Number", transactionData.mobile_number],
//             ["Status", transactionData.status],
//             ["Payment Method", transactionData.payment_method],
//             ["Platform Charge", `Rs. ${transactionData.platformCharge || "0"}`],
//             ["Total Amount Paid", `Rs. ${transactionData.amount_to_pay}`]
//         ];

//         if (transactionData.transactionType === "recharge") {
//             transactionDetails.push(
//                 ["Plan", `${transactionData.plan.platform} - ${transactionData.plan.category}`],
//                 ["Price", `Rs. ${transactionData.plan.price}`],
//                 ["Data", transactionData.plan.data?.dailyLimit
//                     ? `${transactionData.plan.data.dailyLimit} GB/day`
//                     : `${transactionData.plan.data?.totalData || 0} GB`],
//                 ["Calls", transactionData.plan.calls],
//                 ["SMS", transactionData.plan.sms],
//                 ["Validity", `${transactionData.plan.validity} days`]
//             );
//         }

//         if (transactionData.transactionType === "wallet") {
//             transactionDetails.push(["Amount Added to Wallet", `Rs. ${transactionData.amount_to_pay}`]);
//         }

//         autoTable(doc, {
//             startY: currentY,
//             head: [["Field", "Details"]],
//             body: transactionDetails,
//             margin: { left: margin, right: margin },
//             styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
//             headStyles: { fillColor: [80, 200, 120] },
//         });

//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text("Thank you for using our service!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

//         doc.save(`Receipt_${transactionData._id}.pdf`);
//     };

//     const [showFeedback, setShowFeedback] = useState(false);
//     const [feedbackMessage, setFeedbackMessage] = useState("");

//     // Handler to submit feedback
//     const handleFeedbackSubmit = async () => {
//         try {
//             const response = await API.post('/feedback/createFeedback', { message: feedbackMessage });
//             if (response.data.success) {
//                 alert("Thanks for your feedback!");
//                 setShowFeedback(false);
//                 setFeedbackMessage("");
//             }
//         } catch (error) {
//             console.error("Error submitting feedback", error);
//             alert("There was an error submitting your feedback. Please try again later.");
//         }
//     };

//     return (
//         <motion.div
//             className="min-h-screen flex items-center justify-center bg-black text-white"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//         >
//             <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full max-w-2xl border border-gray-700">
//                 <div className="text-center text-[#50c878] text-2xl font-bold mb-4">
//                     ✅ Payment Successful!
//                 </div>

//                 <h2 className="text-xl font-bold mb-6 text-center text-[#ffffff]">Transaction Receipt</h2>

//                 <div className="space-y-4 text-[#ffffff]">
//                     {transactionData.transactionType === "recharge" && transactionData.plan && (
//                         <>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Plan:</b></p>
//                                 <p>{transactionData.plan.platform} - {transactionData.plan.category}</p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Price:</b></p>
//                                 <p>₹{transactionData.plan.price}</p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Data:</b></p>
//                                 <p>
//                                     {transactionData.plan.data?.dailyLimit
//                                         ? `${transactionData.plan.data.dailyLimit} GB/day`
//                                         : `${transactionData.plan.data?.totalData || 0} GB`}
//                                 </p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Calls:</b></p>
//                                 <p>{transactionData.plan.calls}</p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>SMS:</b></p>
//                                 <p>{transactionData.plan.sms}</p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Validity:</b></p>
//                                 <p>{transactionData.plan.validity} days</p>
//                             </div>
//                             <div className="flex justify-between border-b border-gray-700 pb-2">
//                                 <p><b>Mobile Number:</b></p>
//                                 <p>{transactionData.mobile_number}</p>
//                             </div>
//                         </>
//                     )}
//                     {transactionData.transactionType === "wallet" && (
//                         <div className="flex justify-between border-b border-gray-700 pb-2">
//                             <p><b>Amount Added to Wallet:</b></p>
//                             <p>₹{transactionData.amount_to_pay}</p>
//                         </div>
//                     )}
//                     <div className="flex justify-between border-b border-gray-700 pb-2">
//                         <p><b>Transaction ID:</b></p>
//                         <p>{transaction_id}</p>
//                     </div>
//                     <div className="flex justify-between">
//                         <p><b>Date:</b></p>
//                         <p>{transactionData.transaction_date_time}</p>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-center space-x-4">
//                     <div>
//                         <button
//                             className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
//                             onClick={() => navigate("/NetworkProvider")}
//                         >
//                             Back to Home
//                         </button>
//                         <button
//                             className="bg-gradient-to-r from-[#6a11cb] to-[#50c878] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
//                             onClick={handlePrintReceipt}
//                         >
//                             Print Receipt
//                         </button>
//                     </div>

//                     {/* Trigger feedback modal popup */}
//                     <div className="mt-6 flex justify-center">
//                         <button
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
//                             onClick={() => setShowFeedback(true)}
//                         >
//                             Give Feedback
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Feedback Modal */}
//             {showFeedback && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
//                         <h2 className="text-xl font-bold mb-4">We Value Your Feedback!</h2>
//                         <textarea
//                             className="w-full p-2 rounded mb-4 bg-gray-700 text-white"
//                             placeholder="Share your experience..."
//                             value={feedbackMessage}
//                             onChange={(e) => setFeedbackMessage(e.target.value)}
//                         />
//                         <div className="flex justify-end space-x-4">
//                             <button
//                                 className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
//                                 onClick={() => setShowFeedback(false)}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
//                                 onClick={handleFeedbackSubmit}
//                             >
//                                 Submit
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </motion.div>
//     );
// }

// export default Receipt;


import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../Utils/API";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Receipt() {
    const location = useLocation();
    const navigate = useNavigate();
    const transaction_id = location.state.transaction_id;
    const [transactionData, setTransactionData] = useState({
        transaction_id: transaction_id,
        user_id: '',
        mobile_number: '',
        plan: {
            platform: '',
            category: '',
            price: '',
            validity: '',
            data: {
                dailyLimit: '',
                totalData: '',
            },
            calls: '',
            sms: '',
            extraBenefits: '',
        },
        platformCharge: '',
        transaction_date_time: '',
        status: '',
        payment_method: '',
        transactionType: '',
        amount_to_pay: 0,
    });

    // State for feedback modal
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [rating, setRating] = useState(0); // 0 to 5 stars

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const response = await API.get(`/transactions/getTransactionById/${transaction_id}`);
                setTransactionData(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTransactionData();
    }, [transaction_id]);

    const handlePrintReceipt = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const logoWidth = 15, logoHeight = 15;
        const logoX = (pageWidth / 2) - (logoWidth / 2) - 10, logoY = 10;
        doc.addImage("./Logo.png", "PNG", logoX, logoY, logoWidth, logoHeight);

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("RechargeHub", logoX + logoWidth + 5, logoY + logoHeight / 2 + 2);

        let currentY = logoY + logoHeight + 10;

        doc.setFontSize(18);
        doc.text("Transaction Receipt", pageWidth / 2, currentY, { align: "center" });
        doc.line(10, currentY + 5, 200, currentY + 5);
        currentY += 15;

        const transactionDetails = [
            ["Transaction ID", transactionData._id],
            ["Date", transactionData.transaction_date_time],
            ["Mobile Number", transactionData.mobile_number],
            ["Status", transactionData.status],
            ["Payment Method", transactionData.payment_method],
            ["Platform Charge", `Rs. ${transactionData.platformCharge || "0"}`],
            ["Total Amount Paid", `Rs. ${transactionData.amount_to_pay}`]
        ];

        if (transactionData.transactionType === "recharge") {
            transactionDetails.push(
                ["Plan", `${transactionData.plan.platform} - ${transactionData.plan.category}`],
                ["Price", `Rs. ${transactionData.plan.price}`],
                ["Data", transactionData.plan.data?.dailyLimit
                    ? `${transactionData.plan.data.dailyLimit} GB/day`
                    : `${transactionData.plan.data?.totalData || 0} GB`],
                ["Calls", transactionData.plan.calls],
                ["SMS", transactionData.plan.sms],
                ["Validity", `${transactionData.plan.validity} days`]
            );
        }

        if (transactionData.transactionType === "wallet") {
            transactionDetails.push(["Amount Added to Wallet", `Rs. ${transactionData.amount_to_pay}`]);
        }

        autoTable(doc, {
            startY: currentY,
            head: [["Field", "Details"]],
            body: transactionDetails,
            margin: { left: margin, right: margin },
            styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
            headStyles: { fillColor: [80, 200, 120] },
        });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Thank you for using our service!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

        doc.save(`Receipt_${transactionData._id}.pdf`);
    };

    // Handler to submit feedback with rating and message
    const handleFeedbackSubmit = async () => {
        try {
            const response = await API.post('/feedback/createFeedback', { message: feedbackMessage, rating });
            if (response.data.success) {
                alert("Thanks for your feedback!");
                setShowFeedback(false);
                setFeedbackMessage("");
                setRating(0);
            }
        } catch (error) {
            console.error("Error submitting feedback", error);
            alert("There was an error submitting your feedback. Please try again later.");
        }
    };

    // Render stars with onClick handlers for rating
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    style={{
                        cursor: "pointer",
                        fontSize: "1.5rem",
                        color: i <= rating ? "#FFD700" : "#ccc"
                    }}
                    onClick={() => setRating(i)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl p-8 w-full max-w-2xl border border-gray-700">
                <div className="text-center text-[#50c878] text-2xl font-bold mb-4">
                    ✅ Payment Successful!
                </div>

                <h2 className="text-xl font-bold mb-6 text-center">Transaction Receipt</h2>

                <div className="space-y-4">
                    {transactionData.transactionType === "recharge" && transactionData.plan && (
                        <>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Plan:</b></p>
                                <p>{transactionData.plan.platform} - {transactionData.plan.category}</p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Price:</b></p>
                                <p>₹{transactionData.plan.price}</p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Data:</b></p>
                                <p>
                                    {transactionData.plan.data?.dailyLimit
                                        ? `${transactionData.plan.data.dailyLimit} GB/day`
                                        : `${transactionData.plan.data?.totalData || 0} GB`}
                                </p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Calls:</b></p>
                                <p>{transactionData.plan.calls}</p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>SMS:</b></p>
                                <p>{transactionData.plan.sms}</p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Validity:</b></p>
                                <p>{transactionData.plan.validity} days</p>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p><b>Mobile Number:</b></p>
                                <p>{transactionData.mobile_number}</p>
                            </div>
                        </>
                    )}
                    {transactionData.transactionType === "wallet" && (
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <p><b>Amount Added to Wallet:</b></p>
                            <p>₹{transactionData.amount_to_pay}</p>
                        </div>
                    )}
                    <div className="flex justify-between border-b border-gray-700 pb-2">
                        <p><b>Transaction ID:</b></p>
                        <p>{transaction_id}</p>
                    </div>
                    <div className="flex justify-between">
                        <p><b>Date:</b></p>
                        <p>{transactionData.transaction_date_time}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        className="bg-gradient-to-r from-[#50c878] to-[#6a11cb] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
                        onClick={() => navigate("/NetworkProvider")}
                    >
                        Back to Home
                    </button>
                    <button
                        className="bg-gradient-to-r from-[#6a11cb] to-[#50c878] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all"
                        onClick={handlePrintReceipt}
                    >
                        Print Receipt
                    </button>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all"
                        onClick={() => setShowFeedback(true)}
                    >
                        Give Feedback
                    </button>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                        <h2 className="text-2xl font-bold mb-4">We Value Your Feedback!</h2>
                        <div className="mb-4">
                            <p className="mb-2">Rate your experience:</p>
                            <div>{renderStars()}</div>
                        </div>
                        <div className="mb-4">
                            <textarea
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                placeholder="Additional comments (optional)..."
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                rows="4"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-all"
                                onClick={() => setShowFeedback(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-all"
                                onClick={handleFeedbackSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default Receipt;