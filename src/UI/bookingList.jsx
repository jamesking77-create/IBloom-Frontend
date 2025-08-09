import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  ChevronRight, 
  BookOpen,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your booking slice actions and selectors
import {
  fetchBookings,
  selectBookings,
  selectBookingsLoading,
  selectBookingsStats,
  getStatusInfo,
} from '../store/slices/booking-slice';
import { formatCurrency } from '../utils/formatCcy';

const BookingsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use selectors from booking slice
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingsLoading);
  const stats = useSelector(selectBookingsStats);
  
  // State for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMoveToBookings = () => {
    navigate("/dashboard/bookings");
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/dashboard/bookings/${bookingId}`);
  };

  useEffect(() => {
    if (bookings.length === 0) {
      dispatch(fetchBookings());
    }
  }, [dispatch, bookings.length]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    }
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

  // Get recent bookings (latest 5 or more) sorted by booking date
  const displayLimit = isMobile ? (showAllBookings ? 10 : 3) : (showAllBookings ? 8 : 5);
  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.bookingDate || b.createdAt) - new Date(a.bookingDate || a.createdAt))
    .slice(0, displayLimit);

  // Calculate stats from actual bookings data
  const currentDate = new Date();
  const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekBookings = bookings.filter(booking => 
    new Date(booking.bookingDate || booking.createdAt) >= oneWeekAgo
  ).length;

  const thisMonthBookings = bookings.filter(booking => 
    new Date(booking.bookingDate || booking.createdAt) >= oneMonthAgo
  ).length;

  const totalRevenue = bookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((total, booking) => {
      const amount = booking.pricing?.totalAmount || 
                   booking.pricing?.total || 
                   (typeof booking.amount === 'string' ? 
                     parseFloat(booking.amount.replace(/[₦,\s]/g, '')) : 
                     booking.amount) || 0;
      return total + amount;
    }, 0);

  const calculatedStats = {
    thisWeek: thisWeekBookings,
    thisMonth: thisMonthBookings,
    totalRevenue: formatCurrency ? formatCurrency(totalRevenue) : `₦${totalRevenue.toLocaleString()}`
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-lg border border-gray-200/50 h-full flex flex-col">
      {/* Header - RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <BookOpen className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800">
            {isMobile ? 'Bookings' : 'Recent Bookings'}
          </h3>
          {!loading && bookings.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              {bookings.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {bookings.length > displayLimit && (
            <button
              onClick={() => setShowAllBookings(!showAllBookings)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              <Filter size={14} />
              {showAllBookings ? 'Show Less' : 'Show More'}
            </button>
          )}
          
          <button 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-50" 
            onClick={handleMoveToBookings}
          >
            View All
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Bookings List - RESPONSIVE */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-xs sm:text-sm">Loading bookings...</p>
            </div>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="text-gray-500 text-center">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
              <div className="text-sm sm:text-base lg:text-lg mb-2">No bookings yet</div>
              <div className="text-xs sm:text-sm text-gray-400">Bookings will appear here once created</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 overflow-y-auto h-full pr-1 sm:pr-2">
            {recentBookings.map((booking, index) => {
              const statusInfo = getStatusInfo(booking.status);
              const customerName = booking.customer?.personalInfo?.name || booking.customerName || 'Unknown Customer';
              const eventType = booking.customer?.eventDetails?.eventType || booking.eventType || 'Event';
              const location = booking.customer?.eventDetails?.location || booking.location || 'Location TBD';
              const guests = booking.customer?.eventDetails?.numberOfGuests || booking.guests || 0;
              const startDate = booking.eventSchedule?.startDate || booking.startDate;
              const startTime = booking.eventSchedule?.startTime || booking.startTime;
              const isMultiDay = booking.eventSchedule?.isMultiDay || booking.multiDay;
              const bookingId = booking.bookingId || booking._id || booking.id;
              const totalAmount = booking.pricing?.formatted?.total || 
                                formatCurrency ? formatCurrency(booking.pricing?.totalAmount) : 
                                `₦${(booking.pricing?.totalAmount || 0).toLocaleString()}`;
              const serviceCount = booking.pricing?.totalServices || booking.services?.length || 0;
              
              return (
                <div 
                  key={bookingId || index} 
                  className="group border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                  onClick={() => handleViewBooking(bookingId)}
                >
                  {/* Mobile Layout */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User size={14} className="text-gray-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm truncate">
                              {customerName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {eventType}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></div>
                          <span>{statusInfo.label.split(' ')[0]}</span>
                        </div>
                      </div>
                      
                      {/* Details Row */}
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{formatDate(startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{formatTime(startTime)}</span>
                          </div>
                        </div>
                        <div className="font-bold text-gray-800 text-sm">
                          {totalAmount}
                        </div>
                      </div>
                      
                      {/* Footer Row */}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={10} className="flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{guests} guests</span>
                          {isMultiDay && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                              Multi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Layout */
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-gray-500 flex-shrink-0" />
                          <span className="font-semibold text-gray-800 text-sm md:text-base">
                            {customerName}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 mb-3">
                          {eventType}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="flex-shrink-0" />
                            <span>{formatDate(startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="flex-shrink-0" />
                            <span>{formatTime(startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="truncate">{location}</span>
                          </div>
                        </div>
                        
                        {/* Additional info row */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>ID: {String(bookingId).slice(-6)}</span>
                          <span>{guests} guests</span>
                          {isMultiDay && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              Multi-day
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="font-bold text-gray-800 text-base md:text-lg">
                            {totalAmount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {serviceCount} service{serviceCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                          <div className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`}></div>
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover effect for desktop */}
                  {!isMobile && (
                    <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Stats Footer - RESPONSIVE */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="text-blue-600 w-3 h-3 sm:w-4 sm:h-4" />
            {!isMobile && <span className="text-xs font-medium text-blue-600">Week</span>}
          </div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-blue-700">
            {loading ? '...' : calculatedStats.thisWeek}
          </div>
          <div className="text-xs sm:text-sm text-blue-600 font-medium">
            {isMobile ? 'Week' : 'This Week'}
          </div>
        </div>
        
        <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Activity className="text-green-600 w-3 h-3 sm:w-4 sm:h-4" />
            {!isMobile && <span className="text-xs font-medium text-green-600">Month</span>}
          </div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-green-700">
            {loading ? '...' : calculatedStats.thisMonth}
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-medium">
            {isMobile ? 'Month' : 'This Month'}
          </div>
        </div>
        
        <div className="text-center p-2 sm:p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="text-emerald-600 w-3 h-3 sm:w-4 sm:h-4" />
            {!isMobile && <span className="text-xs font-medium text-emerald-600">Revenue</span>}
          </div>
          <div className="text-xs sm:text-base md:text-lg font-bold text-emerald-700 truncate">
            {loading ? '...' : calculatedStats.totalRevenue}
          </div>
          <div className="text-xs sm:text-sm text-emerald-600 font-medium">
            {isMobile ? 'Revenue' : 'Total Revenue'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;