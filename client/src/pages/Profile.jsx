import { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone_no: "", 
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

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
          phone_no: initialUser.phone_no,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone_no: user.phone_no
      }));
    }
  }, [isEditing, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name.includes('Password')) {
      setPasswordError("");
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone_no: user.phone_no
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name: formData.name,
      email: formData.email,
      phone_no: formData.phone_no
    });
    setIsEditing(false);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    // Update the user state with the new password
    setUser(prev => ({
      ...prev,
      password: formData.newPassword // Save the new password to user state
    }));

    console.log("Password updated successfully");
    setIsEditingPassword(false);
    setFormData(prev => ({
      ...prev,
      currentPassword: formData.newPassword, // Keep the new password as current password
      newPassword: "",
      confirmPassword: ""
    }));
  };

  const togglePasswordEdit = () => {
    setIsEditingPassword(!isEditingPassword);
    if (!isEditingPassword && user?.password) {
      setFormData(prev => ({
        ...prev,
        currentPassword: user.password
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    }
  };

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
                  <h1 className="text-4xl font-semibold text-[#50c878]">{formData.name}</h1>
                  <p className="text-lg text-[#cfcfcf]">Recharge Portal Profile</p>
                </div>
              </div>
              <button
                onClick={toggleEdit}
                className="bg-[#444444]/20 rounded-lg p-2 hover:bg-[#444444]/30 transition"
              >
                <Edit2 className="w-6 h-6 text-[#50c878]" />
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-8 space-y-8 bg-[#2a2a2a]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{formData.phone_no}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#cfcfcf]">Password</label>
                  <button
                    type="button"
                    onClick={togglePasswordEdit}
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
                        onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      placeholder="New Password"
                      className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                      required
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                      required
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handlePasswordSave}
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