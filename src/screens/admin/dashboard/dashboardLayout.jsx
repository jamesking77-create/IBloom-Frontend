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
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsMobile(true);
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
    <div className="flex h-screen bg-[#DDFFD5]">
     
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile}
        toggleSidebar={toggleSidebar} 
      />
      
      
      <div className="flex flex-col flex-1 overflow-hidden">
      
        <DashboardHeader 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        
      
        <DashboardBody isSidebarOpen={isSidebarOpen}>
          <Outlet />
        </DashboardBody>
      </div>
    </div>
  );
};

export default DashboardLayout;