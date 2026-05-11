import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/ProfileSetup.jsx";
//import AICareerAssistant from "./pages/AICareerAssistant.jsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.jsx";
import SkillGapAnalysis from "./pages/SkillGapAnalysis.jsx";
import CareerExplorer from "./pages/CareerExplorer.jsx";

import LearningRoadmap from "./pages/RoadmapPage.jsx";


import JobsAndInternships from "./pages/JobsAndInternships.jsx";
import GovernmentSchemes from "./pages/GovernmentSchemes.jsx";
import SkillProgress from "./pages/SkillProgress.jsx";
import Feedback from "./pages/Feedback.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import InterviewPage from "./pages/InterviewPage.jsx";
import Chatbot from "./pages/Chatbot/Chatbot.jsx";
import Navbar from "./components/Navbar.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProfileSetup from "./pages/ProfileSetup";
import ProfileDashboard from "./pages/ProfileDashboard";
import Layout from "./components/Layout.jsx";
// New Mock Imports
import { AuthProvider as MockAuthProvider } from "./new-mock/context/AuthContext";
import { ToastProvider as MockToastProvider } from "./new-mock/components/ui/Toast";
import NewInterviewPage from "./new-mock/pages/NewInterviewPage";
import InterviewsPage from "./new-mock/pages/InterviewsPage";
import InterviewDetailPage from "./new-mock/pages/InterviewDetailPage";
import FeedbackPage from "./new-mock/pages/FeedbackPage";
import "./new-mock/index.css";

// Admin Dashboard Imports
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import NgoRegister from "./admin/pages/NgoRegister";
import NgoDashboard from "./ngo/pages/NgoDashboard";

import AdminLogin from "./pages/AdminLogin";

import RecommendationPage from "./pages/RecommendationPage.jsx";

function App() {

  return (

    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />}/>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Removed duplicate /profile route that used the legacy Layout component */}
        <Route
          path="/profile"
  element={
    <Layout>
      <ProfileSetup />
    </Layout>
  }
/>
        <Route
  path="/profile/dashboard"
  element={
    <Layout>
      <ProfileDashboard />
    </Layout>
  }
/>
        <Route element={<ProtectedRoute allowedRoles={["user", "admin", "ngo"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<RecommendationPage />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/skill-gap" element={<SkillGapAnalysis />} />
            <Route path="/career-explorer" element={<CareerExplorer />} />
            <Route path="/learning-roadmap" element={<LearningRoadmap />} />
            <Route path="/jobs" element={<JobsAndInternships />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />
            <Route path="/progress" element={<SkillProgress />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/new_mock" element={<InterviewPage />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/feed" element={<FeedPage />} />

            <Route
              path="/interviews"
              element={
                <MockAuthProvider>
                  <MockToastProvider>
                    <div className="mock-interview-theme relative w-full h-full min-h-screen">
                      <InterviewsPage />
                    </div>
                  </MockToastProvider>
                </MockAuthProvider>
              }
            />
            <Route
              path="/interviews/new"
              element={
                <MockAuthProvider>
                  <MockToastProvider>
                    <div className="mock-interview-theme relative w-full h-full min-h-screen">
                      <NewInterviewPage />
                    </div>
                  </MockToastProvider>
                </MockAuthProvider>
              }
            />
            <Route
              path="/interviews/:id"
              element={
                <MockAuthProvider>
                  <MockToastProvider>
                    <div className="mock-interview-theme relative w-full h-full min-h-screen">
                      <InterviewDetailPage />
                    </div>
                  </MockToastProvider>
                </MockAuthProvider>
              }
            />
            <Route
              path="/interviews/:id/feedback"
              element={
                <MockAuthProvider>
                  <MockToastProvider>
                    <div className="mock-interview-theme relative w-full h-full min-h-screen">
                      <FeedbackPage />
                    </div>
                  </MockToastProvider>
                </MockAuthProvider>
              }
            />
          </Route>
        </Route>

        {/* Admin Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ngo-register" element={<NgoRegister />} />
          </Route>
        </Route>

        {/* NGO Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
          <Route path="/ngo" element={<NgoDashboard />} />
        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;
