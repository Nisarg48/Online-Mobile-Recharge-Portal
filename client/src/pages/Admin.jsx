import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import API from "../Utils/API"; // Assuming you have the same API utility as in your Profile component

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // State to store all users
  const [showUsers, setShowUsers] = useState(false); // State to toggle user list visibility

  // Default profile picture URL
  const defaultProfilePic = "https://www.gravatar.com/avatar/default?s=200&d=mp"; // Simple default avatar

  // Fetch the total user count from the database
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/admin/getUserCount");
        setUserCount(data.count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch all users when "Total Users" is clicked
  const fetchAllUsers = async () => {
    if (!showUsers) {
      try {
        const { data } = await API.get("/admin/getAllUsers");
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    setShowUsers(!showUsers);
  };

  const [feedbackList] = useState([
    {
      id: 1,
      userName: "Sarah Johnson",
      message: "The new dashboard layout is incredibly intuitive. Love the recent updates!",
      date: "2024-03-15",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      id: 2,
      userName: "Michael Chen",
      message: "Would love to see more data visualization options in the analytics section.",
      date: "2024-03-14",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100"
    },
    {
      id: 3,
      userName: "Emma Wilson",
      message: "The mobile responsiveness is fantastic. Works perfectly on all my devices.",
      date: "2024-03-13",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    }
  ]);

  const stats = [
    { 
      title: 'Total Users', 
      value: loading ? 'Loading...' : userCount.toLocaleString(), 
      Icon: Users, 
      color: 'bg-[#50c878]',
      onClick: fetchAllUsers // Add onClick handler to fetch all users
    }
  ];

  const navItems = [
    { Icon: LayoutDashboard, text: 'Dashboard' },
    { Icon: MessageSquare, text: 'Feedback' },
    { Icon: Users, text: 'Users' }
  ];

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:relative lg:translate-x-0 z-40 w-64 min-h-screen bg-[#2a2a2a] border-r border-[#444444] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-[#444444]">
          <h1 className="text-xl font-bold text-[#50c878]">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#cfcfcf] hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(({ Icon, text }, index) => (
            <button key={index} className="flex items-center space-x-3 w-full p-3 rounded-lg text-[#cfcfcf] hover:bg-[#333333] hover:text-[#50c878] transition-colors">
              <Icon size={20} />
              <span>{text}</span>
              <ChevronRight size={16} className="ml-auto" />
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-[#2a2a2a] border-b border-[#444444] sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-[#cfcfcf] hover:text-white">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-[#cfcfcf]">Dashboard Overview</h2>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(({ title, value, Icon, color, onClick }, index) => (
              <div
                key={index}
                onClick={onClick}
                className="bg-[#2a2a2a] rounded-xl shadow-xl p-6 border border-[#444444] transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-[#1e1e1e]" />
                </div>
                <h3 className="text-[#cfcfcf] text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* User List Section */}
          {showUsers && (
            <section className="bg-[#2a2a2a] rounded-xl shadow-xl border border-[#444444] mt-6">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#cfcfcf] mb-4">All Users</h3>
                <div className="space-y-4">
                  {users.map((user) => (
                    <article key={user._id} className="p-4 bg-[#333333] rounded-lg transform hover:scale-[1.02] transition-transform duration-300">
                      <div className="flex items-start space-x-4">
                        <img
                          src={user.avatar || defaultProfilePic} // Use default profile picture if avatar is missing
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-white">{user.username}</h4>
                          </div>
                          {/* Align email and date in a single row */}
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-[#cfcfcf]">{user.email}</p>
                            <p className="text-sm text-[#cfcfcf]">Joined on: {new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Feedback Section */}
          <section className="bg-[#2a2a2a] rounded-xl shadow-xl border border-[#444444] mt-6">
            <button onClick={() => setFeedbackExpanded(!feedbackExpanded)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#333333] transition-colors">
              <div className="flex items-center space-x-3">
                <MessageSquare className="text-[#50c878]" size={24} />
                <h3 className="text-xl font-semibold text-[#cfcfcf]">User Feedback</h3>
              </div>
              {feedbackExpanded ? <ChevronUp size={20} className="text-[#cfcfcf]" /> : <ChevronDown size={20} className="text-[#cfcfcf]" />}
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${feedbackExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 border-t border-[#444444] space-y-4">
                {feedbackList.map((item) => (
                  <article key={item.id} className="p-4 bg-[#333333] rounded-lg transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-start space-x-4">
                      <img src={item.avatar} alt={item.userName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-white">{item.userName}</h4>
                          <time className="text-sm text-[#cfcfcf]">{item.date}</time>
                        </div>
                        <p className="mt-1 text-[#cfcfcf]">{item.message}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}