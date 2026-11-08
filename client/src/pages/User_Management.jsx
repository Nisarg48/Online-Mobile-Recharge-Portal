import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "./PageLayout";
import AdminTabs from "../components/AdminTabs";
import { FaSearch, FaEye, FaTimes, FaTrash, FaUserEdit, FaToggleOn, FaToggleOff, FaWallet } from "react-icons/fa";
import API from "../Utils/api";
import { formatDateTime } from "../Utils/format";
import Swal from "sweetalert2";

function User_Management() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [searchParams] = useSearchParams();
    const didAutoOpen = useRef(false);
    const [filters, setFilters] = useState({ role: "", status: "", region: "" });
    const [walletTarget, setWalletTarget] = useState(null);
    const [walletAmount, setWalletAmount] = useState("");
    const [walletReason, setWalletReason] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await API.get("/users/getAllUsers");
                setUsers(response.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        fetchUsers();
    }, []);

    // Support deep links like /User_Management?userId=... that open a user's details.
    useEffect(() => {
        const userId = searchParams.get("userId");
        if (!userId || didAutoOpen.current || users.length === 0) return;

        const target = users.find((user) => user._id === userId);
        if (target) {
            didAutoOpen.current = true;
            setSelectedUser(target);
            fetchTransactions(target._id);
        }
    }, [searchParams, users]);

    const fetchTransactions = async (userId) => {
        setLoadingTransactions(true);
        try {
            const response = await API.get(`/transactions/getUserTransaction_List?userId=${userId}`);
            setTransactions(response.data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        fetchTransactions(user._id);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#50c878",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            });

            if (result.isConfirmed) {
                await API.delete(`/user/deleteUser/${userId}`);
                setUsers(users.filter((user) => user._id !== userId));
                Swal.fire("Deleted!", "User has been deleted.", "success");
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            Swal.fire("Error!", "Failed to delete user.", "error");
        }
    };

    const handleChangeRole = async (userId, role) => {
        try {
            const response = await API.put(`/user/changeUserRole/${userId}`, { role });
            setUsers(users.map((user) => (user._id === userId ? response.data : user)));
            Swal.fire("Success!", "User role updated successfully.", "success");
        } catch (err) {
            console.error("Error changing user role:", err);
            Swal.fire("Error!", "Failed to update user role.", "error");
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const response = await API.put(`/user/toggleUserStatus/${userId}`);
            setUsers(users.map((user) => (user._id === userId ? response.data : user)));
            Swal.fire("Success!", `User ${response.data.isActive ? "enabled" : "disabled"}.`, "success");
        } catch (err) {
            console.error("Error toggling user status:", err);
            Swal.fire("Error!", "Failed to toggle user status.", "error");
        }
    };

    const handleAdjustWallet = async (event) => {
        event.preventDefault();
        if (!walletTarget) return;
        const amount = Number(walletAmount);
        if (!amount) {
            Swal.fire("Invalid amount", "Enter a non-zero amount.", "warning");
            return;
        }
        setAdjusting(true);
        try {
            const { data } = await API.put(`/admin/users/${walletTarget._id}/wallet`, {
                amount,
                reason: walletReason.trim(),
            });
            setUsers((prev) =>
                prev.map((user) => (user._id === walletTarget._id ? { ...user, wallet: data.data.wallet } : user))
            );
            if (selectedUser?._id === walletTarget._id) {
                setSelectedUser((prev) => ({ ...prev, wallet: data.data.wallet }));
            }
            Swal.fire("Success!", `Wallet updated to ₹${data.data.wallet}.`, "success");
            setWalletTarget(null);
            setWalletAmount("");
            setWalletReason("");
        } catch (err) {
            Swal.fire("Error!", err.response?.data?.message || "Failed to adjust wallet.", "error");
        } finally {
            setAdjusting(false);
        }
    };

    const regions = [...new Set(users.map((user) => user.region).filter(Boolean))].sort();

    const filteredUsers = users.filter((user) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.mobile_no.includes(searchTerm);
        const matchesRole = !filters.role || user.role === filters.role;
        const matchesStatus =
            !filters.status || (filters.status === "active" ? user.isActive : !user.isActive);
        const matchesRegion = !filters.region || user.region === filters.region;
        return matchesSearch && matchesRole && matchesStatus && matchesRegion;
    });

    return (
        <PageLayout title="User Management">
            <AdminTabs />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone"
                        className="w-full p-2 pl-10 border border-[#50c878] rounded bg-[#1e1e1e] text-white focus:outline-none"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <FaSearch className="absolute left-3 top-3 text-[#50c878]" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                        className="rounded border border-[#444444] bg-[#1e1e1e] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="rounded border border-[#444444] bg-[#1e1e1e] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select
                        value={filters.region}
                        onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
                        className="rounded border border-[#444444] bg-[#1e1e1e] px-3 py-2 text-sm text-white"
                    >
                        <option value="">All regions</option>
                        {regions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="mb-2 text-xs text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
            </p>

            <div className="overflow-x-auto">
                <table className="w-full border border-[#50c878] text-white">
                    <thead>
                        <tr className="bg-[#50c878] text-black">
                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Email</th>
                            <th className="p-2 text-center">Phone</th>
                            <th className="p-2 text-center">Region</th>
                            <th className="p-2 text-center">Wallet</th>
                            <th className="p-2 text-center">Role</th>
                            <th className="p-2 text-center">Status</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b border-[#50c878] hover:bg-[#2a2a2a]">
                                <td className="p-2 text-center">{user.name}</td>
                                <td className="p-2 text-center">{user.email}</td>
                                <td className="p-2 text-center">{user.mobile_no}</td>
                                <td className="p-2 text-center text-gray-300">
                                    {user.city ? `${user.city}, ${user.region}` : user.region || "—"}
                                </td>
                                <td className="p-2 text-center">₹{user.wallet ?? 0}</td>
                                <td className="p-2 text-center">{user.role}</td>
                                <td className="p-2 text-center">
                                    <button
                                        className={`flex items-center justify-center gap-1 ${
                                            user.isActive ? "text-green-400" : "text-red-400"
                                        }`}
                                        onClick={() => handleToggleStatus(user._id)}
                                    >
                                        {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                        {user.isActive ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="p-2 text-center flex flex-wrap justify-center gap-2">
                                    <button
                                        className="text-blue-400 hover:underline flex items-center gap-1"
                                        onClick={() => {
                                            setWalletTarget(user);
                                            setWalletAmount("");
                                            setWalletReason("");
                                        }}
                                    >
                                        <FaWallet /> Wallet
                                    </button>
                                    <button
                                        className="text-[#50c878] hover:underline flex items-center gap-1"
                                        onClick={() => handleViewUser(user)}
                                    >
                                        <FaEye /> View
                                    </button>
                                    <button
                                        className="text-yellow-400 hover:underline flex items-center gap-1"
                                        onClick={() =>
                                            handleChangeRole(user._id, user.role === "user" ? "admin" : "user")
                                        }
                                    >
                                        <FaUserEdit /> {user.role === "user" ? "Make Admin" : "Make User"}
                                    </button>
                                    <button
                                        className="text-red-400 hover:underline flex items-center gap-1"
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Improved Popup (Modal) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-[#1e1e1e] text-white p-6 rounded-lg shadow-lg w-[90%] max-w-4xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-semibold">User Details</h3>
                            <button onClick={() => setSelectedUser(null)}>
                                <FaTimes className="text-red-500 text-2xl" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Phone:</strong> {selectedUser.mobile_no}</p>
                            <p><strong>Address:</strong> {selectedUser.address || "N/A"}</p>
                            <p><strong>Region:</strong> {selectedUser.city ? `${selectedUser.city}, ${selectedUser.region}` : selectedUser.region || "N/A"}</p>
                            <p><strong>Wallet:</strong> ₹{selectedUser.wallet ?? 0}</p>
                            <p><strong>Role:</strong> {selectedUser.role}</p>
                            <p><strong>Status:</strong> 
                                <span className={`${selectedUser.isActive ? "text-green-400" : "text-red-400"}`}>
                                    {selectedUser.isActive ? " Active" : " Inactive"}
                                </span>
                            </p>
                        </div>

                        <h3 className="text-xl mt-6 font-semibold">Transaction History</h3>
                        {loadingTransactions ? (
                            <p className="text-yellow-400 mt-2">Loading transactions...</p>
                        ) : transactions.length > 0 ? (
                            <div className="mt-2 max-h-60 overflow-auto border border-[#50c878] rounded p-2">
                                <table className="w-full border border-[#50c878]">
                                    <thead className="bg-[#50c878] text-black">
                                        <tr>
                                            <th className="p-2">Date & Time</th>
                                            <th className="p-2">Plan</th>
                                            <th className="p-2">Price</th>
                                            <th className="p-2">Validity</th>
                                            <th className="p-2">Data</th>
                                            <th className="p-2">Calls</th>
                                            <th className="p-2">Payment</th>
                                            <th className="p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((txn, index) => (
                                            <tr key={index} className="border-b border-[#50c878]">
                                                <td className="p-2">{formatDateTime(txn.transaction_date_time)}</td>
                                                <td className="p-2">{txn.plan ? `${txn.plan.platform} - ${txn.plan.category}` : "Wallet"}</td>
                                                <td className="p-2">₹{txn.amount_to_pay}</td>
                                                <td className="p-2">{txn.plan ? `${txn.plan.validity} Days` : "-"}</td>
                                                <td className="p-2">{txn.plan?.data?.dailyLimit ? `${txn.plan.data.dailyLimit}GB/day` : "-"}</td>
                                                <td className="p-2">{txn.plan?.calls || "-"}</td>
                                                <td className="p-2">{txn.payment_method}</td>
                                                <td className={`p-2 ${txn.status === "Success" ? "text-green-400" : txn.status === "Failed" ? "text-red-400" : "text-yellow-400"}`}>{txn.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="mt-2">No transactions found.</p>
                        )}
                    </motion.div>
                </div>
            )}

            {walletTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <form
                        onSubmit={handleAdjustWallet}
                        className="bg-[#1e1e1e] text-white p-6 rounded-lg shadow-lg w-full max-w-md"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">Adjust wallet</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    {walletTarget.name} · current balance ₹{walletTarget.wallet ?? 0}
                                </p>
                            </div>
                            <button type="button" onClick={() => setWalletTarget(null)} aria-label="Close">
                                <FaTimes className="text-red-500 text-xl" />
                            </button>
                        </div>
                        <label className="mb-1 block text-xs text-gray-400">Amount (negative to deduct)</label>
                        <input
                            type="number"
                            step="1"
                            value={walletAmount}
                            onChange={(e) => setWalletAmount(e.target.value)}
                            placeholder="e.g. 100 or -50"
                            className="w-full rounded border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                        />
                        <label className="mb-1 mt-3 block text-xs text-gray-400">Reason</label>
                        <textarea
                            rows={3}
                            maxLength={200}
                            value={walletReason}
                            onChange={(e) => setWalletReason(e.target.value)}
                            placeholder="Why is this adjustment being made?"
                            className="w-full rounded border border-[#444444] bg-[#141414] px-3 py-2 text-sm text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500">Balance after: ₹{(walletTarget.wallet ?? 0) + (Number(walletAmount) || 0)}</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setWalletTarget(null)}
                                className="rounded border border-[#444444] px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={adjusting}
                                className="rounded bg-[#50c878] px-4 py-2 text-sm font-medium text-[#1e1e1e] hover:bg-[#3da861] disabled:opacity-60"
                            >
                                {adjusting ? "Saving..." : "Apply"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </PageLayout>
    );
}

export default User_Management;