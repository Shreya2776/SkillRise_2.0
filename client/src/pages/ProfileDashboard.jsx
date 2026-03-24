import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "/profile/me") : "http://localhost:8000/api/profile/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchProfile();
  }, []);

  // ✅ IMPORTANT FIX
  if (!user) {
    return <div className="text-white p-10">Loading...</div>;
  }

  // ✅ PROFILE COMPLETION
  const totalFields = 8;
  const filled = Object.values(user.profile || {}).filter(Boolean).length;
  const completion = Math.round((filled / totalFields) * 100);

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-8">
      <div className="max-w-3xl mx-auto bg-white/10 p-6 rounded-xl">

        <h2 className="text-3xl font-bold mb-4">Your Profile</h2>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Type:</strong> {user.userType}</p>
        <p><strong>Location:</strong> {user.location}</p>

        <p className="mt-4">Profile Completion: {completion}%</p>

        <button
          onClick={() => navigate("/profile", { state: user })}
          className="mt-6 bg-yellow-500 px-4 py-2 rounded"
        >
          Edit Profile
        </button>

      </div>
    </div>
  );
}