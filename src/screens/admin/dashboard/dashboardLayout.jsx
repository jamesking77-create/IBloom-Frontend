// DashboardLayout.js - FIXED HEIGHT VERSION
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../../components/Admin/dashboard/dashboardHeader';
import Sidebar from '../../../components/Admin/dashboard/sidebar';
import DashboardBody from '../../../components/Admin/dashboard/dashboardBody';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else if (width < 1024) {
        setIsSidebarOpen(false);
        setIsMobile(false);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        toggleSidebar={toggleSidebar}
      />
      
      {/* Main Content Area */}
      <div className={`
        flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out overflow-hidden
        ${isMobile ? 'w-full' : isSidebarOpen ? 'ml-0' : 'ml-0'}
      `}>
        {/* Header - Fixed Height */}
        <div className="flex-shrink-0">
          <DashboardHeader 
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
          />
        </div>
        
        {/* Body - Remaining Height */}
        <div className="flex-1 overflow-hidden">
          <DashboardBody isSidebarOpen={isSidebarOpen}>
            <Outlet />
          </DashboardBody>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;