import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "./PageLayout";
import { FaSearch, FaEye, FaTimes, FaTrash, FaUserEdit, FaToggleOn, FaToggleOff } from "react-icons/fa";
import API from "../Utils/API";
import Swal from "sweetalert2";

function User_Management() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

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

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile_no.includes(searchTerm)
    );

    return (
        <PageLayout title="User Management">
            <div className="flex justify-between items-center mb-4">
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
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-[#50c878] text-white">
                    <thead>
                        <tr className="bg-[#50c878] text-black">
                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Email</th>
                            <th className="p-2 text-center">Phone</th>
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
                                <td className="p-2 text-center flex justify-center gap-2">
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
                                                <td className="p-2">{txn.transaction_date_time}</td>
                                                <td className="p-2">{txn.plan.platform} - {txn.plan.category}</td>
                                                <td className="p-2">₹{txn.plan.price} + ₹{txn.platformCharge}</td>
                                                <td className="p-2">{txn.plan.validity} Days</td>
                                                <td className="p-2">{txn.plan.data.dailyLimit}GB/day</td>
                                                <td className="p-2">{txn.plan.calls}</td>
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
        </PageLayout>
    );
}

export default User_Management;