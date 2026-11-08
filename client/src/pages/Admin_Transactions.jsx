import { useEffect, useState, useCallback } from "react";
import PageLayout from "./PageLayout";
import AdminTabs from "../components/AdminTabs";
import { FaDownload, FaFilter, FaUndo, FaTimes } from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import { toast } from "../Utils/toast";

const EMPTY_FILTERS = {
    status: "",
    type: "",
    platform: "",
    from: "",
    to: "",
    search: "",
    refunded: "",
};

const Admin_Transactions = () => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [applied, setApplied] = useState(EMPTY_FILTERS);
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 25 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refundTarget, setRefundTarget] = useState(null);
    const [refundReason, setRefundReason] = useState("");
    const [refunding, setRefunding] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 25 };
            Object.entries(applied).forEach(([key, value]) => {
                if (value) params[key] = value;
            });
            const { data } = await API.get("/admin/transactions", { params });
            if (data.success) {
                setItems(data.data.items || []);
                setMeta({
                    total: data.data.total || 0,
                    page: data.data.page || 1,
                    pages: data.data.pages || 1,
                    limit: data.data.limit || 25,
                });
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [applied, page]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = (event) => {
        event.preventDefault();
        setPage(1);
        setApplied(filters);
    };

    const resetFilters = () => {
        setFilters(EMPTY_FILTERS);
        setApplied(EMPTY_FILTERS);
        setPage(1);
    };

    const submitRefund = async () => {
        if (!refundTarget) return;
        setRefunding(true);
        try {
            const { data } = await API.post(`/admin/transactions/${refundTarget._id}/refund`, {
                reason: refundReason.trim(),
            });
            toast.success(`₹${data.data.refundedAmount} refunded to wallet`);
            setRefundTarget(null);
            setRefundReason("");
            fetchTransactions();
        } catch (err) {
            toast.error(err.response?.data?.message || "Refund failed");
        } finally {
            setRefunding(false);
        }
    };

    const exportCSV = () => {
        if (!items.length) {
            toast.info("Nothing to export");
            return;
        }
        const header = ["Date", "User", "Email", "Mobile", "Type", "Operator", "Amount", "Status", "Refunded"];
        const rows = items.map((txn) => {
            const user = txn.user_id || {};
            return [
                formatDateTime(txn.transaction_date_time),
                user.name || "",
                user.email || "",
                txn.mobile_number || user.mobile_no || "",
                txn.transactionType,
                txn.plan?.platform || "",
                txn.amount_to_pay,
                txn.status,
                txn.refunded ? "Yes" : "No",
            ];
        });
        const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transactions-page-${meta.page}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const statusBadge = (status) => (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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

    return (
        <PageLayout title="Transactions">
            <AdminTabs />

            <form
                onSubmit={applyFilters}
                className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#444444] bg-[#1e1e1e] p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Search mobile</label>
                    <input
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Type</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All</option>
                        <option value="recharge">Recharge</option>
                        <option value="wallet">Wallet</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Operator</label>
                    <select
                        name="platform"
                        value={filters.platform}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All</option>
                        <option value="Jio">Jio</option>
                        <option value="Airtel">Airtel</option>
                        <option value="Vi">Vi</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">From</label>
                    <input
                        type="date"
                        name="from"
                        value={filters.from}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">To</label>
                    <input
                        type="date"
                        name="to"
                        value={filters.to}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Refunded</label>
                    <select
                        name="refunded"
                        value={filters.refunded}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All</option>
                        <option value="true">Refunded</option>
                        <option value="false">Not refunded</option>
                    </select>
                </div>
                <div className="flex items-end gap-2">
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
                </div>
            </form>

            <div className="overflow-hidden rounded-xl border border-[#444444] bg-[#1e1e1e]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <h3 className="text-base font-semibold text-white">
                        Transactions <span className="text-xs text-gray-500">({meta.total})</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1 rounded border border-[#50c878] px-3 py-1.5 text-xs text-[#50c878] hover:bg-[#50c878]/10"
                        >
                            <FaDownload size={12} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="border-b border-[#444444] text-left text-gray-400">
                                <th className="px-4 pb-2">Date</th>
                                <th className="px-4 pb-2">User</th>
                                <th className="px-4 pb-2">Mobile</th>
                                <th className="px-4 pb-2">Type / Operator</th>
                                <th className="px-4 pb-2 text-right">Amount</th>
                                <th className="px-4 pb-2 text-center">Status</th>
                                <th className="px-4 pb-2 text-center">Refund</th>
                                <th className="px-4 pb-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : items.length > 0 ? (
                                items.map((txn) => {
                                    const user = txn.user_id || {};
                                    const canRefund =
                                        txn.transactionType === "recharge" &&
                                        txn.status === "Success" &&
                                        !txn.refunded;
                                    return (
                                        <tr
                                            key={txn._id}
                                            className="border-b border-[#444444] hover:bg-[#2a2a2a]/50"
                                        >
                                            <td className="px-4 py-2 text-gray-400">
                                                {formatDateTime(txn.transaction_date_time)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div>{user.name || "-"}</div>
                                                <div className="text-xs text-gray-500">{user.email || ""}</div>
                                            </td>
                                            <td className="px-4 py-2">{txn.mobile_number || "-"}</td>
                                            <td className="px-4 py-2 text-gray-300">
                                                <div className="capitalize">{txn.transactionType}</div>
                                                <div className="text-xs text-gray-500">
                                                    {txn.plan?.platform || "—"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">₹{txn.amount_to_pay}</td>
                                            <td className="px-4 py-2 text-center">{statusBadge(txn.status)}</td>
                                            <td className="px-4 py-2 text-center">
                                                {txn.refunded ? (
                                                    <span className="text-xs text-[#f59e0b]">
                                                        Refunded ₹{txn.refundedAmount}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {canRefund ? (
                                                    <button
                                                        onClick={() => {
                                                            setRefundTarget(txn);
                                                            setRefundReason("");
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded border border-[#f59e0b] px-2 py-1 text-xs text-[#f59e0b] hover:bg-[#f59e0b]/10"
                                                    >
                                                        <FaUndo size={11} /> Refund
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-600">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        No transactions match these filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-[#444444] px-4 py-3 text-xs text-gray-400">
                    <span>
                        Page {meta.page} of {meta.pages} · {meta.limit} per page
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={meta.page <= 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="rounded border border-[#444444] px-3 py-1 disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <button
                            disabled={meta.page >= meta.pages}
                            onClick={() => setPage((prev) => Math.min(meta.pages, prev + 1))}
                            className="rounded border border-[#444444] px-3 py-1 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {refundTarget && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-xl border border-[#444444] bg-[#1e1e1e] p-5">
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Refund recharge</h3>
                                <p className="mt-1 text-xs text-gray-400">
                                    ₹{refundTarget.amount_to_pay} will be credited to the user&apos;s wallet.
                                </p>
                            </div>
                            <button
                                onClick={() => setRefundTarget(null)}
                                className="text-gray-400 hover:text-white"
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <label className="mb-1 block text-xs text-gray-400">Reason (optional)</label>
                        <textarea
                            value={refundReason}
                            onChange={(event) => setRefundReason(event.target.value)}
                            rows={3}
                            maxLength={200}
                            placeholder="e.g. duplicate charge, operator failure"
                            className="w-full rounded-lg border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setRefundTarget(null)}
                                className="rounded-lg border border-[#444444] px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRefund}
                                disabled={refunding}
                                className="rounded-lg bg-[#f59e0b] px-4 py-2 text-sm font-medium text-[#1e1e1e] hover:bg-[#d97706] disabled:opacity-60"
                            >
                                {refunding ? "Refunding..." : "Confirm refund"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Admin_Transactions;
