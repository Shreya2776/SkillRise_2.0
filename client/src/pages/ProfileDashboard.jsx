// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ProfileDashboard() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await axios.get(
//           (import.meta.env.VITE_API_URL || "http://localhost:8000/api") + "/profile/me",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setUser(res.data.profile);
//       } catch (err) {
//         console.error("FETCH ERROR:", err);
//       }
//     };import { useEffect, useState } from "react";
//     import axios from "axios";
//     import { useNavigate } from "react-router-dom";

//     export default function ProfileDashboard() {
//       const [user, setUser] = useState(null);
//       const navigate = useNavigate();

//       useEffect(() => {
//         const fetchProfile = async () => {
//           try {
//             const token = localStorage.getItem("token");

//             const res = await axios.get(
//               (import.meta.env.VITE_API_URL || "http://localhost:8000/api") + "/profile/me",
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                 },
//               }
//             );

//             console.log("Profile response:", res.data);
//             setUser(res.data.profile);
//           } catch (err) {
//             console.error("FETCH ERROR:", err);
//           }
//         };

//         fetchProfile();
//       }, []);

//       if (!user) {
//         return (
//           <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center">
//             <div className="text-white text-xl">Loading profile...</div>
//           </div>
//         );
//       }

//       // ✅ PROFILE COMPLETION
//       const profileData = user.data || {};
//       const totalFields = 8;
//       const filled = Object.values(profileData).filter(Boolean).length;
//       const completion = Math.round((filled / totalFields) * 100);

//       return (
//         <div className="min-h-screen bg-[#0f0c29] text-white p-8">
//           <div className="max-w-3xl mx-auto bg-white/10 p-6 rounded-xl">

//             <h2 className="text-3xl font-bold mb-4">Your Profile</h2>

//             {Object.keys(profileData).length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-xl mb-4">No profile data found</p>
//                 <p className="text-white/60 mb-6">Complete your profile to get started</p>
//                 <button
//                   onClick={() => navigate("/profile-setup")}
//                   className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
//                 >
//                   Complete Profile
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="space-y-3 mb-6">
//                   <p><strong>Name:</strong> {profileData.name || 'Not set'}</p>
//                   <p><strong>Email:</strong> {profileData.email || 'Not set'}</p>
//                   <p><strong>Type:</strong> {profileData.userType || user.role || 'Not set'}</p>
//                   <p><strong>Location:</strong> {profileData.location || profileData.state || 'Not set'}</p>
//                   <p><strong>Skills:</strong> {profileData.skills || 'Not set'}</p>
//                   <p><strong>Education:</strong> {profileData.education || 'Not set'}</p>
//                   <p><strong>Experience:</strong> {profileData.experience || 'Not set'}</p>
//                 </div>

//                 <div className="bg-white/5 p-4 rounded-lg mb-6">
//                   <p className="text-sm text-white/60 mb-2">Profile Completion</p>
//                   <div className="flex items-center gap-3">
//                     <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
//                       <div 
//                         className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
//                         style={{ width: `${completion}%` }}
//                       />
//                     </div>
//                     <span className="text-lg font-bold">{completion}%</span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => navigate("/profile-setup", { state: user })}
//                   className="w-full bg-yellow-500 hover:bg-yellow-600 px-4 py-3 rounded-lg font-semibold transition-colors"
//                 >
//                   Edit Profile
//                 </button>
//               </>
//             )}

//           </div>
//         </div>
//       );
//     }


//     fetchProfile();
//   }, []);

//   // ✅ IMPORTANT FIX
//   if (!user) {
//     return <div className="text-white p-10">Loading...</div>;
//   }

//   // ✅ PROFILE COMPLETION
//   const totalFields = 8;
//   const filled = Object.values(user.profile || {}).filter(Boolean).length;
//   const completion = Math.round((filled / totalFields) * 100);

//   return (
//     <div className="min-h-screen bg-[#0f0c29] text-white p-8">
//       <div className="max-w-3xl mx-auto bg-white/10 p-6 rounded-xl">

//         <h2 className="text-3xl font-bold mb-4">Your Profile</h2>

//         <p><strong>Name:</strong> {user.name}</p>
//         <p><strong>Type:</strong> {user.userType}</p>
//         <p><strong>Location:</strong> {user.location}</p>

//         <p className="mt-4">Profile Completion: {completion}%</p>

//         <button
//           onClick={() => navigate("/profile", { state: user })}
//           className="mt-6 bg-yellow-500 px-4 py-2 rounded"
//         >
//           Edit Profile
//         </button>

//       </div>
//     </div>
//   );
// }

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
          (import.meta.env.VITE_API_URL || "http://localhost:8000/api") + "/profile/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Profile response:", res.data);
        setUser(res.data.profile);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  // ✅ PROFILE COMPLETION
  const profileData = user.data || {};
  const totalFields = 8;
  const filled = Object.values(profileData).filter(Boolean).length;
  const completion = Math.round((filled / totalFields) * 100);

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white p-8">
      <div className="max-w-3xl mx-auto bg-white/10 p-6 rounded-xl">

        <h2 className="text-3xl font-bold mb-4">Your Profile</h2>

        {Object.keys(profileData).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl mb-4">No profile data found</p>
            <p className="text-white/60 mb-6">Complete your profile to get started</p>
            <button
              onClick={() => navigate("/profile-setup")}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Complete Profile
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <p><strong>Name:</strong> {profileData.name || 'Not set'}</p>
              <p><strong>Email:</strong> {profileData.email || 'Not set'}</p>
              <p><strong>Type:</strong> {profileData.userType || user.role || 'Not set'}</p>
              <p><strong>Location:</strong> {profileData.location || profileData.state || 'Not set'}</p>
              <p><strong>Skills:</strong> {profileData.skills || 'Not set'}</p>
              <p><strong>Education:</strong> {profileData.education || 'Not set'}</p>
              <p><strong>Experience:</strong> {profileData.experience || 'Not set'}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg mb-6">
              <p className="text-sm text-white/60 mb-2">Profile Completion</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-lg font-bold">{completion}%</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile-setup", { state: user })}
              className="w-full bg-yellow-500 hover:bg-yellow-600 px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Profile
            </button>
          </>
        )}

      </div>
    </div>
  );
}
