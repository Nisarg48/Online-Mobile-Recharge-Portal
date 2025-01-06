import PageLayout from "./PageLayout";

function Transaction() {
    const transactions = [
        {
            id: "TXN001",
            date: "2025-01-06",
            operator: "Jio",
            plan: "₹299 - 2GB/Day, 28 Days",
            amount: "₹299",
            status: "Success",
        },
        {
            id: "TXN002",
            date: "2025-01-05",
            operator: "Airtel",
            plan: "₹199 - 1.5GB/Day, 24 Days",
            amount: "₹199",
            status: "Pending",
        },
        {
            id: "TXN003",
            date: "2025-01-04",
            operator: "VI",
            plan: "₹399 - 3GB/Day, 56 Days",
            amount: "₹399",
            status: "Failed",
        },
    ];

    return (
        <PageLayout title="Transaction">
            <p className="text-lg text-gray-600 mb-8">
                Below is the list of your recent transactions:
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-left">
                            <th className="px-4 py-2">Transaction ID</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Operator</th>
                            <th className="px-4 py-2">Plan</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr
                                key={transaction.id}
                                className={
                                    index % 2 === 0
                                        ? "bg-gray-50"
                                        : "bg-white"
                                }
                            >
                                <td className="px-4 py-2 border-b">{transaction.id}</td>
                                <td className="px-4 py-2 border-b">{transaction.date}</td>
                                <td className="px-4 py-2 border-b">{transaction.operator}</td>
                                <td className="px-4 py-2 border-b">{transaction.plan}</td>
                                <td className="px-4 py-2 border-b">{transaction.amount}</td>
                                <td
                                    className={`px-4 py-2 border-b font-medium ${
                                        transaction.status === "Success"
                                            ? "text-green-600"
                                            : transaction.status === "Pending"
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {transaction.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageLayout>
    );
}

export default Transaction;
