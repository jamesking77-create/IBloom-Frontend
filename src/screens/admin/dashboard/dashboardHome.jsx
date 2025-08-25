// screens/admin/dashboard/dashboardHome.js - Updated with notification summary
import React from 'react';
import Calendar from '../../../UI/calendar';
import BookingsList from '../../../UI/bookingList';
import ProgressChart from '../../../UI/progressChart';
import LineChartComponent from '../../../UI/lineChart';

// ADD: Import the global notification context
import { useGlobalNotificationContext } from '../../../components/globalNotificationProvider';
import { Bell, Calendar as CalendarIcon, Package, DollarSign, Wifi, WifiOff } from 'lucide-react';

// ADD: Notification Summary Card Component
const NotificationSummaryCard = () => {
  const { 
    notifications, 
    unreadCounts, 
    isConnected, 
    connectionState,
    clearModuleNotifications 
  } = useGlobalNotificationContext();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isConnected ? (
                <Bell className="h-6 w-6 text-gray-400" />
              ) : (
                <Bell className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                Live Notifications
                {isConnected ? (
                  <Wifi size={14} className="text-green-500" />
                ) : (
                  <WifiOff size={14} className="text-red-500" />
                )}
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {unreadCounts.total} unread
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? 'Live' : connectionState === 'connecting' ? 'Connecting...' : 'Offline'}
          </div>
        </div>
      </div>
      
      {/* Module Breakdown */}
      <div className="bg-gray-50 px-5 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarIcon size={14} className="text-blue-500" />
              <span className="text-xs text-gray-600">Bookings</span>
            </div>
            <p className="text-lg font-semibold text-blue-600">{unreadCounts.bookings}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package size={14} className="text-green-500" />
              <span className="text-xs text-gray-600">Orders</span>
            </div>
            <p className="text-lg font-semibold text-green-600">{unreadCounts.orders}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign size={14} className="text-purple-500" />
              <span className="text-xs text-gray-600">Quotes</span>
            </div>
            <p className="text-lg font-semibold text-purple-600">{unreadCounts.quotes}</p>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {recentNotifications.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="px-5 py-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-sm">{notification.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.module === 'bookings' ? 'bg-blue-100 text-blue-700' :
                    notification.module === 'orders' ? 'bg-green-100 text-green-700' :
                    notification.module === 'quotes' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {notification.module}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 h-[180%] overflow-">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[calc(100vh-120px)]">
      
        <div className="lg:col-span-2 order-1">
          <LineChartComponent/>
        </div>
        
        {/* Calendar - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1 order-2">
          <Calendar />
        </div>
        
        {/* ADD: Notification Summary Card - Show above bookings list */}
        <div className="lg:col-span-3 order-3">
          <NotificationSummaryCard />
        </div>
        
        {/* Bookings List - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2 order-5 lg:order-4">
          <BookingsList />
        </div>
        
        {/* Progress Chart - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1 order-4 lg:order-5">
          <ProgressChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;