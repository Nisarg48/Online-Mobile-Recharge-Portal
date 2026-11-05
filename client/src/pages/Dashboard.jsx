import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import {
    FaChartPie, FaUsers, FaExchangeAlt, FaMoneyBillWave, FaDownload,
} from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import { toast } from "../Utils/toast";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#50c878", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [popularPlans, setPopularPlans] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const { data } = await API.get("/admin/dashboard");
            if (data.success) {
                setStats(data.data);
                setPopularPlans(data.data.popularPlans || []);
                setRecentTransactions(data.data.recentTransactions || []);
            }
        } catch (err) {
            console.error("Error fetching dashboard:", err);
            toast.error("Failed to load dashboard analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const exportPDF = () => {
        if (!stats) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("RechargeHub - Admin Dashboard", 14, 22);
        doc.setFontSize(12);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 34);

        autoTable(doc, {
            startY: 44,
            head: [["Metric", "Value"]],
            body: [
                ["Total Users", stats.users.total],
                ["Active Users", stats.users.active],
                ["Admin Users", stats.users.admins],
                ["Total Transactions", stats.transactions.total],
                ["Successful", stats.transactions.success],
                ["Failed", stats.transactions.failed],
                ["Pending", stats.transactions.pending],
                ["Success Rate (%)", stats.transactions.successRate],
                ["Total Revenue (\u20B9)", stats.revenue.total],
                ["Wallet Top-ups", stats.revenue.walletTopups],
            ],
            theme: "grid",
            headStyles: { fillColor: [80, 200, 120] },
        });

        doc.save("admin-dashboard.pdf");
    };

    const statusBadge = (status) => (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                status === "Success"
                    ? "bg-[#50c878]/10 text-[#50c878]"
                    : status === "Failed"
                      ? "bg-[#ef4444]/10 text-[#ef4444]"
                      : "bg-[#f59e0b]/10 text-[#f59e0b]"
            }`}
        >
            {status}
        </span>
    );

    if (loading) {
        return (
            <PageLayout title="Admin Dashboard">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Loading dashboard analytics...
                </div>
            </PageLayout>
        );
    }

    if (!stats) {
        return (
            <PageLayout title="Admin Dashboard">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Failed to load dashboard analytics.
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Admin Dashboard">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Total Users</p>
                            <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                        </div>
                        <FaUsers className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.users.active} active \u00b7 {stats.users.admins} admins
                    </p>
                </div>
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Success Rate</p>
                            <p className="text-2xl font-bold text-[#50c878]">
                                {stats.transactions.successRate}%
                            </p>
                        </div>
                        <FaChartPie className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.transactions.success} of {stats.transactions.total}
                    </p>
                </div>
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Total Revenue</p>
                            <p className="text-2xl font-bold text-white">
                                \u20B9{stats.revenue.total}
                            </p>
                        </div>
                        <FaMoneyBillWave className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.revenue.walletTopups} wallet top-ups
                    </p>
                </div>
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Transactions</p>
                            <p className="text-2xl font-bold text-white">
                                {stats.transactions.total}
                            </p>
                        </div>
                        <FaExchangeAlt className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.transactions.failed} failed \u00b7 {stats.transactions.pending} pending
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular plans chart */}
                <div className="lg:col-span-2 p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <h3 className="mb-4 text-base font-semibold text-white">Popular Plans</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularPlans}>
                                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#50c878" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <table className="mt-4 w-full text-xs text-gray-400">
                        <thead>
                            <tr className="text-left border-b border-[#444444]">
                                <th className="pb-2">Plan</th>
                                <th className="pb-2 text-right">Recharges</th>
                                <th className="pb-2 text-right">Revenue (\u20B9)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularPlans.map((p) => (
                                <tr key={p.plan_id} className="border-b border-[#444444]">
                                    <td className="py-2 text-white">{p.platform} \u00b7 {p.category}</td>
                                    <td className="py-2 text-right text-[#50c878]">{p.count}</td>
                                    <td className="py-2 text-right">{p.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Plan distribution pie */}
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e] flex flex-col">
                    <h3 className="mb-4 text-base font-semibold text-white">Plan Distribution</h3>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        <PieChart>
                            <Pie
                                data={popularPlans}
                                dataKey="count"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                fill="#8884d8"
                                label
                            >
                                {popularPlans.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="mt-6 p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">Recent Activity</h3>
                    <button
                        onClick={exportPDF}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#50c878] text-[#50c878] rounded hover:bg-[#50c878]/10 transition"
                    >
                        <FaDownload size={14} /> Export PDF
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="border-b border-[#444444] text-gray-400">
                                <th className="pb-2 text-left">Date</th>
                                <th className="pb-2 text-left">User</th>
                                <th className="pb-2 text-left">Plan</th>
                                <th className="pb-2 text-right">Amount</th>
                                <th className="pb-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((txn) => {
                                    const user = txn.user_id || {};
                                    const plan = txn.plan || txn.plan_id || {};
                                    return (
                                        <tr
                                            key={txn._id}
                                            className="border-b border-[#444444] hover:bg-[#2a2a2a]/50"
                                        >
                                            <td className="py-2 text-gray-400">
                                                {formatDateTime(txn.createdAt)}
                                            </td>
                                            <td className="py-2">
                                                {user.name || "-"} ({user.mobile_no || "-"})
                                            </td>
                                            <td className="py-2 text-gray-300">
                                                {plan.platform || "Wallet Top-up"}
                                            </td>
                                            <td className="py-2 text-right">
                                                \u20B9{txn.amount_to_pay}
                                            </td>
                                            <td className="py-2 text-center">{statusBadge(txn.status)}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-gray-500">
                                        No recent activity.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
};

export default Dashboard;
