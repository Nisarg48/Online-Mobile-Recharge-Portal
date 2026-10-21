/* eslint-disable react/prop-types */
import PageLayout from "./PageLayout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaReceipt } from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime, benefitLabel } from "../Utils/format";
import { TableSkeleton } from "../components/Skeleton";
import { toast } from "../Utils/toast";

function Transaction() {
    const [transactionsList, setTransactionsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await API.get('/transactions/getUserTransaction_List');
                setTransactionsList(response.data);
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
                toast.error("Could not load transactions. Please try again.");
            }
        };

        fetchTransactions();
    }, []);

    return (
        <PageLayout title="Transaction History">
            <p className="text-lg text-[#ffffff] mb-8 text-center">
                Below is the list of your recent transactions:
            </p>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {isLoading ? (
                <TableSkeleton rows={5} cols={5} />
            ) : transactionsList.length > 0 ? (
                <motion.div
                    className="overflow-x-auto bg-[#1e1e1e] rounded-lg shadow-lg p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <table className="min-w-full bg-[#1e1e1e] rounded-lg overflow-hidden">
                        <thead>
                            <tr className="text-[#50c878] text-left border-b border-[#333333]">
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
                                    key={transaction._id}
                                    transaction={transaction}
                                    isEven={index % 2 === 0}
                                />
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <FaReceipt className="text-4xl text-gray-600" />
                    <p className="text-lg font-medium text-gray-200">No transactions yet</p>
                    <p className="text-sm text-gray-400">
                        Your recharges and wallet activity will appear here.
                    </p>
                    <Link
                        to="/NetworkProvider"
                        className="mt-2 rounded-lg bg-[#50c878] px-5 py-2 font-semibold text-black transition hover:bg-[#3da861]"
                    >
                        Browse plans
                    </Link>
                </div>
            )}
        </PageLayout>
    );
}

function TransactionRow({ transaction, isEven }) {
    const { transaction_date_time, mobile_number, plan, status, transactionType, amount_to_pay } = transaction;

    // Handle null or undefined plan
    const formattedPlanDetails = plan
        ? `
            ${plan.platform} - ₹${plan.price} (${plan.validity} days),
            ${plan.data?.dailyLimit ? `${plan.data.dailyLimit}GB/day` : "Unlimited Data"},
            Calls: ${plan.calls}, SMS: ${plan.sms},
            Extra: ${plan.extraBenefits?.map(benefitLabel).join(", ") || "None"}
        `
        : "No plan details available";

    return (
        <motion.tr
            className={`${isEven ? "bg-[#2a2a2a]" : "bg-[#1e1e1e]"} hover:bg-[#333333] transition-colors duration-300`}
            whileHover={{ scale: 1.02 }}
        >
            <td className="px-6 py-4 border-b border-[#444444] text-[#cfcfcf]">
                {formatDateTime(transaction_date_time)}
            </td>
            <td className="px-6 py-4 border-b border-[#444444] text-[#cfcfcf]">{mobile_number}</td>
            <td className="px-6 py-4 border-b border-[#444444] text-[#cfcfcf]" title={formattedPlanDetails}>
                {transactionType === "recharge"
                    ? plan
                        ? `${plan.platform} - ₹${plan.price} (${plan.validity} days)`
                        : "No plan details"
                    : "Wallet Transaction"}
            </td>
            <td className="px-6 py-4 border-b border-[#444444] text-[#50c878] font-bold">
                ₹{amount_to_pay}
            </td>
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

export default Transaction;