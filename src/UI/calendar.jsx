import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const hasEvent = (day) => {
    // Sample events - you can replace this with actual data
    const eventDays = [5, 12, 18, 25];
    return eventDays.includes(day);
  };
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Calendar</h3>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => navigateMonth(-1)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-gray-800 text-sm md:text-base min-w-20 md:min-w-28 text-center">
            {months[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => navigateMonth(1)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 bg-gray-100 rounded-lg p-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`
              aspect-square flex items-center justify-center relative text-xs md:text-sm rounded-md
              ${day ? 'bg-white hover:bg-blue-50 cursor-pointer' : 'bg-transparent'}
              ${day && isToday(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'}
              ${day && hasEvent(day) && !isToday(day) ? 'border-2 border-[#2C5D22]' : ''}
              transition-colors
            `}
          >
            {day && (
              <>
                <span className="font-medium">{day}</span>
                {hasEvent(day) && !isToday(day) && (
                  <div className="absolute bottom-1 w-1 h-1 bg-[#A61A5A] rounded-full"></div>
                )}
                {hasEvent(day) && isToday(day) && (
                  <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Today</span>
          <div className="w-2 h-2 bg-[#A61A5A] rounded-full ml-4"></div>
          <span>Events</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;