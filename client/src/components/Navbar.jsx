import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaNetworkWired, FaExchangeAlt, FaQuestionCircle, FaSignOutAlt,
    FaSignInAlt, FaUserCircle, FaChevronDown, FaEnvelope, FaUsers,
    FaBars, FaTimes
} from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../Utils/API';

function Navbar() {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [unrepliedCount, setUnrepliedCount] = useState(0);
    const [role, setRole] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const profileButtonRef = useRef(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Logout function
    const Logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        navigate('/NetworkProvider', { replace: true });
    };

    // Navigation links data
    const navLinks = [
        { to: "/NetworkProvider", icon: <FaNetworkWired size={20} />, text: "Network Provider", show: true },
        { to: "/Transaction", icon: <FaExchangeAlt size={20} />, text: "Transactions", show: accessToken },
        { to: "/User_Management", icon: <FaUsers size={20} />, text: "User Management", show: accessToken && role === 'admin' },
        { to: "/help", icon: <FaQuestionCircle size={20} />, text: "Help", show: true },
        { 
            to: "/query", 
            icon: <FaEnvelope size={20} />, 
            text: "Query", 
            show: accessToken && role === 'admin',
            badge: unrepliedCount > 0 ? unrepliedCount : null
        }
    ];

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

                    {/* Navigation Links - Center */}
                    <div className="flex space-x-4 lg:space-x-6 mx-4 flex-1 justify-center">
                        {navLinks.map((link, index) => (
                            link.show && (
                                <Link 
                                    key={index}
                                    to={link.to} 
                                    className="text-white hover:text-[#50c878] transition py-2 px-1 flex items-center text-sm lg:text-base"
                                >
                                    {link.icon}
                                    <span className="ml-2">{link.text}</span>
                                    {link.badge && (
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Profile/Login - Right Side */}
                    <div className="flex-shrink-0 relative" ref={dropdownRef}>
                        {accessToken ? (
                            <>
                                <button 
                                    ref={profileButtonRef}
                                    className="text-white hover:text-[#50c878] transition py-2 px-1 flex items-center text-sm lg:text-base"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    <FaUserCircle size={20} />
                                    <span className="ml-2">Profile</span>
                                    <FaChevronDown size={15} className="ml-2" />
                                </button>

                                <AnimatePresence>
                                    {showProfileDropdown && (
                                        <motion.div 
                                            className="absolute top-12 right-0 bg-[#1e1e1e] rounded-lg shadow-lg w-48 border border-[#333333] z-50"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <button 
                                                className="w-full px-4 py-2 text-white hover:bg-[#333333] transition text-left flex items-center"
                                                onClick={() => {
                                                    navigate('/Profile');
                                                    setShowProfileDropdown(false);
                                                }}
                                            >
                                                <CgProfile className="mr-2" /> View Profile
                                            </button>
                                            <button 
                                                className="w-full px-4 py-2 text-white hover:bg-[#333333] transition text-left flex items-center"
                                                onClick={Logout}
                                            >
                                                <FaSignOutAlt className="mr-2" /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <Link 
                                to='/login' 
                                className="text-white hover:text-[#50c878] transition py-2 px-1 flex items-center text-sm lg:text-base"
                            >
                                <FaSignInAlt size={20} /> 
                                <span className="ml-2">Login</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Navbar */}
                <div className="md:hidden flex justify-between items-center py-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src="/Logo.png" alt="Logo" className="w-10 h-10 border-2 border-[#50c878] rounded-full" />
                        <span className="ml-2 text-[#50c878] font-bold text-lg">RechargeHub</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button 
                        className="text-white p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
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
                            <div className="px-4 py-2 space-y-2">
                                {navLinks.map((link, index) => (
                                    link.show && (
                                        <Link 
                                            key={index}
                                            to={link.to} 
                                            className="block text-white hover:text-[#50c878] transition py-3 px-2 flex items-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.icon}
                                            <span className="ml-3">{link.text}</span>
                                            {link.badge && (
                                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </Link>
                                    )
                                ))}

                                {accessToken ? (
                                    <>
                                        <button 
                                            className="w-full text-white hover:text-[#50c878] transition py-3 px-2 flex items-center"
                                            onClick={() => {
                                                navigate('/Profile');
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <FaUserCircle className="mr-3" /> View Profile
                                        </button>
                                        <button 
                                            className="w-full text-white hover:text-[#50c878] transition py-3 px-2 flex items-center"
                                            onClick={() => {
                                                Logout();
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <FaSignOutAlt className="mr-3" /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link 
                                        to='/login' 
                                        className="text-white hover:text-[#50c878] transition py-3 px-2 flex items-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FaSignInAlt className="mr-3" /> Login
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Navbar;