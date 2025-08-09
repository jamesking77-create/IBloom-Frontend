import React from 'react';

const DashboardBody = ({ children, isSidebarOpen }) => {
  return (
    <main className="h-full overflow-hidden">
      <div className="h-full bg-white/70 backdrop-blur-sm  border-t border-gray-200/50 shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </main>
  );
};

export default DashboardBody;