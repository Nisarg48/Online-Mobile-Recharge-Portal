import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import AdminTabs from "../components/AdminTabs";
import {
    FaChartPie, FaUsers, FaExchangeAlt, FaMoneyBillWave, FaDownload,
    FaUserPlus, FaRupeeSign, FaFilter,
} from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import { toast } from "../Utils/toast";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#50c878", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [popularPlans, setPopularPlans] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [failedByPlatform, setFailedByPlatform] = useState([]);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [platform, setPlatform] = useState("");

    const fetchDashboard = async (filters = {}) => {
        setLoading(true);
        try {
            const params = {};
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;
            if (filters.platform) params.platform = filters.platform;

            const { data } = await API.get("/admin/dashboard", { params });
            if (data.success) {
                setStats(data.data);
                setPopularPlans(data.data.popularPlans || []);
                setRecentTransactions(data.data.recentTransactions || []);
                setRevenueTrend(data.data.revenueTrend || []);
                setFailedByPlatform(data.data.failedByPlatform || []);
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

    const applyFilters = (event) => {
        event.preventDefault();
        fetchDashboard({ from, to, platform });
    };

    const resetFilters = () => {
        setFrom("");
        setTo("");
        setPlatform("");
        fetchDashboard();
    };

    const exportPDF = () => {
        if (!stats) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text("RechargeHub - Admin Dashboard", 14, 22);
        doc.setFontSize(12);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 34);
        if (stats.filters?.from || stats.filters?.to || stats.filters?.platform) {
            doc.text(
                `Filters: ${stats.filters.from || "start"} to ${stats.filters.to || "now"}` +
                (stats.filters.platform ? ` · ${stats.filters.platform}` : ""),
                14,
                42
            );
        }

        autoTable(doc, {
            startY: 50,
            head: [["Metric", "Value"]],
            body: [
                ["Total Users", stats.users.total],
                ["Active Users", stats.users.active],
                ["New Users (period)", stats.users.new],
                ["Admin Users", stats.users.admins],
                ["Total Transactions", stats.transactions.total],
                ["Successful", stats.transactions.success],
                ["Failed", stats.transactions.failed],
                ["Pending", stats.transactions.pending],
                ["Success Rate (%)", stats.transactions.successRate],
                ["Total Revenue (INR)", stats.revenue.total],
                ["ARPU (INR)", stats.revenue.arpu],
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

    if (loading && !stats) {
        return (
            <PageLayout title="Admin Dashboard">
                <AdminTabs />
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Loading dashboard analytics...
                </div>
            </PageLayout>
        );
    }

    if (!stats) {
        return (
            <PageLayout title="Admin Dashboard">
                <AdminTabs />
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Failed to load dashboard analytics.
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Admin Dashboard">
            <AdminTabs />

            <form
                onSubmit={applyFilters}
                className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[#444444] bg-[#1e1e1e] p-4"
            >
                <div>
                    <label className="mb-1 block text-xs text-gray-400">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                        className="rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                        className="rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Operator</label>
                    <select
                        value={platform}
                        onChange={(event) => setPlatform(event.target.value)}
                        className="rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All operators</option>
                        <option value="Jio">Jio</option>
                        <option value="Airtel">Airtel</option>
                        <option value="Vi">Vi</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-[#50c878] px-4 py-2 text-sm font-medium text-[#1e1e1e] hover:bg-[#3da861]"
                >
                    <FaFilter size={12} /> Apply
                </button>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-[#444444] px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                >
                    Reset
                </button>
                {stats.filters?.from || stats.filters?.to || stats.filters?.platform ? (
                    <span className="text-xs text-gray-500">
                        Showing filtered totals{stats.filters.platform ? ` · ${stats.filters.platform}` : ""}
                    </span>
                ) : (
                    <span className="text-xs text-gray-500">All-time totals</span>
                )}
            </form>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Total Users</p>
                            <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                        </div>
                        <FaUsers className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.users.active} active · {stats.users.admins} admins
                    </p>
                </div>
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">New Users</p>
                            <p className="text-2xl font-bold text-white">{stats.users.new}</p>
                        </div>
                        <FaUserPlus className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {stats.filters?.from || stats.filters?.to ? "In selected period" : "Last 30 days"}
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
                            <p className="text-2xl font-bold text-white">₹{stats.revenue.total}</p>
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
                            <p className="text-xs text-gray-400 uppercase">ARPU</p>
                            <p className="text-2xl font-bold text-white">₹{stats.revenue.arpu}</p>
                        </div>
                        <FaRupeeSign className="text-[#50c878] text-xl" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Revenue per active user</p>
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
                        {stats.transactions.failed} failed · {stats.transactions.pending} pending
                    </p>
                </div>
            </div>

            {/* Revenue trend */}
            <div className="mb-6 rounded-xl border border-[#444444] bg-[#1e1e1e] p-4">
                <h3 className="mb-4 text-base font-semibold text-white">Revenue Trend</h3>
                {revenueTrend.length > 0 ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#50c878"
                                    fill="#50c878"
                                    fillOpacity={0.2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-64 items-center justify-center text-gray-500">
                        No revenue in this period.
                    </div>
                )}
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
                                <th className="pb-2 text-right">Revenue (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularPlans.map((p) => (
                                <tr key={p.plan_id} className="border-b border-[#444444]">
                                    <td className="py-2 text-white">{p.platform} · {p.category}</td>
                                    <td className="py-2 text-right text-[#50c878]">{p.count}</td>
                                    <td className="py-2 text-right">{p.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Plan distribution pie + failures */}
                <div className="p-4 rounded-xl border border-[#444444] bg-[#1e1e1e] flex flex-col">
                    <h3 className="mb-4 text-base font-semibold text-white">Plan Distribution</h3>
                    {popularPlans.length > 0 ? (
                        <div className="flex-1 min-h-[220px] flex items-center justify-center">
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
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            No plan distribution data yet.
                        </div>
                    )}
                    <div className="mt-4 border-t border-[#444444] pt-3">
                        <h4 className="mb-2 text-xs uppercase text-gray-400">Failed by Operator</h4>
                        {failedByPlatform.length > 0 ? (
                            <ul className="space-y-1 text-xs text-gray-300">
                                {failedByPlatform.map((row) => (
                                    <li key={row.platform} className="flex justify-between">
                                        <span>{row.platform}</span>
                                        <span className="text-[#ef4444]">{row.count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-500">No failed recharges.</p>
                        )}
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
                                                {formatDateTime(txn.transaction_date_time)}
                                            </td>
                                            <td className="py-2">
                                                {user.name || "-"} ({user.mobile_no || "-"})
                                            </td>
                                            <td className="py-2 text-gray-300">
                                                {plan.platform || "Wallet Top-up"}
                                            </td>
                                            <td className="py-2 text-right">
                                                ₹{txn.amount_to_pay}
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
