import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaNetworkWired, FaExchangeAlt, FaQuestionCircle, FaSignOutAlt,
    FaSignInAlt, FaUserCircle,     FaChevronDown, FaChevronUp,     FaUsers,
    FaBars, FaTimes, FaChartPie, FaTag, FaComment,     FaCog
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../Utils/api';
import { logout } from '../Utils/auth';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const [unrepliedCount, setUnrepliedCount] = useState(0);
    const [role, setRole] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const profileButtonRef = useRef(null);
    const adminButtonRef = useRef(null);
    const mobileNavRef = useRef(null);

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

    // Fetch unreplied queries count (admin only)
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
        if (role !== 'admin') return undefined;
        fetchUnrepliedQueries();
        const interval = setInterval(fetchUnrepliedQueries, 30000);
        return () => clearInterval(interval);
    }, [role]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const insideMobileNav = mobileNavRef.current && mobileNavRef.current.contains(event.target);
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            if (adminButtonRef.current && !adminButtonRef.current.contains(event.target) && !insideMobileNav) {
                setShowAdminDropdown(false);
            }
            if (mobileNavRef.current && !insideMobileNav) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Logout function (also invalidates the server-side refresh token)
    const Logout = () => {
        logout();
        navigate('/NetworkProvider', { replace: true });
    };

    const isAdmin = accessToken && role === 'admin';

    return (
        <div className="bg-[#1e1e1e] fixed top-0 left-0 w-full shadow-lg z-50">
            <div className="container mx-auto px-4">
                {/* Desktop Navbar */}
                <div className="hidden md:flex justify-between items-center py-3">
                    {/* Logo - Left Side */}
                    <div className="flex-shrink-0">
                        <Link to="/NetworkProvider" className="flex items-center">
                            <img src="/Logo.png" alt="Logo" className="w-10 h-10 border-2 border-[#50c878] rounded-full" />
                            <span className="ml-2 text-[#50c878] font-bold text-lg">RechargeHub</span>
                        </Link>
                    </div>

                    {/* Core Navigation Links - Center */}
                    <div className="flex items-center space-x-6 mx-4 flex-1 justify-center">
                        <Link
                            to="/NetworkProvider"
                            className="text-white hover:text-[#50c878] transition py-2 px-1 flex items-center gap-1.5 text-sm font-medium"
                        >
                            <FaNetworkWired size={16} /> Network Provider
                        </Link>
                        <Link
                            to="/Transaction"
                            className={`text-white hover:text-[#50c878] transition py-2 px-1 flex items-center gap-1.5 text-sm font-medium ${accessToken ? "" : "hidden"}`}
                        >
                            <FaExchangeAlt size={16} /> Transactions
                        </Link>
                        <Link
                            to="/help"
                            className="text-white hover:text-[#50c878] transition py-2 px-1 flex items-center gap-1.5 text-sm font-medium"
                        >
                            <FaQuestionCircle size={16} /> Help
                        </Link>
                    </div>

                    {/* Right Side: Admin dropdown, Profile, Theme */}
                    <div className="flex items-center gap-3" ref={dropdownRef}>
                        {/* Admin dropdown */}
                        {isAdmin && (
                            <div className="relative" ref={adminButtonRef}>
                                <button
                                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#333333] hover:bg-[#50c878]/20 border border-[#50c878]/30 text-[#cfcfcf] hover:text-white transition"
                                >
                                    <FaCog size={16} />
                                    <span className="hidden sm:inline">Admin</span>
                                    <FaChevronDown size={14} />
                                </button>
                                <AnimatePresence>
                                    {showAdminDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] rounded-lg shadow-xl border border-[#333333] z-50 transform -translate-x-1/2"
                                        >
                                            <div className="py-1">
                                                <Link
                                                    to="/admin/dashboard"
                                                    onClick={() => setShowAdminDropdown(false)}
                                                    className={`block px-4 py-2 text-sm ${unrepliedCount > 0 ? "text-[#50c878]" : "text-gray-300"} hover:bg-[#2a2a2a] hover:text-white transition`}
                                                >
                                                    <FaChartPie size={14} className="mr-2" /> Dashboard
                                                    {unrepliedCount > 0 && (
                                                        <span className="ml-auto bg-[#50c878] text-[#1e1e1e] text-[10px] rounded-full px-2 py-0.5">{unrepliedCount}</span>
                                                    )}
                                                </Link>
                                                <Link
                                                    to="/admin/coupons"
                                                    onClick={() => setShowAdminDropdown(false)}
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition"
                                                >
                                                    <FaTag size={14} className="mr-2" /> Coupons
                                                </Link>
                                                <Link
                                                    to="/admin/feedback"
                                                    onClick={() => setShowAdminDropdown(false)}
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition"
                                                >
                                                    <FaComment size={14} className="mr-2" /> Feedback
                                                </Link>
                                                <div className="border-t border-[#333333] my-1"></div>
                                                <Link
                                                    to="/User_Management"
                                                    onClick={() => setShowAdminDropdown(false)}
                                                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition"
                                                >
                                                    <FaUsers size={14} className="mr-2" /> User Management
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Profile/Login */}
                        {accessToken ? (
                            <div className="relative">
                                <button
                                    ref={profileButtonRef}
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#333333] hover:bg-[#50c878]/20 border border-[#50c878]/30 text-[#cfcfcf] hover:text-white transition"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    <FaUserCircle size={16} />
                                    <span className="hidden sm:inline">Profile</span>
                                    <FaChevronDown size={14} />
                                </button>

                                <AnimatePresence>
                                    {showProfileDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-[#1e1e1e] rounded-lg shadow-xl border border-[#333333] z-50"
                                        >
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        navigate('/Profile');
                                                        setShowProfileDropdown(false);
                                                    }}
                                                    className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition text-left"
                                                >
                                                    <CgProfile className="mr-2" /> View Profile
                                                </button>
                                                <button
                                                    onClick={Logout}
                                                    className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition text-left"
                                                >
                                                    <FaSignOutAlt className="mr-2" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to='/login'
                                className="px-4 py-2 rounded bg-[#333333] hover:bg-[#50c878]/20 border border-[#50c878]/30 text-[#cfcfcf] hover:text-white transition text-sm font-medium"
                            >
                                <FaSignInAlt size={16} className="mr-2" /> Login
                            </Link>
                        )}
                        <ThemeToggle />
                    </div>
                </div>

                {/* Mobile Navbar */}
                <div className="md:hidden" ref={mobileNavRef}>
                    <div className="flex justify-between items-center py-3">
                    <Link to="/NetworkProvider" className="flex items-center">
                        <img src="/Logo.png" alt="Logo" className="w-10 h-10 border-2 border-[#50c878] rounded-full" />
                        <span className="ml-2 text-[#50c878] font-bold text-lg">RechargeHub</span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <button
                            className="text-white p-2 rounded hover:bg-[#333333]"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                    </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="md:hidden bg-[#1e1e1e] border-t border-[#333333]"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="px-4 py-4 space-y-3">
                                <Link
                                    to="/NetworkProvider"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition flex items-center gap-3"
                                >
                                    <FaNetworkWired size={18} /> Network Provider
                                </Link>
                                {accessToken ? (
                                    <>
                                        <Link
                                            to="/Transaction"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition flex items-center gap-3"
                                        >
                                            <FaExchangeAlt size={18} /> Transactions
                                        </Link>
                                        <Link
                                            to="/help"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition flex items-center gap-3"
                                        >
                                            <FaQuestionCircle size={18} /> Help
                                        </Link>
                                        {isAdmin && (
                                            <div className="px-2 space-y-1">
                                                <button
                                                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <FaCog size={16} /> Admin
                                                    </span>
                                                    {showAdminDropdown ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                                                </button>
                                                {showAdminDropdown && (
                                                    <div className="ml-2 space-y-1 border-t border-[#333333] pt-3">
                                                        <button
                                                            onClick={() => {
                                                                navigate('/admin/dashboard');
                                                                setShowAdminDropdown(false);
                                                                setMobileMenuOpen(false);
                                                            }}
                                                            className="block w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-[#50c878] transition flex items-center gap-3"
                                                        >
                                                            <FaChartPie size={14} className="mr-2" /> Dashboard
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate('/admin/coupons');
                                                                setShowAdminDropdown(false);
                                                                setMobileMenuOpen(false);
                                                            }}
                                                            className="block w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-[#50c878] transition flex items-center gap-3"
                                                        >
                                                            <FaTag size={14} className="mr-2" /> Coupons
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate('/admin/feedback');
                                                                setShowAdminDropdown(false);
                                                                setMobileMenuOpen(false);
                                                            }}
                                                            className="block w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-[#50c878] transition flex items-center gap-3"
                                                        >
                                                            <FaComment size={14} className="mr-2" /> Feedback
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate('/User_Management');
                                                                setShowAdminDropdown(false);
                                                                setMobileMenuOpen(false);
                                                            }}
                                                            className="block w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a2a] hover:text-[#50c878] transition flex items-center gap-3"
                                                        >
                                                            <FaUsers size={14} className="mr-2" /> User Management
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                navigate('/Profile');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block w-full px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition flex items-center gap-3"
                                        >
                                            <FaUserCircle size={18} /> Profile
                                        </button>
                                        <button
                                            onClick={Logout}
                                            className="block w-full px-3 py-2 rounded hover:bg-[#2a2a2a] text-white hover:text-[#50c878] transition flex items-center gap-3"
                                        >
                                            <FaSignOutAlt size={18} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 rounded bg-[#50c878] text-[#1e1e1e] text-center font-medium hover:bg-[#3da861] transition"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                </motion.div>
            )}
                </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
