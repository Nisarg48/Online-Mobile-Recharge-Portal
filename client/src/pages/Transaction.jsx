import PageLayout from "./PageLayout";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

function Transaction() {
    const [transactionsList, setTransactionsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/Transaction_List.json")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch transactions.");
                return res.json();
            })
            .then((data) => {
                setTransactionsList(data);
                setError(null);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching transactions:", error);
                setError(error.message);
                setIsLoading(false);
            });
    }, []);

    return (
        <PageLayout title="Transaction">
            <p className="text-lg text-[#ffffff] mb-8 text-center">
                Below is the list of your recent transactions:
            </p>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="spinner-border animate-spin border-t-4 border-[#50c878] rounded-full w-16 h-16"></div>
                </div>
            ) : transactionsList.length > 0 ? (
                <motion.div
                    className="overflow-x-auto bg-[#1e1e1e] rounded-lg shadow-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <table className="min-w-full bg-[#1e1e1e] rounded-lg overflow-hidden">
                        <thead className="bg-[#333333]">
                            <tr className="text-[#ffffff] text-left">
                                <th className="px-6 py-3">Transaction ID</th>
                                <th className="px-6 py-3">Date & Time</th>
                                <th className="px-6 py-3">Mobile Number</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionsList.map((transaction, index) => (
                                <TransactionRow
                                    key={transaction.transactionId}
                                    transaction={transaction}
                                    isEven={index % 2 === 0}
                                />
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            ) : (
                <p className="text-[#ffffff] text-center">No transactions found.</p>
            )}
        </PageLayout>
    );
}

function TransactionRow({ transaction, isEven }) {
    const {
        transactionId,
        transactionDateTime,
        mobileNumber,
        plan = {},
        status = "Unknown",
    } = transaction;

    const formattedPlanDetails = `
        Provider: ${plan.provider || "N/A"}, 
        Category: ${plan.category || "N/A"}, 
        Price: ₹${plan.price || 0}, 
        Validity: ${plan.validity || "N/A"} days, 
        Calls: ${plan.calls || "N/A"}, 
        SMS: ${plan.sms || "N/A"},
        Data: ${plan.data?.dailyLimit ? `${plan.data.dailyLimit}GB/day` : "Unlimited"} 
        ${plan.data?.postLimitSpeed ? `(Post-limit: ${plan.data.postLimitSpeed})` : ""}
    `;

    return (
        <motion.tr
            className={`${isEven ? "bg-[#333333]" : "bg-[#1e1e1e]"} hover:bg-[#444444] transition-colors`}
            whileHover={{ scale: 1.02 }}
        >
            <td className="px-6 py-4 border-b border-[#444444]">{transactionId || "N/A"}</td>
            <td className="px-6 py-4 border-b border-[#444444]">
                {transactionDateTime ? new Date(transactionDateTime).toLocaleString() : "N/A"}
            </td>
            <td className="px-6 py-4 border-b border-[#444444]">{mobileNumber || "N/A"}</td>
            <td className="px-6 py-4 border-b border-[#444444]" title={formattedPlanDetails}>
                {plan.provider} - ₹{plan.price} ({plan.validity} days)
            </td>
            <td className="px-6 py-4 border-b border-[#444444]">₹{plan.price}</td>
            <td
                className={`px-6 py-4 border-b border-[#444444] font-medium ${
                    status === "Success"
                        ? "text-green-500"
                        : status === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                }`}
            >
                {status}
            </td>
        </motion.tr>
    );
}

TransactionRow.propTypes = {
    transaction: PropTypes.object.isRequired,
    isEven: PropTypes.bool.isRequired,
};

export default Transaction;