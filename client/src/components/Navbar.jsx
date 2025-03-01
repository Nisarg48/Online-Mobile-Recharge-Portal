import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaNetworkWired, FaExchangeAlt, FaQuestionCircle, FaSignOutAlt,
    FaSignInAlt, FaUserCircle, FaChevronDown, FaEnvelope
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showQueryInbox, setShowQueryInbox] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const accessToken = localStorage.getItem('accessToken');

    // Fetch feedback messages
    const fetchFeedbacks = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/feedback");
            const data = await res.json();
            setFeedbacks(data);
            setUnreadCount(data.filter(f => !f.read).length); // Count only unread messages
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
        const interval = setInterval(fetchFeedbacks, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Mark feedback as read
    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/feedbacks/markAsRead/${id}`, { method: "PUT" });

            setFeedbacks(prevFeedbacks =>
                prevFeedbacks.map(f => (f._id === id ? { ...f, read: true } : f))
            );

            setUnreadCount(prev => Math.max(0, prev - 1)); // Prevent negative count
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // Submit feedback
    const submitFeedback = async (message) => {
        const user = localStorage.getItem('username'); // Get the logged-in user's name

        try {
            const response = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ message, user }) // Include the user's name
            });

            if (response.ok) {
                alert('Feedback submitted successfully!');
            } else {
                alert('Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const Logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/NetworkProvider', { replace: true });
    };

    return (
        <div className="bg-[#1e1e1e] fixed top-0 left-0 w-full shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/Logo.png" alt="Logo" className="w-8 h-8" />
                    <span className="ml-2 text-[#50c878] font-bold text-lg">M.R. Pay</span>
                </div>

                {/* Navigation Links */}
                <div className="flex space-x-6">
                    <Link to="/NetworkProvider" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                        <FaNetworkWired size={20} />
                        <span className="ml-2">Network Provider</span>
                    </Link>
                    {accessToken && (
                        <Link to="/transaction" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                            <FaExchangeAlt size={20} />
                            <span className="ml-2">Transactions</span>
                        </Link>
                    )}
                    <Link to="/help" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                        <FaQuestionCircle size={20} />
                        <span className="ml-2">Help</span>
                    </Link>

                    {/* Query Inbox */}
                    <div className="relative">
                        <button className="text-white hover:text-[#50c878] transition p-2 flex items-center"
                            onClick={() => setShowQueryInbox(!showQueryInbox)}>
                            <FaEnvelope size={20} />
                            <span className="ml-2">Query</span>
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Messages */}
                        <AnimatePresence>
                            {showQueryInbox && (
                                <motion.div
                                    className="absolute top-12 right-0 bg-[#1e1e1e] rounded-lg shadow-lg w-96 border border-[#333333]"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="p-4 border-b border-[#333333]">
                                        <h3 className="text-lg font-semibold text-white">Feedback Inbox</h3>
                                        <p className="text-sm text-gray-400">{unreadCount} unread messages</p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {feedbacks.length > 0 ? (
                                            feedbacks.map(feedback => (
                                                <div
                                                    key={feedback._id}
                                                    onClick={() => !feedback.read && markAsRead(feedback._id)}
                                                    className={`p-2 border-b cursor-pointer ${feedback.read ? "bg-gray-100 text-gray-800" : "bg-yellow-200 text-black font-bold"}`}
                                                >
                                                    <p className="text-sm">{feedback.message}</p>
                                                    <p className="text-xs text-gray-600">
                                                        Submitted by: <span className="font-semibold">{feedback.user || "Unknown User"}</span> • {new Date(feedback.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="p-4 text-sm text-gray-400">No feedback available.</p>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-[#333333]">
                                        <button className="w-full bg-[#50c878] text-black py-2 px-4 rounded hover:bg-[#40a060] transition"
                                            onClick={() => setShowQueryInbox(false)}>
                                            Close Inbox
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Profile / Login Buttons */}
                <div className="flex space-x-6 relative">
                    {accessToken ? (
                        <>
                            <button className="text-white hover:text-[#50c878] transition p-2 flex items-center"
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                                <FaUserCircle size={20} />
                                <span className="ml-2">Profile</span>
                                <FaChevronDown size={15} className="ml-2" />
                            </button>

                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {showProfileDropdown && (
                                    <motion.div className="absolute top-12 right-0 bg-[#1e1e1e] rounded-lg shadow-lg w-48 border border-[#333333]"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <button className="w-full px-4 py-2 text-white hover:bg-[#333333] transition"
                                            onClick={() => navigate('/Profile')}>
                                            <CgProfile className="inline mr-2" /> View Profile
                                        </button>
                                        <button className="w-full px-4 py-2 text-white hover:bg-[#333333] transition"
                                            onClick={Logout}>
                                            <FaSignOutAlt className="inline mr-2" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <Link to='/login' className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                            <FaSignInAlt size={20} /> <span className="ml-2">Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;