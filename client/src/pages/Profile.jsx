import { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Initialize user state as null
  const [user, setUser] = useState(null);
  // Initialize formData with default empty values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  // Fetch user data using the API instance
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await API.get("/user/getUser");
        setUser(data);
        
        setFormData({
          name: data.name,
          email: data.email,
          phone_no: data.phone_no,
          currentPassword: data.password,
          newPassword: "",
          confirmPassword: ""
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return <div className="text-center text-[#cfcfcf] text-lg mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#1e1e1e]">
      <div className="w-full max-w-3xl px-6">
        <div className="bg-[#2a2a2a] shadow-xl rounded-3xl overflow-hidden border border-[#444444]">
          {/* Profile Header */}
          <div className="bg-[#333333] p-8 text-[#cfcfcf] relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-4 bg-[#444444]/20 rounded-lg p-1.5 hover:bg-[#444444]/30 transition"
            >
              <ArrowLeft className="w-5 h-5 text-[#cfcfcf]" />
            </button>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 bg-[#50c878] rounded-full flex items-center justify-center shadow-lg">
                  <Wallet className="w-16 h-16 text-[#1e1e1e]" />
                </div>
                <div>
                  <h1 className="text-4xl font-semibold text-[#50c878]">{user.name}</h1>
                  <p className="text-lg text-[#cfcfcf]">Recharge Portal Profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#444444]/20 rounded-lg p-2 hover:bg-[#444444]/30 transition"
              >
                <Edit2 className="w-6 h-6 text-[#50c878]" />
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={(e) => { e.preventDefault(); setUser(formData); setIsEditing(false); }} className="p-8 space-y-8 bg-[#2a2a2a]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{user.phone_no}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#cfcfcf]">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(!isEditingPassword)}
                    className="text-[#50c878] hover:text-[#3da861] text-sm flex items-center gap-1"
                  >
                    <Lock className="w-4 h-4" />
                    {isEditingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {!isEditingPassword ? (
                  <p className="text-lg font-medium text-[#cfcfcf]">••••••••</p>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="Current Password"
                        className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#cfcfcf]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="New Password"
                      className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                      required
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                      required
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        // Handle password update validation and API call here if needed
                        if (formData.newPassword !== formData.confirmPassword) {
                          setPasswordError("New passwords don't match");
                          return;
                        }
                        if (formData.newPassword.length < 8) {
                          setPasswordError("Password must be at least 8 characters long");
                          return;
                        }
                        console.log("Password updated successfully");
                        setIsEditingPassword(false);
                        setFormData(prev => ({
                          ...prev,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        }));
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg hover:bg-[#3da861] transition"
                    >
                      <Save className="w-5 h-5" /> Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg hover:bg-[#3da861] transition"
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
