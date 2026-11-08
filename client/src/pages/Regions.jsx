/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import PageLayout from "./PageLayout";
import { FaMap, FaUsers, FaExchangeAlt, FaMoneyBillWave, FaGlobeAsia } from "react-icons/fa";
import API from "../Utils/api";
import { toast } from "../Utils/toast";
import {
    Treemap,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#50c878", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444",
    "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

const TreemapCell = (props) => {
    const { x, y, width, height, index, payload } = props;
    const region = payload?.region || "";
    const users = payload?.users || 0;
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[index % COLORS.length],
                    stroke: "#1e1e1e",
                    strokeWidth: 2,
                }}
            />
            {width > 64 && height > 34 && (
                <>
                    <text x={x + 6} y={y + 18} fill="#0b0b0b" fontSize={11} fontWeight={700}>
                        {region}
                    </text>
                    <text x={x + 6} y={y + 33} fill="#0b0b0b" fontSize={10} opacity={0.8}>
                        {users} users
                    </text>
                </>
            )}
        </g>
    );
};

const Regions = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await API.get("/admin/regions");
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching regions:", err);
                toast.error("Failed to load regional analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchRegions();
    }, []);

    if (loading) {
        return (
            <PageLayout title="Regional Analytics">
                <div className="flex h-64 items-center justify-center text-gray-400">
                    Loading regional analytics...
                </div>
            </PageLayout>
        );
    }

    if (!data) {
        return (
            <PageLayout title="Regional Analytics">
                <div className="flex h-64 items-center justify-center text-gray-400">
                    Failed to load regional analytics.
                </div>
            </PageLayout>
        );
    }

    const knownRegions = (data.byRegion || []).filter((region) => region.region !== "Unknown");
    const chartRegions = knownRegions.slice(0, 10);
    const totalUsers = data.totals.users || 0;
    const totalRevenue = data.totals.revenue || 0;

    return (
        <PageLayout title="Regional Analytics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase text-gray-400">Regions</p>
                            <p className="text-2xl font-bold text-white">{data.totals.regions}</p>
                        </div>
                        <FaMap className="text-xl text-[#50c878]" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {data.totals.unassignedUsers} users without a region
                    </p>
                </div>
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase text-gray-400">Users</p>
                            <p className="text-2xl font-bold text-white">{totalUsers}</p>
                        </div>
                        <FaUsers className="text-xl text-[#50c878]" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Across {knownRegions.length} active regions
                    </p>
                </div>
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase text-gray-400">Recharges</p>
                            <p className="text-2xl font-bold text-white">{data.totals.recharges}</p>
                        </div>
                        <FaExchangeAlt className="text-xl text-[#50c878]" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Completed recharges</p>
                </div>
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase text-gray-400">Revenue</p>
                            <p className="text-2xl font-bold text-white">₹{totalRevenue}</p>
                        </div>
                        <FaMoneyBillWave className="text-xl text-[#50c878]" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">From completed recharges</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4 lg:col-span-3">
                    <div className="mb-4 flex items-center gap-2">
                        <FaGlobeAsia className="text-[#50c878]" />
                        <h3 className="text-base font-semibold text-white">User Distribution</h3>
                    </div>
                    {knownRegions.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={knownRegions}
                                    dataKey="users"
                                    nameKey="region"
                                    aspectRatio={4 / 3}
                                    content={<TreemapCell />}
                                >
                                    <Tooltip
                                        formatter={(value, name, entry) => [
                                            `${entry?.payload?.users || value} users`,
                                            entry?.payload?.region || name,
                                        ]}
                                    />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-80 items-center justify-center text-gray-500">
                            No regional data yet. Add regions to user profiles.
                        </div>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                        Each tile is a state/UT; larger tiles have more users.
                    </p>
                </div>

                <div className="rounded-xl border border-[#444444] bg-[#1e1e1e] p-4 lg:col-span-2">
                    <h3 className="mb-4 text-base font-semibold text-white">Revenue by Region</h3>
                    {chartRegions.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartRegions} layout="vertical" margin={{ left: 8 }}>
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="region"
                                        width={92}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                                    <Bar dataKey="revenue" fill="#50c878" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-80 items-center justify-center text-gray-500">
                            No revenue data yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#444444] bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-base font-semibold text-white">Region Breakdown</h3>
                    <span className="text-xs text-gray-500">{knownRegions.length} regions</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="border-b border-[#444444] text-left text-gray-400">
                                <th className="px-4 pb-2">State / UT</th>
                                <th className="px-4 pb-2 text-right">Users</th>
                                <th className="px-4 pb-2 text-right">Recharges</th>
                                <th className="px-4 pb-2 text-right">Revenue (₹)</th>
                                <th className="px-4 pb-2 text-right">Avg Ticket (₹)</th>
                                <th className="px-4 pb-2 text-right">User Share</th>
                                <th className="px-4 pb-2 text-right">Revenue Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {knownRegions.length > 0 ? (
                                knownRegions.map((region) => (
                                    <tr
                                        key={region.region}
                                        className="border-b border-[#444444] hover:bg-[#2a2a2a]/50"
                                    >
                                        <td className="px-4 py-2 font-medium">{region.region}</td>
                                        <td className="px-4 py-2 text-right">{region.users}</td>
                                        <td className="px-4 py-2 text-right text-[#50c878]">
                                            {region.recharges}
                                        </td>
                                        <td className="px-4 py-2 text-right">₹{region.revenue}</td>
                                        <td className="px-4 py-2 text-right">₹{region.avgTicket}</td>
                                        <td className="px-4 py-2 text-right text-gray-400">
                                            {totalUsers
                                                ? ((region.users / totalUsers) * 100).toFixed(1)
                                                : 0}
                                            %
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-400">
                                            {totalRevenue
                                                ? ((region.revenue / totalRevenue) * 100).toFixed(1)
                                                : 0}
                                            %
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No regional data yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
};

export default Regions;
