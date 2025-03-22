import { useState, useEffect } from "react";
import { Wallet, Save, Edit2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../Utils/API";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
  });

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
        mobile_no: user.mobile_no,
      }));
    }
  };

  const updateUser = async () => {
    try {
      const payload = { ...formData };
      console.log("Updating User with:", payload);
      const { data } = await API.put("/user/updateUser", payload);
      setUser(data);
      setIsEditing(false);
      setUpdateSuccess(true);

      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
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

          {updateSuccess && (
            <div className="text-center text-green-500 font-medium my-2">
              Profile updated successfully
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUser();
            }}
            className="p-8 space-y-8 bg-[#2a2a2a]"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf]"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf]"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#cfcfcf] mb-2">Phone Number</label>
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                  className="w-full px-4 py-3 bg-[#333333] border border-[#444444] rounded-lg text-[#cfcfcf]"
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#50c878] text-[#1e1e1e] font-medium rounded-lg"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              )}

              <div className="flex justify-center items-center mb-2">
                <button
                  className="text-[#50c878] hover:text-[#3da861] text-lg flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/change-password");
                  }}
                >
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