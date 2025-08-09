import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { 
  fetchBookings, 
  selectBookings, 
  selectBookingsLoading 
} from '../store/slices/booking-slice'; // Adjust import path as needed

const Calendar = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // Get bookings from Redux store
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingsLoading);
  
  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Process bookings to extract dates for current month
  const bookingDatesMap = useMemo(() => {
    if (!bookings || bookings.length === 0) return {};
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const dateMap = {};
    
    bookings.forEach(booking => {
      try {
        // Try different date fields
        const bookingStartDate = new Date(
          booking.eventSchedule?.startDate || 
          booking.startDate || 
          booking.bookingDate || 
          booking.createdAt
        );
        
        const bookingEndDate = booking.eventSchedule?.endDate || booking.endDate
          ? new Date(booking.eventSchedule?.endDate || booking.endDate)
          : bookingStartDate;
        
        // Check if booking falls in current month/year
        if (bookingStartDate.getFullYear() === currentYear && bookingStartDate.getMonth() === currentMonth) {
          const day = bookingStartDate.getDate();
          
          if (!dateMap[day]) {
            dateMap[day] = [];
          }
          
          dateMap[day].push({
            id: booking._id || booking.bookingId || booking.id,
            customerName: booking.customer?.personalInfo?.name || booking.customerName || 'Unknown Customer',
            eventType: booking.customer?.eventDetails?.eventType || booking.eventType || 'Event',
            location: booking.customer?.eventDetails?.location || booking.location || 'No location',
            guests: booking.customer?.eventDetails?.numberOfGuests || booking.guests || 0,
            startTime: booking.eventSchedule?.startTime || booking.startTime || '09:00',
            endTime: booking.eventSchedule?.endTime || booking.endTime || '17:00',
            status: booking.status || 'pending',
            isMultiDay: booking.eventSchedule?.isMultiDay || booking.multiDay || false,
            endDate: bookingEndDate,
            startDate: bookingStartDate,
            amount: booking.pricing?.formatted?.total || booking.amount || '₦0'
          });
        }
        
        // Handle multi-day events
        if (booking.eventSchedule?.isMultiDay || booking.multiDay) {
          const start = bookingStartDate;
          const end = bookingEndDate;
          
          // Add dates for each day of multi-day event
          const currentLoopDate = new Date(start);
          while (currentLoopDate <= end) {
            if (currentLoopDate.getFullYear() === currentYear && currentLoopDate.getMonth() === currentMonth) {
              const day = currentLoopDate.getDate();
              
              if (!dateMap[day]) {
                dateMap[day] = [];
              }
              
              // Check if this day's booking is already added
              const existingBooking = dateMap[day].find(b => 
                (b.id === (booking._id || booking.bookingId || booking.id))
              );
              
              if (!existingBooking) {
                dateMap[day].push({
                  id: booking._id || booking.bookingId || booking.id,
                  customerName: booking.customer?.personalInfo?.name || booking.customerName || 'Unknown Customer',
                  eventType: booking.customer?.eventDetails?.eventType || booking.eventType || 'Event',
                  location: booking.customer?.eventDetails?.location || booking.location || 'No location',
                  guests: booking.customer?.eventDetails?.numberOfGuests || booking.guests || 0,
                  startTime: booking.eventSchedule?.startTime || booking.startTime || '09:00',
                  endTime: booking.eventSchedule?.endTime || booking.endTime || '17:00',
                  status: booking.status || 'pending',
                  isMultiDay: true,
                  endDate: bookingEndDate,
                  startDate: bookingStartDate,
                  amount: booking.pricing?.formatted?.total || booking.amount || '₦0',
                  isMiddleDay: currentLoopDate.getTime() !== start.getTime() && currentLoopDate.getTime() !== end.getTime()
                });
              }
            }
            currentLoopDate.setDate(currentLoopDate.getDate() + 1);
          }
        }
      } catch (error) {
        console.warn('Error processing booking date:', error, booking);
      }
    });
    
    return dateMap;
  }, [bookings, currentDate]);
  
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
    setSelectedDate(null); // Clear selected date when navigating
    setShowTooltip(null); // Clear tooltip
  };
  
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const hasBooking = (day) => {
    return bookingDatesMap[day] && bookingDatesMap[day].length > 0;
  };
  
  const getBookingCount = (day) => {
    return bookingDatesMap[day] ? bookingDatesMap[day].length : 0;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
      case 'pending_confirmation':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const handleDayClick = (day) => {
    if (hasBooking(day)) {
      setSelectedDate(selectedDate === day ? null : day);
      setShowTooltip(null);
    }
  };
  
  const handleDayHover = (day) => {
    if (hasBooking(day) && selectedDate !== day) {
      setShowTooltip(day);
    }
  };
  
  const handleDayLeave = () => {
    setShowTooltip(null);
  };
  
  const days = getDaysInMonth(currentDate);
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-500" />
          Calendar
        </h3>
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
      
      <div className="grid grid-cols-7 gap-1 bg-gray-100 rounded-lg p-1 relative">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`
              aspect-square flex items-center justify-center relative text-xs md:text-sm rounded-md cursor-pointer
              ${day ? 'bg-white hover:bg-blue-50 transition-colors' : 'bg-transparent'}
              ${day && isToday(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'}
              ${day && hasBooking(day) && !isToday(day) ? 'border-2 border-blue-400' : ''}
              ${day && selectedDate === day ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
            `}
            onClick={() => day && handleDayClick(day)}
            onMouseEnter={() => day && handleDayHover(day)}
            onMouseLeave={handleDayLeave}
          >
            {day && (
              <>
                <span className="font-medium">{day}</span>
                {hasBooking(day) && (
                  <div className="absolute bottom-0 right-0">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${isToday(day) ? 'bg-white' : getStatusColor(bookingDatesMap[day][0]?.status)}
                    `}></div>
                    {getBookingCount(day) > 1 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getBookingCount(day)}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tooltip */}
                {showTooltip === day && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-50 bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                    {getBookingCount(day)} booking{getBookingCount(day) > 1 ? 's' : ''}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-800"></div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Selected Day Details */}
      {selectedDate && bookingDatesMap[selectedDate] && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <CalendarIcon size={16} />
            {months[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
          </h4>
          <div className="space-y-2">
            {bookingDatesMap[selectedDate].map((booking, index) => (
              <div key={`${booking.id}-${index}`} className="bg-white p-2 rounded-md border-l-4 border-blue-400">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-800 text-sm">{booking.customerName}</span>
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={12} />
                    <span>{booking.eventType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{booking.guests} guests</span>
                  </div>
                  <div className="font-semibold text-green-600">
                    {booking.amount}
                  </div>
                  {booking.isMultiDay && (
                    <div className="text-purple-600 font-medium">
                      Multi-day event
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;