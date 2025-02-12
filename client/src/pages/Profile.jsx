import React, { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone_no: "" });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/users.json");
        const data = await response.json();
        const initialUser = data.users[0];
        setUser(initialUser);
        setFormData({
          name: initialUser.name,
          email: initialUser.email,
          phone_no: initialUser.phone_no
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(formData);
    setIsEditing(false);
  };

  if (!user) {
    return <div className="text-center text-lg mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-3xl px-6">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-blue-100">
          {/* Profile Header */}
          <div className="bg-blue-600 p-8 text-white relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-4 bg-white/20 rounded-lg p-1.5 hover:bg-white/30 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Wallet className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold">{user.name}</h1>
                  <p className="text-lg text-blue-100">Recharge Portal Profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 rounded-lg p-2 hover:bg-white/30 transition"
              >
                <Edit2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-8 space-y-8 bg-white">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{user.phone_no}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-5 h-5" /> Save Changes
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
