import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, User, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your booking slice actions and selectors
import {
  fetchBookings,
  selectBookings,
  selectBookingsLoading,
  selectBookingsStats,
  getStatusInfo,
  formatCurrency
} from '../store/slices/booking-slice';

const BookingsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use selectors from booking slice
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingsLoading);
  const stats = useSelector(selectBookingsStats);

  const handleMoveToBookings = () => {
    navigate("/dashboard/bookings");
  };

  useEffect(() => {
    if (bookings.length === 0) {
      dispatch(fetchBookings());
    }
  }, [dispatch, bookings.length]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get recent bookings (latest 5) sorted by booking date
  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
    .slice(0, 5);

  // Calculate stats from actual bookings data
  const currentDate = new Date();
  const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekBookings = bookings.filter(booking => 
    new Date(booking.bookingDate) >= oneWeekAgo
  ).length;

  const thisMonthBookings = bookings.filter(booking => 
    new Date(booking.bookingDate) >= oneMonthAgo
  ).length;

  const totalRevenue = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((total, booking) => {
      return total + (booking.pricing?.totalAmount || 0);
    }, 0);

  const calculatedStats = {
    thisWeek: thisWeekBookings,
    thisMonth: thisMonthBookings,
    totalRevenue: formatCurrency(totalRevenue)
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Recent Bookings</h3>
        <button 
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" 
          onClick={handleMoveToBookings}
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500 text-center">
              <div className="text-lg mb-2">No bookings yet</div>
              <div className="text-sm">Bookings will appear here once created</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 overflow-y-auto h-full pr-2">
            {recentBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              
              return (
                <div key={booking.bookingId} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-800 text-sm md:text-base">
                          {booking.customer?.personalInfo?.name}
                        </span>
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mb-3">
                        {booking.customer?.eventDetails?.eventType}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="flex-shrink-0" />
                          <span>{formatDate(booking.eventSchedule?.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="flex-shrink-0" />
                          <span>{formatTime(booking.eventSchedule?.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{booking.customer?.eventDetails?.location}</span>
                        </div>
                      </div>
                      
                      {/* Additional info row */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>ID: {booking.bookingId}</span>
                        <span>{booking.customer?.eventDetails?.numberOfGuests} guests</span>
                        {booking.eventSchedule?.isMultiDay && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            Multi-day
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className="font-bold text-gray-800 text-base md:text-lg">
                          {booking.pricing?.formatted?.total || formatCurrency(booking.pricing?.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.pricing?.totalServices} service{booking.pricing?.totalServices !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                        <div className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`}></div>
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                        <span className="sm:hidden">{statusInfo.label.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-gray-800">
            {loading ? '...' : calculatedStats.thisWeek}
          </div>
          <div className="text-xs md:text-sm text-gray-600">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-gray-800">
            {loading ? '...' : calculatedStats.thisMonth}
          </div>
          <div className="text-xs md:text-sm text-gray-600">This Month</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-green-600">
            {loading ? '...' : calculatedStats.totalRevenue}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;