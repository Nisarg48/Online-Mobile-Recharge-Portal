import { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize user state as null
  const [user, setUser] = useState(null);

  // Initialize formData with default empty values
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
  });

  // Fetch user data using the API instance
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await API.get("/user/getUser");
        setUser(data);
        
        setFormData({
          name: data.name,
          email: data.email,
          mobile_no: data.mobile_no,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };    

    fetchUserData();
  }, []);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (user) {
      setFormData(() => ({
        name: user.name,
        email: user.email,
        mobile_no: user.mobile_no
      }));
    }
  };

  const updateUser = async () => {
    try {
        const payload = {
            name: formData.name,
            email: formData.email,
            mobile_no: formData.mobile_no, 
        };

        console.log("Updating User with:", payload);

        const { data } = await API.put("/user/updateUser", payload);
        setUser(data);
        setIsEditing(false);
        alert("Profile updated successfully");
    } catch (error) {
        console.error("Error updating profile:", error.response?.data || error.message);
        alert("Failed to update profile");
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
          <form onSubmit={(e) => { 
                  e.preventDefault();
                  updateUser(formData);
                }} 
                className="p-8 space-y-8 bg-[#2a2a2a]">
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    value={formData.mobile_no}
                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg focus:ring-2 focus:ring-[#50c878] focus:border-[#50c878] text-[#cfcfcf]"
                    required
                  />
                ) : (
                  <p className="text-lg font-medium text-[#cfcfcf]">{formData.mobile_no}</p>
                )}
              </div>

              {isEditing && (
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg hover:bg-[#3da861] transition">
                    <Save className="w-5 h-5" /> Save Changes
                </button>
              )}

              <div className="flex justify-center items-center mb-2">
                <button 
                      className="text-[#50c878] hover:text-[#3da861] text-lg flex items-center"
                      onClick={() => navigate('/change-password')}>
                  Change Password
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
