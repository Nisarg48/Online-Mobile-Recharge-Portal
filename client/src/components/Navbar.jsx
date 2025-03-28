import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaNetworkWired, FaExchangeAlt, FaQuestionCircle, FaSignOutAlt,
    FaSignInAlt, FaUserCircle, FaChevronDown, FaEnvelope, FaUsers
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../Utils/API';

function Navbar() {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [unrepliedCount, setUnrepliedCount] = useState(0);
    const [role, setRole] = useState(null);

    const accessToken = localStorage.getItem('accessToken');

    // Decode JWT token to get user role
    useEffect(() => {
        const decodeToken = () => {
            if (accessToken) {
                try {
                    const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
                    setRole(decodedToken.role);
                } catch (error) {
                    console.error('Error decoding token:', error);
                }
            }
        };
        decodeToken();
    }, [accessToken]);

    // Fetch unreplied queries count
    const fetchUnrepliedQueries = async () => {
        try {
            const response = await API.get('/query/getAllQueries');
            const queries = response.data;

            const unreplied = queries.filter(query => query.status === "Pending").length;
            setUnrepliedCount(unreplied);
        } catch (error) {
            console.error("Error fetching queries:", error);
        }
    };

    useEffect(() => {
        fetchUnrepliedQueries();
        const interval = setInterval(fetchUnrepliedQueries, 10000);
        return () => clearInterval(interval);
    }, []);

    // Logout function
    const Logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        navigate('/NetworkProvider', { replace: true });
    };

    return (
        <div className="bg-[#1e1e1e] fixed top-0 left-0 w-full shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/Logo.png" alt="Logo" className="w-12 h-12 border-2 border-[#50c878] rounded-full" />
                    <span className="ml-2 text-[#50c878] font-bold text-lg">RechargeHub</span>
                </div>

                {/* Navigation Links */}
                <div className="flex space-x-6">
                    {/* Network Provider Link */}
                    <Link to="/NetworkProvider" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                        <FaNetworkWired size={20} />
                        <span className="ml-2">Network Provider</span>
                    </Link>

                    {/* Transactions Link (Visible only if logged in) */}
                    {accessToken && (
                        <Link to="/Transaction" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                            <FaExchangeAlt size={20} />
                            <span className="ml-2">Transactions</span>
                        </Link>
                    )}

                    {/* User Management Link (Visible only to Admin) */}
                    {accessToken && role === 'admin' && (
                        <Link to="/User_Management" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                            <FaUsers size={20} />
                            <span className="ml-2">User Management</span>
                        </Link>
                    )}

                    {/* Help Link */}
                    <Link to="/help" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                        <FaQuestionCircle size={20} />
                        <span className="ml-2">Help</span>
                    </Link>

                    {/* Query Inbox Link (Visible only to Admin) */}
                    {accessToken && role === 'admin' && (
                        <Link to="/query" className="text-white hover:text-[#50c878] transition p-2 flex items-center">
                            <FaEnvelope size={20} />
                            <span className="ml-2">Query</span>
                            {unrepliedCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                    {unrepliedCount}
                                </span>
                            )}
                        </Link>
                    )}
                </div>

                {/* Profile / Login Buttons */}
                <div className="flex space-x-6 relative">
                    {accessToken ? (
                        <>
                            {/* Profile Dropdown Toggle */}
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
                                        {/* View Profile Button */}
                                        <button className="w-full px-4 py-2 text-white hover:bg-[#333333] transition"
                                            onClick={() => navigate('/Profile')}>
                                            <CgProfile className="inline mr-2" /> View Profile
                                        </button>

                                        {/* Logout Button */}
                                        <button className="w-full px-4 py-2 text-white hover:bg-[#333333] transition"
                                            onClick={Logout}>
                                            <FaSignOutAlt className="inline mr-2" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        // Login Button (Visible if not logged in)
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