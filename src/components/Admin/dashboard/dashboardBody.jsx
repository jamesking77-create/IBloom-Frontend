import React from 'react';

const DashboardBody = ({ children, isSidebarOpen }) => {
  return (
    <div className="h-[92%] flex flex-col">
      <div className="bg-gray-50 shadow-sm rounded-lg border border-gray-200 p-6  h-[80%]  overflow-auto mx-2 my-2 flex-1">
        {children}
      </div>
    </div>
  );
};

export default DashboardBody;