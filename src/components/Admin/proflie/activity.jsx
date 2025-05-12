import React from 'react';

// File: Activity.jsx
export const Activity = ({ joinDate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
          <div>
            <p className="font-medium">Profile updated</p>
            <p className="text-sm text-gray-500">3 days ago</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
          <div>
            <p className="font-medium">Completed project "Dashboard Redesign"</p>
            <p className="text-sm text-gray-500">1 week ago</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
          <div>
            <p className="font-medium">Joined the platform</p>
            <p className="text-sm text-gray-500">{joinDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};