import { useEffect, useMemo, useState } from "react";
import PageLayout from "./PageLayout";
import AdminTabs from "../components/AdminTabs";
import { FaHistory, FaSyncAlt } from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import { toast } from "../Utils/toast";

const ACTION_LABELS = {
    "wallet.credit": "Wallet credit",
    "wallet.debit": "Wallet debit",
    "transaction.refund": "Transaction refund",
    "user.role": "Role change",
    "user.status": "Status change",
    "user.delete": "User deleted",
};

const ACTION_STYLES = {
    "wallet.credit": "bg-[#50c878]/10 text-[#50c878]",
    "wallet.debit": "bg-[#fb923c]/10 text-[#fb923c]",
    "transaction.refund": "bg-[#f59e0b]/10 text-[#f59e0b]",
    "user.role": "bg-[#3b82f6]/10 text-[#60a5fa]",
    "user.status": "bg-[#a855f7]/10 text-[#c084fc]",
    "user.delete": "bg-[#ef4444]/10 text-[#ef4444]",
};

const Admin_Audit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { limit: 200 };
            if (action) params.action = action;
            const { data } = await API.get("/admin/audit", { params });
            if (data.success) setLogs(data.data || []);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
            toast.error("Failed to load audit log");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action]);

    const actions = useMemo(
        () => [...new Set(logs.map((log) => log.action))].sort(),
        [logs]
    );

    return (
        <PageLayout title="Audit Log">
            <AdminTabs />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-white">Admin activity</h2>
                    <p className="text-sm text-gray-400">
                        Wallet, refund, role and status changes made by administrators.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="rounded border border-[#444444] bg-[#1e1e1e] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All actions</option>
                        {actions.map((value) => (
                            <option key={value} value={value}>
                                {ACTION_LABELS[value] || value}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 rounded border border-[#50c878] px-3 py-2 text-sm text-[#50c878] hover:bg-[#50c878]/10"
                    >
                        <FaSyncAlt size={12} /> Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#444444] bg-[#1e1e1e]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="border-b border-[#444444] text-left text-gray-400">
                                <th className="px-4 py-2">When</th>
                                <th className="px-4 py-2">Actor</th>
                                <th className="px-4 py-2">Action</th>
                                <th className="px-4 py-2">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                        Loading audit log...
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="border-b border-[#444444] hover:bg-[#2a2a2a]/50">
                                        <td className="whitespace-nowrap px-4 py-2 text-gray-400">
                                            {formatDateTime(log.createdAt)}
                                        </td>
                                        <td className="px-4 py-2">{log.actor_name || "System"}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    ACTION_STYLES[log.action] || "bg-[#444444]/40 text-gray-300"
                                                }`}
                                            >
                                                <FaHistory size={10} />
                                                {ACTION_LABELS[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-300">{log.details || "—"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                        No audit entries yet.
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

export default Admin_Audit;
