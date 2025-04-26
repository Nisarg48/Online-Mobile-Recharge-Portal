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
        user_id: "",
        mobile_number: "",
        plan: {
            platform: "",
            category: "",
            price: "",
            validity: "",
            data: {
                dailyLimit: "",
                totalData: "",
            },
            calls: "",
            sms: "",
            extraBenefits: "",
        },
        platformCharge: "",
        transaction_date_time: "",
        status: "",
        payment_method: "",
        transactionType: "",
        amount_to_pay: 0,
    });

    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const response = await API.get(
                    `/transactions/getTransactionById/${transaction_id}`
                );
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
        const logoWidth = 15,
            logoHeight = 15;
        const logoX = pageWidth / 2 - logoWidth / 2 - 10,
            logoY = 10;
        doc.addImage("./Logo.png", "PNG", logoX, logoY, logoWidth, logoHeight);

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("RechargeHub", logoX + logoWidth + 5, logoY + logoHeight / 2 + 2);

        let currentY = logoY + logoHeight + 10;

        doc.setFontSize(18);
        doc.text("Transaction Receipt", pageWidth / 2, currentY, {
            align: "center",
        });
        doc.line(10, currentY + 5, 200, currentY + 5);
        currentY += 15;

        const transactionDetails = [
            ["Transaction ID", transactionData._id],
            ["Date", transactionData.transaction_date_time],
            ["Mobile Number", transactionData.mobile_number],
            ["Status", transactionData.status],
            ["Payment Method", transactionData.payment_method],
            ["Platform Charge", `Rs. ${transactionData.platformCharge || "0"}`],
            ["Total Amount Paid", `Rs. ${transactionData.amount_to_pay}`],
        ];

        if (transactionData.transactionType === "recharge") {
            transactionDetails.push(
                [
                    "Plan",
                    `${transactionData.plan.platform} - ${transactionData.plan.category}`,
                ],
                ["Price", `Rs. ${transactionData.plan.price}`],
                [
                    "Data",
                    transactionData.plan.data?.dailyLimit
                        ? `${transactionData.plan.data.dailyLimit} GB/day`
                        : `${transactionData.plan.data?.totalData || 0} GB`,
                ],
                ["Calls", transactionData.plan.calls],
                ["SMS", transactionData.plan.sms],
                ["Validity", `${transactionData.plan.validity} days`]
            );
        }

        if (transactionData.transactionType === "wallet") {
            transactionDetails.push([
                "Amount Added to Wallet",
                `Rs. ${transactionData.amount_to_pay}`,
            ]);
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
        doc.text(
            "Thank you for using our service!",
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 20,
            { align: "center" }
        );

        doc.save(`Receipt_${transactionData._id}.pdf`);
    };

    const handleFeedbackSubmit = async () => {
        try {
            const response = await API.post("/feedback/createFeedback", {
                message: feedbackMessage,
                rating: rating > 0 ? rating : 1
            });

            if (response.data.success) {
                alert("Thanks for your feedback!");
                setFeedbackMessage("");
                setRating(0);
            }

            // redirect to home page
            navigate("/NetworkProvider", { replace: true });
        } catch (error) {
            console.error("Error submitting feedback", error);
            alert(
                "There was an error submitting your feedback. Please try again later."
            );
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-black text-white p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side - Receipt */}
                <div className="flex-1 bg-[#1e1e1e] rounded-lg shadow-2xl p-8 border border-gray-700">
                    <div className="text-center text-[#50c878] text-2xl font-bold mb-4">
                        ✅ Payment Successful!
                    </div>

                    <h2 className="text-xl font-bold mb-6 text-center">
                        Transaction Receipt
                    </h2>

                    <div className="space-y-4">
                        {transactionData.transactionType === "recharge" &&
                            transactionData.plan && (
                                <>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Plan:</b>
                                        </p>
                                        <p>
                                            {transactionData.plan.platform} -{" "}
                                            {transactionData.plan.category}
                                        </p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Price:</b>
                                        </p>
                                        <p>₹{transactionData.plan.price}</p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Data:</b>
                                        </p>
                                        <p>
                                            {transactionData.plan.data?.dailyLimit
                                                ? `${transactionData.plan.data.dailyLimit} GB/day`
                                                : `${transactionData.plan.data?.totalData || 0} GB`}
                                        </p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Calls:</b>
                                        </p>
                                        <p>{transactionData.plan.calls}</p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>SMS:</b>
                                        </p>
                                        <p>{transactionData.plan.sms}</p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Validity:</b>
                                        </p>
                                        <p>{transactionData.plan.validity} days</p>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-700 pb-2">
                                        <p>
                                            <b>Mobile Number:</b>
                                        </p>
                                        <p>{transactionData.mobile_number}</p>
                                    </div>
                                </>
                            )}
                        {transactionData.transactionType === "wallet" && (
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <p>
                                    <b>Amount Added to Wallet:</b>
                                </p>
                                <p>₹{transactionData.amount_to_pay}</p>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <p>
                                <b>Transaction ID:</b>
                            </p>
                            <p>{transaction_id}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>
                                <b>Date:</b>
                            </p>
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
                </div>

                {/* Right Side - Feedback Box */}
                <div className="w-full lg:w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        🌟 Share Your Feedback
                    </h2>

                    <div className="flex justify-center mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <motion.span
                                key={i}
                                whileHover={{ scale: 1.2 }}
                                className="text-3xl cursor-pointer transition-all"
                                style={{ color: i < rating ? "#FFD700" : "#555" }}
                                onClick={() => setRating(i + 1)}
                            >
                                ★
                            </motion.span>
                        ))}
                    </div>

                    <textarea
                        className="w-full bg-gray-700 p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
                        placeholder="Tell us about your experience..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        rows="4"
                    />

                    <div className="flex justify-end space-x-4">
                        <button
                            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-md text-white transition-all font-semibold w-full"
                            onClick={handleFeedbackSubmit}
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Receipt;
