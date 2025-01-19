/* eslint-disable no-unused-vars */
import PageLayout from "./PageLayout";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

function Transaction() {
    const [transactionsList, setTransactionsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/Transaction_List.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch transactions.");
                }
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
            <p className="text-lg text-gray-600 mb-8">
                Below is the list of your recent transactions:
            </p>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {isLoading ? (
                <p className="text-gray-500">Loading transactions...</p>
            ) : transactionsList.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-left">
                                <th className="px-4 py-2">Transaction ID</th>
                                <th className="px-4 py-2">Date & Time</th>
                                <th className="px-4 py-2">Mobile Number</th>
                                <th className="px-4 py-2">Plan</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Status</th>
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
                </div>
            ) : (
                <p className="text-gray-500">No transactions found.</p>
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

    // Handle plan details with default values
    const {
        provider = "N/A",
        category = "N/A",
        price = 0,
        validity = "N/A",
        data = {},
        calls = "N/A",
        sms = "N/A",
        extraBenefits = [],
    } = plan;

    const formattedPlanDetails = `
        Provider: ${provider}, 
        Category: ${category}, 
        Price: ₹${price}, 
        Validity: ${validity} days, 
        Calls: ${calls}, 
        SMS: ${sms},
        Data: ${data.dailyLimit ? `${data.dailyLimit}GB/day` : "Unlimited"} 
        ${data.postLimitSpeed ? `(Post-limit: ${data.postLimitSpeed})` : ""}
    `;

    return (
        <tr className={isEven ? "bg-gray-50" : "bg-white"}>
            <td className="px-4 py-2 border-b">{transactionId || "N/A"}</td>
            <td className="px-4 py-2 border-b">
                {transactionDateTime
                    ? new Date(transactionDateTime).toLocaleString()
                    : "N/A"}
            </td>
            <td className="px-4 py-2 border-b">{mobileNumber || "N/A"}</td>
            <td className="px-4 py-2 border-b">
                <span title={formattedPlanDetails}>
                    {provider} - ₹{price} ({validity} days)
                </span>
            </td>
            <td className="px-4 py-2 border-b">₹{price}</td>
            <td
                className={`px-4 py-2 border-b font-medium ${
                    status === "Success"
                        ? "text-green-600"
                        : status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                }`}
            >
                {status}
            </td>
        </tr>
    );
}

TransactionRow.propTypes = {
    transaction: PropTypes.shape({
        transactionId: PropTypes.string,
        transactionDateTime: PropTypes.string,
        mobileNumber: PropTypes.string,
        plan: PropTypes.shape({
            provider: PropTypes.string,
            category: PropTypes.string,
            price: PropTypes.number,
            validity: PropTypes.number,
            data: PropTypes.shape({
                dailyLimit: PropTypes.number,
                totalData: PropTypes.number,
                postLimitSpeed: PropTypes.string,
            }),
            calls: PropTypes.string,
            sms: PropTypes.string,
            extraBenefits: PropTypes.arrayOf(
                PropTypes.shape({
                    type: PropTypes.string,
                    description: PropTypes.string,
                    icon: PropTypes.string,
                })
            ),
            additionalDetails: PropTypes.string,
        }),
        status: PropTypes.string,
    }),
    isEven: PropTypes.bool.isRequired,
};

export default Transaction;
