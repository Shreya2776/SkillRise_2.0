import React, { useState } from 'react';
import Sidebar from './Sidebar';

const IconGradient = () => (
  <svg width="0" height="0" className="absolute hidden">
    <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop stopColor="#a786ff" offset="0%" />
      <stop stopColor="#60a5fa" offset="100%" />
    </linearGradient>
    <linearGradient id="hover-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop stopColor="#d8b4fe" offset="0%" />
      <stop stopColor="#a786ff" offset="100%" />
    </linearGradient>
  </svg>
);

const DashboardLayout = ({ children, noSidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#080005] text-white overflow-hidden font-sans relative">
      <IconGradient />

      <div className="z-10 flex w-full h-full relative">
        {!noSidebar && (
          <div
            className="h-full p-3 flex-shrink-0 transition-all duration-300"
            style={{ width: isCollapsed ? "72px" : "240px" }}
          >
            <Sidebar
              isCollapsed={isCollapsed}
              toggleSidebar={() => setIsCollapsed(prev => !prev)}
            />
          </div>
        )}

        <main className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="w-full h-full flex flex-col pt-6 px-6 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
