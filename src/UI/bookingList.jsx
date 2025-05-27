import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, User, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your booking slice actions and selectors
// import {
//   fetchBookings,
//   selectBookings,
//   selectBookingsLoading,
//   selectBookingsStats
// } from '../store/slices/bookingSlice';

const BookingsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
   // Safe selectors with fallback values
  const bookings = useSelector((state) => state.bookings?.bookings || []);
  const loading = useSelector((state) => state.bookings?.loading || false);
  const stats = useSelector((state) => state.bookings?.stats || {});

  const handleMoveToBokkings = () =>{
    navigate("/dashboard/home")
  }

  // Sample data for demonstration (remove when connecting to real API)
  const sampleBookings = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      eventType: 'Wedding Reception',
      date: '2024-06-15',
      time: '6:00 PM',
      location: 'Grand Ballroom',
      status: 'confirmed',
      amount: '₦2,500,000'
    },
    {
      id: 2,
      customerName: 'Michael Chen',
      eventType: 'Corporate Event',
      date: '2024-06-18',
      time: '2:00 PM',
      location: 'Conference Center',
      status: 'pending',
      amount: '₦1,800,000'
    },
    {
      id: 3,
      customerName: 'Emily Rodriguez',
      eventType: 'Birthday Party',
      date: '2024-06-20',
      time: '4:00 PM',
      location: 'Garden Pavilion',
      status: 'confirmed',
      amount: '₦950,000'
    },
    {
      id: 4,
      customerName: 'David Thompson',
      eventType: 'Anniversary Dinner',
      date: '2024-06-22',
      time: '7:00 PM',
      location: 'Private Dining',
      status: 'confirmed',
      amount: '₦1,200,000'
    },
    {
      id: 5,
      customerName: 'Lisa Wang',
      eventType: 'Baby Shower',
      date: '2024-06-25',
      time: '3:00 PM',
      location: 'Garden Pavilion',
      status: 'pending',
      amount: '₦750,000'
    }
  ];

  const sampleStats = {
    thisWeek: 12,
    thisMonth: 45,
    totalRevenue: '₦18,200,000'
  };

  useEffect(() => {
    // Dispatch fetchBookings when component mounts
    // Uncomment when you have the booking slice properly set up
    // dispatch(fetchBookings({ limit: 5, sortBy: 'date', order: 'desc' }));
  }, [dispatch]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          dot: 'bg-green-500',
          text: 'text-green-600',
          bg: 'bg-green-50'
        };
      case 'pending':
        return {
          dot: 'bg-orange-500',
          text: 'text-orange-600',
          bg: 'bg-orange-50'
        };
      case 'cancelled':
        return {
          dot: 'bg-red-500',
          text: 'text-red-600',
          bg: 'bg-red-50'
        };
      default:
        return {
          dot: 'bg-gray-500',
          text: 'text-gray-600',
          bg: 'bg-gray-50'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Use Redux data if available, otherwise use sample data
  const displayBookings = bookings.length > 0 ? bookings.slice(0, 5) : sampleBookings;
  const displayStats = stats.thisWeek ? stats : sampleStats;

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Recent Bookings</h3>
        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" onClick={handleMoveToBokkings()}>
          View All
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 overflow-y-auto h-full pr-2">
            {displayBookings.map((booking) => {
              const statusStyles = getStatusStyles(booking.status);
              
              return (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-800 text-sm md:text-base">{booking.customerName}</span>
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 mb-3">{booking.eventType}</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="flex-shrink-0" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="flex-shrink-0" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{booking.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                      <div className="font-bold text-gray-800 text-base md:text-lg">{booking.amount}</div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                        <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></div>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
            {loading ? '...' : displayStats.thisWeek}
          </div>
          <div className="text-xs md:text-sm text-gray-600">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-gray-800">
            {loading ? '...' : displayStats.thisMonth}
          </div>
          <div className="text-xs md:text-sm text-gray-600">This Month</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-green-600">
            {loading ? '...' : displayStats.totalRevenue}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;