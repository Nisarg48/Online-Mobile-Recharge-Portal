import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";
import { FaPlus, FaEdit, FaTrash, FaTag, FaClock } from "react-icons/fa";
import API from "../Utils/api";
import { formatDate } from "../Utils/format";
import { toast } from "../Utils/toast";
import Swal from "sweetalert2";

const Coupon_Management = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState({
        code: "",
        description: "",
        type: "flat",
        value: "",
        maxDiscount: "",
        minAmount: "",
        active: true,
        expiresAt: "",
        usageLimit: "",
        perUserLimit: "",
    });

    const fetchCoupons = async () => {
        try {
            const { data } = await API.get("/coupon/list");
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

    const resetForm = () => {
        setForm({
            code: "",
            description: "",
            type: "flat",
            value: "",
            maxDiscount: "",
            minAmount: "",
            active: true,
            expiresAt: "",
            usageLimit: "",
            perUserLimit: "",
        });
        setCurrent(null);
        setEditing(false);
    };

    const handleSave = async () => {
        const payload = {
            code: form.code,
            description: form.description,
            type: form.type,
            value: Number(form.value) || 0,
            maxDiscount: Number(form.maxDiscount) || 0,
            minAmount: Number(form.minAmount) || 0,
            active: form.active,
            expiresAt: form.expiresAt || null,
            usageLimit: Number(form.usageLimit) || 0,
            perUserLimit: Number(form.perUserLimit) || 1,
        };

        try {
            if (editing && current) {
                await API.put(`/coupon/update/${current._id}`, payload);
                toast.success("Coupon updated");
            } else {
                await API.post("/coupon/add", payload);
                toast.success("Coupon created");
            }
            setOpen(false);
            resetForm();
            fetchCoupons();
        } catch (err) {
            console.error("Error saving coupon:", err);
            toast.error(err.response?.data?.message || "Failed to save coupon");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete coupon?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#d33",
            confirmButtonText: "Delete",
        });
        if (!result.isConfirmed) return;
        try {
            await API.delete(`/coupon/delete/${id}`);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (err) {
            console.error("Error deleting coupon:", err);
            toast.error("Failed to delete coupon");
        }
    };

    const handleEdit = (coupon) => {
        setCurrent(coupon);
        setEditing(true);
        setForm({
            code: coupon.code,
            description: coupon.description || "",
            type: coupon.type,
            value: coupon.value,
            maxDiscount: coupon.maxDiscount || "",
            minAmount: coupon.minAmount || "",
            active: coupon.active,
            expiresAt: coupon.expiresAt
                ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
                : "",
            usageLimit: coupon.usageLimit || "",
            perUserLimit: coupon.perUserLimit || "",
        });
        setOpen(true);
    };

    const statusBadge = (active) => (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                active ? "bg-[#50c878]/10 text-[#50c878]" : "bg-[#ef4444]/10 text-[#ef4444]"
            }`}
        >
            {active ? "Active" : "Inactive"}
        </span>
    );

    const typeLabel = (type) => (type === "percent" ? "Percentage" : "Flat (\u20B9)");

    if (loading) {
        return (
            <PageLayout title="Coupon Management">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    Loading coupons...
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Coupon Management">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Discount Coupons</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#50c878] text-black rounded hover:bg-[#3da861] transition"
                >
                    <FaPlus size={16} /> Add Coupon
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-[#444444] rounded-xl bg-[#1e1e1e]">
                    <thead>
                        <tr className="bg-[#50c878] text-black border-b border-[#444444]">
                            <th className="p-3 text-left">Code</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-right">Value</th>
                            <th className="p-3 text-right">Min Amount</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Expires</th>
                            <th className="p-3 text-center">Used</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length > 0 ? (
                            coupons.map((c) => (
                                <tr key={c._id} className="border-b border-[#444444] hover:bg-[#2a2a2a]/50">
                                    <td className="p-3 text-white font-mono">{c.code}</td>
                                    <td className="p-3 text-gray-400">{c.description || "-"}</td>
                                    <td className="p-3 text-gray-300">{typeLabel(c.type)}</td>
                                    <td className="p-3 text-right text-white">
                                        {c.type === "percent" ? `${c.value}%` : `\u20B9{c.value}`}
                                    </td>
                                    <td className="p-3 text-right text-gray-400">
                                        {c.minAmount > 0 ? `\u20B9{c.minAmount}` : "-"}
                                    </td>
                                    <td className="p-3 text-center">{statusBadge(c.active)}</td>
                                    <td className="p-3 text-center text-gray-400 text-xs">
                                        {c.expiresAt ? formatDate(c.expiresAt) : "-"}
                                    </td>
                                    <td className="p-3 text-center text-gray-400">
                                        {c.usedCount} / {c.usageLimit || "\u221e"}
                                    </td>
                                    <td className="p-3 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="text-[#50c878] hover:underline text-xs flex items-center gap-1"
                                        >
                                            <FaEdit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c._id)}
                                            className="text-red-400 hover:underline text-xs flex items-center gap-1"
                                        >
                                            <FaTrash size={14} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-6 text-center text-gray-500">
                                    No coupons yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit modal */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-[#1e1e1e] text-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-[#444444]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editing ? "Edit Coupon" : "Add Coupon"}
                            </h3>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTrash size={20} />
                            </button>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Coupon Code
                                    </label>
                                    <input
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        placeholder="e.g. WELCOME10"
                                        className="w-full p-2 pl-9 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                    />
                                    <FaTag className="absolute left-3 top-9 text-[#50c878] text-xs" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Description
                                    </label>
                                    <input
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        placeholder="e.g. 10% off on first recharge"
                                        className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={form.type}
                                            onChange={(e) =>
                                                setForm({ ...form, type: e.target.value })
                                            }
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        >
                                            <option value="percent">Percentage</option>
                                            <option value="flat">Flat (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Value
                                        </label>
                                        <input
                                            type="number"
                                            value={form.value}
                                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                                            placeholder="0"
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Max Discount (\u20B9)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.maxDiscount}
                                            onChange={(e) =>
                                                setForm({ ...form, maxDiscount: e.target.value })
                                            }
                                            placeholder="0 = none"
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Min Amount (\u20B9)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.minAmount}
                                            onChange={(e) =>
                                                setForm({ ...form, minAmount: e.target.value })
                                            }
                                            placeholder="0 = none"
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={form.usageLimit}
                                            onChange={(e) =>
                                                setForm({ ...form, usageLimit: e.target.value })
                                            }
                                            placeholder="0 = unlimited"
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Per User Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={form.perUserLimit}
                                            onChange={(e) =>
                                                setForm({ ...form, perUserLimit: e.target.value })
                                            }
                                            placeholder="1"
                                            className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Expires At
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.expiresAt}
                                        onChange={(e) =>
                                            setForm({ ...form, expiresAt: e.target.value })
                                        }
                                        className="w-full p-2 border border-[#444444] rounded bg-[#121212] text-white focus:border-[#50c878]"
                                    />
                                    <FaClock className="absolute left-3 top-9 text-[#50c878] text-xs" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="active"
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(e) =>
                                            setForm({ ...form, active: e.target.checked })
                                        }
                                        className="w-4 h-4 text-[#50c878] bg-[#121212] border-[#444444] rounded focus:ring-[#50c878]"
                                    />
                                    <label htmlFor="active" className="text-sm text-gray-300">
                                        Active
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-400 rounded hover:bg-[#2a2a2a] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-[#50c878] text-black rounded hover:bg-[#3da861] transition font-medium"
                                >
                                    {editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Coupon_Management;
