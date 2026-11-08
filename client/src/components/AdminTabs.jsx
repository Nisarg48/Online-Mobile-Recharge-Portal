import { NavLink } from "react-router-dom";
import {
    FaChartPie, FaMap, FaExchangeAlt, FaTag, FaComment, FaUsers, FaHistory,
} from "react-icons/fa";

const TABS = [
    { to: "/admin/dashboard", label: "Dashboard", icon: FaChartPie },
    { to: "/admin/regions", label: "Regions", icon: FaMap },
    { to: "/admin/transactions", label: "Transactions", icon: FaExchangeAlt },
    { to: "/admin/coupons", label: "Coupons", icon: FaTag },
    { to: "/admin/feedback", label: "Feedback", icon: FaComment },
    { to: "/User_Management", label: "Users", icon: FaUsers },
    { to: "/admin/audit", label: "Audit", icon: FaHistory },
];

const AdminTabs = () => (
    <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        isActive
                            ? "border-[#50c878] bg-[#50c878]/10 text-[#50c878]"
                            : "border-[#444444] text-gray-300 hover:bg-[#2a2a2a]"
                    }`
                }
            >
                <Icon size={14} /> {label}
            </NavLink>
        ))}
    </div>
);

export default AdminTabs;
