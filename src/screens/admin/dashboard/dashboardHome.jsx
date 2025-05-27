
import React from 'react';
import Calendar from '../../../UI/calendar';
import BookingsList from '../../../UI/bookingList';
import ProgressChart from '../../../UI/progressChart';
import LineChartComponent from '../../../UI/lineChart';



const DashboardHome = () => {
  return (
    <div className="p-4 md:p-6 bg-gray-50 h-[180%]   overflow-">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[calc(100vh-120px)] ">
      
        <div className="lg:col-span-2 order-1">
          <LineChartComponent/>
        </div>
        
        {/* Calendar - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1 order-2">
          <Calendar />
        </div>
        
        {/* Bookings List - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2 order-4 lg:order-3">
          <BookingsList />
        </div>
        
        {/* Progress Chart - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1 order-3 lg:order-4">
          <ProgressChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;