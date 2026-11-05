import { useEffect, useState } from "react";
import {
    Wallet,
    Save,
    Edit2,
    ArrowLeft,
    Lock,
    LogOut,
    MapPin,
    Phone,
    Mail,
    User as UserIcon,
    Users,
    CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../Utils/api";
import { logout } from "../Utils/auth";
import { formatDate, formatDateTime } from "../Utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../Utils/toast";

const emptyForm = {
    name: "",
    email: "",
    mobile_no: "",
    alternate_mobile: "",
    address: "",
    avatar: "",
    autoRechargeEnabled: false,
};

// Initials shown when the user has no avatar URL.
const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "U";

// Predefined avatar set — users pick one instead of pasting an image URL.
const AVATAR_OPTIONS = [
    { emoji: "🐶", color: "#50c878" },
    { emoji: "🐱", color: "#f59e0b" },
    { emoji: "🐰", color: "#ef4444" },
    { emoji: "🦊", color: "#3b82f6" },
    { emoji: "🐻", color: "#a855f7" },
    { emoji: "🐼", color: "#06b6d4" },
    { emoji: "🐨", color: "#84cc16" },
    { emoji: "🐯", color: "#ec4899" },
    { emoji: "🦁", color: "#f97316" },
    { emoji: "🐮", color: "#6366f1" },
    { emoji: "🐷", color: "#e879f9" },
    { emoji: "🐸", color: "#22c55e" },
];

const isEmojiAvatar = (value) =>
    Boolean(value && AVATAR_OPTIONS.some((o) => o.emoji === value));

const avatarColor = (value) =>
    AVATAR_OPTIONS.find((o) => o.emoji === value)?.color || "#50c878";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [lastTransaction, setLastTransaction] = useState(null);
    const [walletActivity, setWalletActivity] = useState([]);
    const [autoRechargeLogs, setAutoRechargeLogs] = useState([]);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [fundsError, setFundsError] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            let userData;
            try {
                ({ data: userData } = await API.get("/user/getUser"));
                setUser(userData);
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    mobile_no: userData.mobile_no || "",
                    alternate_mobile: userData.alternate_mobile || "",
                    address: userData.address || "",
                    avatar: userData.avatar || "",
                    autoRechargeEnabled: Boolean(userData.autoRechargeEnabled),
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    logout();
                    navigate("/login", { replace: true });
                    return;
                }
                setError("Could not load your profile. Please try again.");
                return;
            } finally {
                setLoading(false);
            }

            // Current plan (404 simply means no completed recharge yet).
            try {
                const { data } = await API.get("/transactions/getLastTransaction", {
                    params: { mobileNumber: userData.mobile_no },
                });
                setLastTransaction(data);
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error("Error fetching last transaction:", err);
                }
            }

            // Recent wallet activity.
            try {
                const { data } = await API.get("/transactions/getUserTransaction_List");
                const walletOnly = (Array.isArray(data) ? data : [])
                    .filter((txn) => txn.transactionType === "wallet")
                    .sort(
                        (a, b) =>
                            new Date(b.transaction_date_time) - new Date(a.transaction_date_time)
                    )
                    .slice(0, 5);
                setWalletActivity(walletOnly);
            } catch (err) {
                console.error("Error fetching wallet activity:", err);
            }

            // Auto-recharge history (skips/failures/successes).
            try {
                const { data } = await API.get("/autoRecharge/logs");
                setAutoRechargeLogs(Array.isArray(data?.data) ? data.data : []);
            } catch (err) {
                console.error("Error fetching auto-recharge logs:", err);
            }
        };

        fetchData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (emoji) => {
        setSelectedAvatar(emoji);
        setFormData((prev) => ({ ...prev, avatar: emoji }));
    };

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                mobile_no: user.mobile_no || "",
                alternate_mobile: user.alternate_mobile || "",
                address: user.address || "",
                avatar: user.avatar || "",
                autoRechargeEnabled: Boolean(user.autoRechargeEnabled),
            });
            setSelectedAvatar(user.avatar || "");
        }
    };

    const updateUser = async (e) => {
        e?.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                mobile_no: formData.mobile_no.trim(),
                alternate_mobile: formData.alternate_mobile.trim(),
                address: formData.address.trim(),
                avatar: selectedAvatar.trim(),
            };
            const { data } = await API.put("/user/updateUser", payload);
            setUser(data);
            setIsEditing(false);
            toast.success("Profile updated");
        } catch (err) {
            console.error("Error updating profile:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const toggleAutoRecharge = async () => {
        try {
            const next = !formData.autoRechargeEnabled;
            const { data } = await API.put("/user/toggleAutoRecharge", {
                autoRechargeEnabled: next,
            });
            setUser(data);
            setFormData((prev) => ({ ...prev, autoRechargeEnabled: next }));
            toast.success(`Auto recharge ${next ? "enabled" : "disabled"}`);

            if (next && lastTransaction?.plan && Number(user?.wallet) < Number(lastTransaction.plan.price)) {
                toast.info("Your wallet is below the plan price. Top up so the renewal can run.");
            }
        } catch (err) {
            console.error("Error toggling auto recharge:", err.response?.data || err.message);
            toast.error("Failed to toggle auto recharge");
        }
    };

    const handleAddFunds = () => {
        const value = Number(amount);
        if (!amount || Number.isNaN(value) || value <= 0) {
            setFundsError("⚠ Please enter a valid amount!");
            return;
        }
        setFundsError("");
        setShowAddFundsModal(false);
        navigate("/payment-details", {
            state: { plan: value, transactionType: "wallet", mobileNumber: user.mobile_no },
        });
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const isPlanActive =
        lastTransaction?.plan &&
        lastTransaction.planExpiryDate &&
        new Date(lastTransaction.planExpiryDate) >= new Date();

    const renderCurrentPlan = () => {
        if (!isPlanActive) {
            return (
                <div className="rounded-xl border border-dashed border-[#444444] bg-[#1e1e1e] p-5 text-center text-sm text-[#cfcfcf]">
                    No active plan found. Recharge to start using services.
                </div>
            );
        }

        return (
            <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#50c878]">Current Running Plan</h3>
                    <span className="rounded-full bg-[#50c878]/10 px-3 py-1 text-xs font-medium text-[#50c878]">
                        Active until {formatDate(lastTransaction.planExpiryDate)}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-[#cfcfcf]">
                    <p><span className="text-gray-400">Plan:</span> {lastTransaction.plan.platform} - {lastTransaction.plan.category}</p>
                    <p><span className="text-gray-400">Price:</span> ₹{lastTransaction.plan.price}</p>
                    <p><span className="text-gray-400">Validity:</span> {lastTransaction.plan.validity} days</p>
                    <p><span className="text-gray-400">Mobile:</span> {lastTransaction.mobile_number}</p>
                </div>
            </div>
        );
    };

    const renderAutoRechargeStatus = () => {
        const expiry = user?.planExpiryDate || lastTransaction?.planExpiryDate;
        const planPrice = lastTransaction?.plan?.price;
        const planActive = expiry && new Date(expiry) >= new Date();
        const failures = Number(user?.autoRechargeFailures || 0);
        const wallet = Number(user?.wallet || 0);
        const canRecharge = planPrice != null && wallet >= Number(planPrice);

        const lastAttempt = user?.autoRechargeLastAttempt ? (
            <p className="text-xs text-gray-400">
                Last attempt {formatDateTime(user.autoRechargeLastAttempt)}
                {user.autoRechargeLastStatus ? ` · ${user.autoRechargeLastStatus}` : ""}
            </p>
        ) : null;

        const recentLogs =
            autoRechargeLogs.length > 0 ? (
                <ul className="mt-1 space-y-1 border-t border-[#444444] pt-2">
                    {autoRechargeLogs.slice(0, 3).map((log) => (
                        <li key={log._id} className="text-xs text-gray-400">
                            <span
                                className={`font-medium ${
                                    log.status === "Success"
                                        ? "text-green-400"
                                        : log.status === "Failed"
                                          ? "text-red-400"
                                          : "text-yellow-400"
                                }`}
                            >
                                {log.status}
                            </span>{" "}
                            · {formatDateTime(log.createdAt)} · {log.reason}
                        </li>
                    ))}
                </ul>
            ) : null;

        if (!formData.autoRechargeEnabled) {
            return (
                <div className="space-y-1">
                    <p className="text-sm text-gray-400">Auto recharge is disabled.</p>
                    {lastAttempt}
                </div>
            );
        }

        let message;
        let tone = "text-gray-400";

        if (planPrice == null) {
            message = "No plan found yet. Complete a recharge to enable automatic renewals.";
            tone = "text-yellow-400";
        } else if (planActive) {
            message = `Renewal is scheduled for ${formatDate(expiry)}, right after your current plan ends.`;
            tone = "text-green-400";
        } else if (canRecharge) {
            message =
                "Your plan has expired and your wallet covers the renewal. It will run on the next scheduled check (within 2 hours).";
            tone = "text-green-400";
        } else {
            message = `Your plan has expired, but your wallet (₹${wallet}) is below the plan price (₹${planPrice}). Top up to avoid failed renewals.`;
            tone = "text-yellow-400";
        }

        return (
            <div className="space-y-2">
                <p className={`text-sm ${tone}`}>{message}</p>
                {failures > 0 && (
                    <p className="text-xs text-red-400">
                        {failures} consecutive failed attempt{failures === 1 ? "" : "s"}. Auto recharge
                        turns off after 3.
                    </p>
                )}
                {lastAttempt}
                {recentLogs}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] p-6">
                <div className="w-full max-w-4xl">
                    <div className="animate-pulse rounded-3xl border border-[#444444] bg-[#2a2a2a] p-8">
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-[#333333]" />
                            <div className="space-y-3">
                                <div className="h-8 w-48 rounded bg-[#333333]" />
                                <div className="h-4 w-32 rounded bg-[#333333]" />
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="h-12 w-full rounded-lg bg-[#333333]" />
                            <div className="h-12 w-full rounded-lg bg-[#333333]" />
                            <div className="h-12 w-2/3 rounded-lg bg-[#333333]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1e1e1e]">
                <div className="text-lg text-[#cfcfcf]">{error || "Your session has expired."}</div>
                <button
                    onClick={handleLogout}
                    className="rounded-md bg-[#50c878] px-6 py-3 text-white transition hover:bg-[#3da861]"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    const inputClass =
        "w-full rounded-lg border border-[#444444] bg-[#333333] px-4 py-3 text-[#cfcfcf] transition focus:border-[#50c878] focus:ring-2 focus:ring-[#50c878] disabled:opacity-80";

    return (
        <div className="flex min-h-screen justify-center bg-[#1e1e1e] p-4 sm:p-6">
            <div className="w-full max-w-4xl">
                <motion.div
                    className="overflow-hidden rounded-3xl border border-[#444444] bg-[#2a2a2a] shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-[#50c878] to-[#3da861] p-6 sm:p-8">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                            className="absolute left-4 top-4 rounded-lg bg-black/10 p-2 transition hover:bg-black/20"
                        >
                            <ArrowLeft className="h-5 w-5 text-[#1e1e1e]" />
                        </button>
                        <button
                            onClick={handleLogout}
                            aria-label="Logout"
                            className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-sm font-medium text-[#1e1e1e] transition hover:bg-black/20"
                        >
                            <LogOut className="h-4 w-4" /> Logout
                        </button>

                        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                            {isEmojiAvatar(formData.avatar) ? (
                                <div
                                    className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#1e1e1e] shadow-lg"
                                    style={{ backgroundColor: avatarColor(formData.avatar) }}
                                >
                                    <span className="text-5xl">{formData.avatar}</span>
                                </div>
                            ) : formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt={user.name}
                                    className="h-24 w-24 rounded-full border-4 border-[#1e1e1e] object-cover shadow-lg"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#1e1e1e] bg-[#1e1e1e] text-3xl font-bold text-[#50c878] shadow-lg">
                                    {getInitials(formData.name)}
                                </div>
                            )}
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-semibold text-[#1e1e1e] sm:text-3xl">
                                    {user.name}
                                </h1>
                                <p className="text-sm text-[#1e1e1e]/80">{user.email}</p>
                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-xs font-medium capitalize text-[#1e1e1e]">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-6 sm:p-8">
                        {/* Wallet card */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-[#444444] bg-[#1e1e1e] p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#50c878]/15">
                                    <Wallet className="h-6 w-6 text-[#50c878]" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Wallet balance</p>
                                    <p className="text-2xl font-bold text-[#ffffff]">₹{user.wallet ?? 0}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddFundsModal(true)}
                                className="rounded-lg bg-[#50c878] px-5 py-2.5 font-medium text-[#1e1e1e] transition hover:bg-[#3da861]"
                            >
                                Add Money
                            </button>
                        </div>

                        {/* Current plan */}
                        {renderCurrentPlan()}

                        {/* Personal details */}
                        <form onSubmit={updateUser} className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-[#ffffff]">Personal details</h2>
                                <button
                                    type="button"
                                    onClick={toggleEdit}
                                    className="flex items-center gap-2 rounded-lg border border-[#50c878] px-3 py-1.5 text-sm text-[#50c878] transition hover:bg-[#50c878] hover:text-[#1e1e1e]"
                                >
                                    <Edit2 className="h-4 w-4" /> {isEditing ? "Cancel" : "Edit"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <UserIcon className="h-4 w-4 text-[#50c878]" /> Full Name
                                    </label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <Mail className="h-4 w-4 text-[#50c878]" /> Email
                                    </label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <Phone className="h-4 w-4 text-[#50c878]" /> Mobile Number
                                    </label>
                                    <input type="tel" name="mobile_no" inputMode="numeric" maxLength={10} value={formData.mobile_no} onChange={(e) => setFormData((p) => ({ ...p, mobile_no: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className={inputClass} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <Phone className="h-4 w-4 text-[#50c878]" /> Alternate Mobile
                                    </label>
                                    <input type="tel" name="alternate_mobile" inputMode="numeric" maxLength={10} value={formData.alternate_mobile} onChange={(e) => setFormData((p) => ({ ...p, alternate_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className={inputClass} placeholder="Optional" disabled={!isEditing} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <MapPin className="h-4 w-4 text-[#50c878]" /> Address
                                    </label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Optional — street, city, state" disabled={!isEditing} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#cfcfcf]">
                                        <Users className="h-4 w-4 text-[#50c878]" /> Choose Avatar
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {AVATAR_OPTIONS.map((option) => (
                                            <button
                                                key={option.emoji}
                                                type="button"
                                                onClick={() => handleAvatarSelect(option.emoji)}
                                                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition border-2 ${
                                                    selectedAvatar === option.emoji
                                                        ? "border-[#50c878] bg-[#50c878]/20"
                                                        : "border-[#444444] hover:border-[#50c878]/50"
                                                }`}
                                            >
                                                <span
                                                    style={{ backgroundColor: option.color }}
                                                    className="p-1.5 rounded-full"
                                                >
                                                    {option.emoji}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Pick your avatar — no image URL needed.
                                    </p>
                                </div>
                            </div>

                            {isEditing && (
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#50c878] px-6 py-3 font-medium text-[#1e1e1e] transition hover:bg-[#3da861] disabled:opacity-60"
                                >
                                    <Save className="h-5 w-5" /> {saving ? "Saving…" : "Save Changes"}
                                </button>
                            )}
                        </form>

                        {/* Auto recharge */}
                        <div className="rounded-2xl border border-[#444444] bg-[#1e1e1e] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-[#ffffff]">Auto Recharge</h2>
                                    <p className="text-xs text-gray-400">Renew automatically from your wallet balance.</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.autoRechargeEnabled}
                                    onClick={toggleAutoRecharge}
                                    className={`relative h-7 w-14 rounded-full p-1 transition-colors ${formData.autoRechargeEnabled ? "bg-[#50c878]" : "bg-[#444444]"}`}
                                >
                                    <span
                                        className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${formData.autoRechargeEnabled ? "translate-x-7" : "translate-x-0"}`}
                                    />
                                </button>
                            </div>
                            <div className="mt-3">{renderAutoRechargeStatus()}</div>
                        </div>

                        {/* Wallet activity */}
                        <div className="rounded-2xl border border-[#444444] bg-[#1e1e1e] p-5">
                            <h2 className="mb-3 font-semibold text-[#ffffff]">Recent wallet activity</h2>
                            {walletActivity.length > 0 ? (
                                <ul className="divide-y divide-[#444444]">
                                    {walletActivity.map((txn) => (
                                        <li key={txn._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                            <div className="min-w-0">
                                                <p className="truncate text-[#cfcfcf]">Wallet top-up</p>
                                                <p className="text-xs text-gray-400">{formatDateTime(txn.transaction_date_time)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-[#50c878]">+₹{txn.amount_to_pay}</p>
                                                <p className={`text-xs ${txn.status === "Success" ? "text-green-400" : txn.status === "Failed" ? "text-red-400" : "text-yellow-400"}`}>{txn.status}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No wallet top-ups yet.</p>
                            )}
                        </div>

                        {/* Meta + actions */}
                        <div className="flex flex-col gap-3 border-t border-[#444444] pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-center gap-2 text-xs text-gray-400">
                                <CalendarDays className="h-4 w-4" />
                                Member since {formatDate(user.createdAt)}
                                {user.lastLogin ? ` · Last login ${formatDateTime(user.lastLogin)}` : ""}
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate("/change-password")}
                                className="flex items-center justify-center gap-2 rounded-lg border border-[#50c878] px-4 py-2 text-sm font-medium text-[#50c878] transition hover:bg-[#50c878] hover:text-[#1e1e1e]"
                            >
                                <Lock className="h-4 w-4" /> Change Password
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {showAddFundsModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-md rounded-2xl border border-[#444444] bg-[#1e1e1e] p-6 text-[#ffffff] shadow-xl"
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                        >
                            <h2 className="mb-4 text-xl font-bold text-[#50c878]">Add Money to Wallet</h2>
                            <label className="mb-2 block text-sm text-[#cfcfcf]">Amount (₹)</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-lg border border-[#444444] bg-[#333333] p-3 text-[#cfcfcf] focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {fundsError && <p className="mt-2 text-sm text-red-500">{fundsError}</p>}
                            <div className="mt-5 flex gap-3">
                                <button
                                    onClick={handleAddFunds}
                                    className="w-full rounded-lg bg-[#50c878] py-3 font-medium text-[#1e1e1e] transition hover:bg-[#3da861]"
                                >
                                    Continue to Payment
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddFundsModal(false);
                                        setFundsError("");
                                    }}
                                    className="w-full rounded-lg bg-[#444444] py-3 text-[#ffffff] transition hover:bg-[#555555]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Profile;
