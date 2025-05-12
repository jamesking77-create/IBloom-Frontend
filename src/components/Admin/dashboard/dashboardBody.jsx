import React from 'react';

const DashboardBody = ({ children, isSidebarOpen }) => {
  return (
  
      <div className="h-full ">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 h-[98%] overflow-scroll  mx-2 my-2 ">
          {children}
        </div>
      </div>
  
  );
};

export default DashboardBody;