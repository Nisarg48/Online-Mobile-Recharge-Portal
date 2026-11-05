import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { FaStar, FaCheck, FaUser, FaComment } from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import { toast } from "../Utils/toast";

const Feedback_Management = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedback = async () => {
        try {
            const { data } = await API.get("/feedback/getAllFeedback");
            setFeedback(data.success ? data.data : []);
        } catch (err) {
            console.error("Error fetching feedback:", err);
            toast.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const stars = (rating) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        const nodes = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= full) nodes.push(<FaStar key={i} className="text-[#f59e0b]" size={14} />);
            else if (i === full + 1 && half)
                nodes.push(<FaStar key={i} className="text-[#f59e0b] fill-[#f59e0b]" size={14} />);
            else nodes.push(<FaStar key={i} className="text-gray-600" size={14} />);
        }
        return nodes;
    };

    if (loading) {
        return (
            <PageLayout title="Feedback Management">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Loading feedback...
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Feedback Management">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Customer Feedback</h2>
                <p className="text-sm text-gray-400">
                    Feedback is only accepted after a completed recharge, so every entry below
                    represents a verified paying customer (legit-user check enforced server-side).
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-[#444444] rounded-xl bg-[#1e1e1e]">
                    <thead>
                        <tr className="bg-[#50c878] text-black border-b border-[#444444]">
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-center">Rating</th>
                            <th className="p-3 text-left">Message</th>
                            <th className="p-3 text-center">Linked Recharge</th>
                            <th className="p-3 text-left">Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedback.length > 0 ? (
                            feedback.map((f) => {
                                const user = f.user || {};
                                return (
                                    <tr
                                        key={f._id}
                                        className="border-b border-[#444444] hover:bg-[#2a2a2a]/50"
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-[#50c878] text-sm" />
                                                <span className="text-white">{user.name || "Unknown"}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {f.user?._id || "-"}
                                            </p>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {stars(f.rating)}
                                                <span className="text-xs text-[#f59e0b] font-medium ml-1">
                                                    {f.rating}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-300">
                                            &quot;{f.message}&quot;
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#50c878]/10 text-[#50c878] text-xs font-medium">
                                                <FaCheck size={12} />
                                                Verified Recharge
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-400 text-sm">
                                            {formatDateTime(f.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-6 text-center text-gray-500">
                                    No feedback yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>
                    <FaComment className="mr-1" /> Total feedback entries:{" "}
                    <span className="text-white font-medium">{feedback.length}</span>
                </p>
                <p className="mt-1">
                    Average rating:{" "}
                    {feedback.length > 0
                        ? (
                            feedback.reduce((sum, f) => sum + f.rating, 0) /
                            feedback.length
                        ).toFixed(2)
                        : "-"
                    }
                </p>
            </div>
        </PageLayout>
    );
};

export default Feedback_Management;
