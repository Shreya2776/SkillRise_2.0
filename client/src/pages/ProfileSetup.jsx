import { useState  } from "react";
import { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
  User,
  Phone,
  MapPin,
  BookOpen,
  GraduationCap,
  Target,
  CheckCircle,
  Rocket,
  X,
  LayoutDashboard,
  Briefcase,
  Wrench,
  Code,
  Sparkles,
  FileText
} from "lucide-react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Link } from "react-router-dom";
export default function ProfileSetup() {
  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
 const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);

    if (!token) {
        setIsEdit(true);
        //setLoading(false);
        return;
      }

    const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "") : "http://localhost:8000/api";
    const res = await fetch(`${API_BASE}/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setIsEdit(true);
      return;
    }

    const data = await res.json();

    if (data?.profile) {
      setFormData(data?.profile?.data || {});
      setIsEdit(false);
    } else {
      
      setIsEdit(true);
    }
  } catch (err) {
    console.log(err);
    setIsEdit(true);
  }
};
useEffect(() => {
  const local = localStorage.getItem("profile");

  if (local) {
    setFormData(JSON.parse(local));
    setIsEdit(false);
  }

  // then try backend
  fetchProfile();
}, []);

const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);
    const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/auth", "") : "http://localhost:8000/api";
    const res = await fetch(`${API_BASE}/profile/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role:
          index === 0
            ? "student"
            : index === 1
            ? "professional"
            : "worker",
        data: formData,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Save failed ❌");
      return;
    }

    // ✅ IMPORTANT: update state with saved data
    setFormData(data.profile.data || formData);

    setShowSuccess(true);
    setIsEdit(false);

  } catch (err) {
    console.log(err);
  }
};

  const handlers = useSwipeable({
    onSwipedLeft: () => index < 2 && setIndex(index + 1),
    onSwipedRight: () => index > 0 && setIndex(index - 1),
    trackMouse: true,
  });

  if (!isEdit) {
    const roleMap = {
      student: "Student",
      professional: "Professional",
      worker: "Blue-Collar Workforce"
    };

    const userRole = formData.role || index === 0 ? "student" : index === 1 ? "professional" : "worker";
    
    // Calculate profile completion safely
    const totalFields = Object.keys(formData).length > 2 ? Object.keys(formData).length : 8;
    const filledFields = Object.values(formData).filter(v => v !== "" && v !== undefined && v !== null).length;
    const completionPercentage = Math.min(Math.round((filledFields / totalFields) * 100), 100) || 15;

    // Helper to get initials
    const getInitials = (name) => {
      if (!name) return "U";
      return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 relative overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* HEADER SECTION */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              {/* AVATAR */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 p-[2px]">
                  <div className="w-full h-full bg-[#12121a] rounded-full flex items-center justify-center text-3xl font-black tracking-tighter">
                    {getInitials(formData.name)}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#12121a] p-1.5 rounded-full border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* INFO */}
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight mb-1">{formData.name || "Anonymous User"}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <span className="px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20 capitalize flex items-center gap-1.5">
                    <User size={14} /> {roleMap[userRole] || formData.role}
                  </span>
                  {formData.location && (
                    <span className="flex items-center gap-1.5 text-white/50">
                      <MapPin size={14} /> {formData.location}
                    </span>
                  )}
                  {formData.phone && (
                    <span className="flex items-center gap-1.5 text-white/50">
                      <Phone size={14} /> {formData.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* EDIT BUTTON */}
              <button
                onClick={() => setIsEdit(true)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/10 flex items-center gap-2"
              >
                Edit Profile
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Profile Strength</span>
                <span className="text-sm font-black text-violet-400">{completionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - MODULAR CARDS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* EDUCATION & WORK MODULAR ROUTING */}
              {(userRole === "student" || formData.college || formData.degree) && (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><GraduationCap size={20} /></div>
                    <h3 className="text-lg font-bold">Education</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-white/90">{formData.degree || "Degree Not Specified"}</h4>
                        <p className="text-sm text-white/50">{formData.college || "Institution Not Specified"}</p>
                      </div>
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-white/60">{formData.year || "Year N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {(userRole === "professional" || formData.company || formData.role) && (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Briefcase size={20} /></div>
                    <h3 className="text-lg font-bold">Work Experience</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-white/90">{formData.role || "Role Not Specified"}</h4>
                        <p className="text-sm text-white/50">{formData.company || "Company Not Specified"}</p>
                      </div>
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-white/60">{formData.exp ? `${formData.exp} Exp` : "Exp N/A"}</span>
                    </div>
                    {formData.salary && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Current Salary</p>
                        <p className="text-sm font-medium text-white/80">{formData.salary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(userRole === "worker" || formData.skill || formData.work) && (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Wrench size={20} /></div>
                    <h3 className="text-lg font-bold">Trade & Expertise</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">Primary Skill</p>
                      <p className="font-semibold text-sm">{formData.skill || "Not Specified"}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">Experience Level</p>
                      <p className="font-semibold text-sm">{formData.exp || "Not Specified"}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">Work Type</p>
                      <p className="font-semibold text-sm">{formData.work || "Not Specified"}</p>
                    </div>
                    {formData.tools && (
                      <div className="bg-white/5 p-4 rounded-xl">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">Tools & Equip.</p>
                        <p className="font-semibold text-sm">{formData.tools}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SKILLS CHIP SECTION */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><Code size={20} /></div>
                  <h3 className="text-lg font-bold">Key Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills ? (
                    formData.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#1a1a2e] border border-white/10 rounded-full text-xs font-semibold text-white/80 hover:border-pink-500/50 hover:text-pink-400 transition-colors cursor-default shadow-sm">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/30 italic">No skills listed yet. Update your profile!</span>
                  )}
                </div>
              </div>
              
              {/* GOAL / TARGET */}
              {formData.goal && (
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Target size={20} /></div>
                    <h3 className="text-lg font-bold">Career Objective</h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{formData.goal}</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="space-y-6">
              
              {/* DOCUMENTS */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-[24px] p-6 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-400"><FileText size={20} /></div>
                  <h3 className="text-lg font-bold">Documents</h3>
                </div>
                
                <div className="group cursor-pointer bg-white/5 p-4 rounded-xl border border-white/5 border-dashed hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-center">
                  <p className="text-sm font-semibold text-white/70 group-hover:text-violet-400">View Active Resume</p>
                  <p className="text-[10px] text-white/40 mt-1">Uploaded 2 days ago</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // function LocationInput({ value, onChange }) {
  // const [autocomplete, setAutocomplete] = useState(null);

  // const onLoad = (autoC) => setAutocomplete(autoC);

  // const onPlaceChanged = () => {
  //   if (autocomplete) {
  //     const place = autocomplete.getPlace();
  //     const address = place.formatted_address;
  //     onChange(address);
  //   }
  // };

  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // optional: store file or name
  setFormData((prev) => ({
    ...prev,
    resume: file,
  }));

  console.log("Uploaded:", file);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0f0f1a] to-black text-white">

      <div
        {...handlers}
        className="w-[800px] max-w-[95%] h-[680px] max-h-[92vh] rounded-3xl p-6 
        bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
      >

        {/* TABS */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6">
          {["Student", "Professional", "Worker"].map((tab, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`flex-1 py-2 rounded-lg text-sm transition
                ${index === i
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "text-gray-400"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SLIDER */}
        <div
          className="flex transition-transform duration-500 h-[calc(100%-70px)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >

          {/* STUDENT */}
          <FormWrapper title="Student Profile" onSubmit={handleSubmit}>
            <Full><Input icon={<User />} value={formData.name} placeholder="Full Name" onChange={(e)=>handleChange("name",e.target.value)} /></Full>

            <Input icon={<Phone />} value={formData.phone} placeholder="Phone" onChange={(e)=>handleChange("phone",e.target.value)} />
            <Input icon={<MapPin />} value={formData.location} placeholder="Location" onChange={(e)=>handleChange("location",e.target.value)} />

            <Full><Input icon={<GraduationCap />} value={formData.college} placeholder="College" onChange={(e)=>handleChange("college",e.target.value)} /></Full>

            <Input icon={<BookOpen />} value={formData.degree} placeholder="Degree" onChange={(e)=>handleChange("degree",e.target.value)} />

            <Select options={["Year","1st","2nd","3rd","4th"]} onChange={(v)=>handleChange("year",v)} />

            <Full><Input icon={<Target />} value={formData.interests} placeholder="Interests" onChange={(e)=>handleChange("interests",e.target.value)} /></Full>
            <Full><Input icon={<Target />} value={formData.skills} placeholder="Skills (comma separated)" onChange={(e)=>handleChange("skills",e.target.value)} /></Full>
            <Full><Input icon={<Target />} value={formData.goal} placeholder="Career Goal" onChange={(e)=>handleChange("goal",e.target.value)} /></Full>

            <Full>
              <label className="text-sm text-gray-400 mb-1">Upload Resume </label>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                onChange={(e) => handleFileUpload(e)}
              />
            </Full>

          </FormWrapper>

          


          {/* PROFESSIONAL */}
          <FormWrapper title="Professional Profile" onSubmit={handleSubmit}>
            <Full><Input icon={<User />} value={formData.name} placeholder="Full Name" onChange={(e)=>handleChange("name",e.target.value)} /></Full>

            <Input icon={<Phone />} value={formData.phone} placeholder="Phone" onChange={(e)=>handleChange("phone",e.target.value)} />
            <Input icon={<MapPin />} value={formData.location} placeholder="Location" onChange={(e)=>handleChange("location",e.target.value)} />

            <Full><Input icon={<BookOpen />} value={formData.lang} placeholder="Language" onChange={(e)=>handleChange("lang",e.target.value)} /></Full>

            <Input icon={<BookOpen />} value={formData.role} placeholder="Role" onChange={(e)=>handleChange("role",e.target.value)} />
            <Input icon={<Target />} value={formData.exp} placeholder="Experience" onChange={(e)=>handleChange("exp",e.target.value)} />

            <Full><Input icon={<BookOpen />} value={formData.company} placeholder="Company" onChange={(e)=>handleChange("company",e.target.value)} /></Full>

            <Full><Input icon={<Target />} value={formData.skills} placeholder="Skills" onChange={(e)=>handleChange("skills",e.target.value)} /></Full>

            <Input icon={<Target />} value={formData.salary} placeholder="Salary" onChange={(e)=>handleChange("salary",e.target.value)} />

            <Select options={["Career Goal","Switch","Growth"]} onChange={(v)=>handleChange("goal",v)} />

            <Full>
              <label className="text-sm text-gray-400 mb-1">Upload Resume (Optional)</label>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full p-3 rounded-xl bg-[#0f172a] border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                onChange={(e) => handleFileUpload(e)}
              />
            </Full>

          </FormWrapper>

          {/* WORKER */}
          <FormWrapper title="Worker Profile" onSubmit={handleSubmit}>
            <Full><Input icon={<User />} value={formData.name} placeholder="Full Name" onChange={(e)=>handleChange("name",e.target.value)} /></Full>

            <Input icon={<Phone />} value={formData.phone} placeholder="Phone" onChange={(e)=>handleChange("phone",e.target.value)} />
            <Input icon={<MapPin />} value={formData.location} placeholder="Location" onChange={(e)=>handleChange("location",e.target.value)} />

            <Full><Input icon={<BookOpen />} value={formData.lang} placeholder="Language" onChange={(e)=>handleChange("lang",e.target.value)} /></Full>

            <Select value={formData.skill}  options={["Skill Type","Electrician","Driver","Plumber"]} onChange={(v)=>handleChange("skill",v)} />
            <Select  value={formData.exp} options={["Experience","Beginner","Intermediate","Expert"]} onChange={(v)=>handleChange("exp",v)} />

            <Full><Input icon={<Target />} value={formData.skills} placeholder="Skills" onChange={(e)=>handleChange("skills",e.target.value)} /></Full>

            <Input icon={<BookOpen />} value={formData.tools} placeholder="Tools" onChange={(e)=>handleChange("tools",e.target.value)} />

            <Select value={formData.work} options={["Work Type","Daily","Contract","Full-time"]} onChange={(v)=>handleChange("work",v)} />

            <Full><Input icon={<MapPin />} value={formData.radius} placeholder="Work Radius" onChange={(e)=>handleChange("radius",e.target.value)} /></Full>

            <Full><input type="file" className="input" /></Full>
          </FormWrapper>

        </div>
      </div>

      {/* 🔥 SCROLLBAR + INPUT STYLE */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #7c3aed, #3b82f6);
          border-radius: 10px;
        }

        .input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 12px;
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.1);
          color: #d1d5db;
          font-size: 14px;
        }

        .input:focus {
          outline: none;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

/* WRAPPER */
function FormWrapper({ title, children, onSubmit }) {
  return (
    <div className="min-w-full px-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="flex-1 overflow-y-auto pr-2 custom-scroll min-h-0">
        <div className="grid grid-cols-2 gap-4">{children}</div>
      </div>

      <div className="pt-4 bg-gradient-to-t from-black/40">
        <button onClick={onSubmit} className="w-full bg-green-500 py-3 rounded-xl font-semibold">
          Save Profile
        </button>
      </div>
    </div>
  );
}

function Full({ children }) {
  return <div className="col-span-2">{children}</div>;
}

function Input({ icon, value, placeholder, onChange }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
      <div className="text-gray-400">{icon}</div>
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={onChange}
        className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm"
      />
    </div>
  );
}

/* 🔥 CUSTOM SELECT */
function Select({ options,value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value  || ""}
        onChange={(e)=>onChange(e.target.value)}
        className="input appearance-none pr-8"
      >
        {options.map((opt, i) => (
          <option key={i}>{opt}</option>
        ))}
      </select>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        ▼
      </div>
    </div>
  );
}

