import React from 'react';

const DashboardBody = ({ children, isSidebarOpen }) => {
  return (
    <main
      className={`
        flex-1 p-6 overflow-y-auto transition-all duration-300
        ${isSidebarOpen ? 'md:ml-0' : 'md:ml-0'}
      `}
    >
      <div className="h-full ">
        {/* Main content container with appropriate spacing */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 h-full overflow-scroll">
          {children}
        </div>
      </div>
    </main>
  );
};

export default DashboardBody;