import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { FaTag, FaCopy, FaCheckCircle } from "react-icons/fa";
import API from "../Utils/api";
import { formatDate } from "../Utils/format";
import { toast } from "../Utils/toast";

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(new Set());

    const fetchCoupons = async () => {
        try {
            const { data } = await API.get("/coupon/available");
            setCoupons(data.success ? data.data : []);
        } catch (err) {
            console.error("Error fetching coupons:", err);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const copyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied((prev) => new Set([...prev, code]));
            toast.success(`Copied "${code}" — use it at checkout`);
            setTimeout(() => setCopied((prev) => {
                const next = new Set(prev);
                next.delete(code);
                return next;
            }), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
            toast.error("Could not copy code");
        }
    };

    const typeLabel = (type) => (type === "percent" ? "Percentage" : "Flat (₹)");

    if (loading) {
        return (
            <PageLayout title="Available Coupons">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Loading coupons…
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Available Coupons">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Available Coupons</h2>
                <p className="text-sm text-gray-400">
                    Copy a code and apply it at checkout to save on your recharge.
                </p>
            </div>

            {coupons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((c) => {
                        const isCopied = copied.has(c.code);
                        const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                        return (
                            <div
                                key={c.code}
                                className={`rounded-xl border p-5 bg-[#1e1e1e] ${
                                    expired ? "border-[#ef4444]/30 bg-[#ef4444]/10" : "border-[#444444]"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            expired
                                                ? "bg-[#ef4444]/20 text-[#ef4444]"
                                                : "bg-[#50c878]/20 text-[#50c878]"
                                        }`}
                                    >
                                        {expired ? "Expired" : "Active"}
                                    </span>
                                    <button
                                        onClick={() => copyCode(c.code)}
                                        className="flex items-center gap-1 text-[#50c878] hover:text-[#3da861] text-xs transition"
                                    >
                                        {isCopied ? (
                                            <FaCheckCircle size={14} />
                                        ) : (
                                            <>
                                                <FaCopy size={14} /> Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mb-2">
                                    <span className="text-xl font-mono font-bold text-white">{c.code}</span>
                                    {c.description && (
                                        <p className="text-sm text-gray-400 mt-1">{c.description}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-3">
                                    <span>
                                        <FaTag size={12} className="mr-1" /> {typeLabel(c.type)}
                                    </span>
                                    <span>
                                        {c.type === "percent" ? `${c.value}%` : `₹{c.value}`} off
                                    </span>
                                    {c.minAmount > 0 && (
                                        <span colSpan={2}>
                                            Min order: ₹{c.minAmount}
                                        </span>
                                    )}
                                    {c.maxDiscount > 0 && (
                                        <span colSpan={2}>
                                            Max discount: ₹{c.maxDiscount}
                                        </span>
                                    )}
                                </div>
                                {c.expiresAt && (
                                    <p className="text-xs text-gray-500">
                                        Expires {formatDate(c.expiresAt)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-8 text-center">
                    <FaTag size={32} className="mx-auto mb-3 text-gray-600" />
                    <h3 className="text-lg font-medium text-white">No coupons available</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Check back later for discount offers.
                    </p>
                </div>
            )}
        </PageLayout>
    );
};

export default Coupons;
