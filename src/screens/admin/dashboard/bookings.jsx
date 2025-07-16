import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react';
import {
  fetchBookings,
  updateBookingStatus,
  fetchBookingDetails,
  setStatusFilter,
  setSearchQuery,
  setCurrentPage,
  clearSelectedBooking,
  clearError,
  loadSampleData,
  selectFilteredBookings,
  selectBookingsLoading,
  selectBookingsError,
  selectStatusFilter,
  selectSearchQuery,
  selectPagination,
  selectSelectedBooking,
  selectBookingStats,
  updateBookingStatusOptimistic,
  formatTime,
  calculateEventDuration
} from '../../../store/slices/booking-slice';

const Bookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectFilteredBookings);
  const loading = useSelector(selectBookingsLoading);
  const error = useSelector(selectBookingsError);
  const statusFilter = useSelector(selectStatusFilter);
  const searchQuery = useSelector(selectSearchQuery);
  const pagination = useSelector(selectPagination);
  const selectedBooking = useSelector(selectSelectedBooking);
  const bookingStats = useSelector(selectBookingStats);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentViewingBooking, setCurrentViewingBooking] = useState(null);

  useEffect(() => {
    // Load sample data on component mount
    dispatch(loadSampleData());
    
    // Alternatively, you can fetch from API:
    // dispatch(fetchBookings());
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedBooking());
    };
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
    return date.toLocaleDateString('en-us', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTimeRange = (booking) => {
    const startDate = formatDate(booking.startDate);
    const endDate = formatDate(booking.endDate);
    const startTime = formatTime(booking.startTime);
    const endTime = formatTime(booking.endTime);
    
    if (booking.singleDay) {
      return `${startDate} • ${startTime} - ${endTime}`;
    } else {
      return `${startDate} ${startTime} - ${endDate} ${endTime}`;
    }
  };

  const handleViewBooking = async (booking) => {
    setCurrentViewingBooking(booking);
    setShowViewModal(true);
    
    // Optionally fetch detailed booking info
    // try {
    //   await dispatch(fetchBookingDetails(booking.id)).unwrap();
    // } catch (error) {
    //   console.error('Failed to fetch booking details:', error);
    // }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setProcessingBookingId(bookingId);
    try {
      // Optimistic update
      dispatch(updateBookingStatusOptimistic({ bookingId, status: newStatus }));
      
      // Update the currently viewing booking if it's the same one
      if (currentViewingBooking && currentViewingBooking.id === bookingId) {
        setCurrentViewingBooking(prev => ({ ...prev, status: newStatus }));
      }
      
      // Actual API call
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update booking status:', error);
      // The error will be handled by the rejected case in the slice
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleApprove = (bookingId) => {
    handleStatusUpdate(bookingId, 'confirmed');
  };

  const handleReject = (bookingId) => {
    handleStatusUpdate(bookingId, 'cancelled');
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // Calculate pagination
  const totalPages = Math.ceil(bookings.length / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
          <p className="text-gray-600">Manage and track all event bookings</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{bookingStats.total}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-orange-600">{bookingStats.pending}</div>
                <div className="text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{bookingStats.confirmed}</div>
                <div className="text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{bookingStats.multiDay}</div>
                <div className="text-gray-600">Multi-day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paginatedBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedBookings.map((booking) => {
                const statusStyles = getStatusStyles(booking.status);
                const isProcessing = processingBookingId === booking.id;
                
                return (
                  <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <User size={20} className="text-gray-500" />
                          <h3 className="font-semibold text-lg text-gray-900">{booking.customerName}</h3>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                            <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></div>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                          {booking.multiDay && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              Multi-day
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-600 mb-4">{booking.eventType}</div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{formatDateTimeRange(booking)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>{calculateEventDuration(booking.startDate, booking.endDate, booking.startTime, booking.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <span>{booking.guests} guests</span>
                          {booking.paymentStatus && (
                            <>
                              <span className="mx-2">•</span>
                              <span className={`${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                Payment: {booking.paymentStatus}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount and Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-xl text-gray-900">{booking.amount}</div>
                          <div className="text-sm text-gray-500">Total Amount</div>
                          {booking.amountPaid && booking.amountPaid !== '₦0' && (
                            <div className="text-sm text-green-600">Paid: {booking.amountPaid}</div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                              >
                                <Check size={16} />
                                {isProcessing ? 'Processing...' : 'Approve'}
                              </button>
                              
                              <button
                                onClick={() => handleReject(booking.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                              >
                                <X size={16} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, bookings.length)} of {bookings.length} bookings
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Booking Modal */}
      {showViewModal && currentViewingBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Booking details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{currentViewingBooking.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{currentViewingBooking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{currentViewingBooking.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{formatDateTimeRange(currentViewingBooking)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>{calculateEventDuration(currentViewingBooking.startDate, currentViewingBooking.endDate, currentViewingBooking.startTime, currentViewingBooking.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{currentViewingBooking.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{currentViewingBooking.guests} Guests</span>
                      </div>
                      {currentViewingBooking.multiDay && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            Multi-day Event
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{currentViewingBooking.specialRequests}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">{currentViewingBooking.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <span className="font-semibold text-green-600">{currentViewingBooking.amountPaid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className={`font-semibold ${currentViewingBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {currentViewingBooking.paymentStatus?.charAt(0).toUpperCase() + currentViewingBooking.paymentStatus?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Status</h3>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusStyles(currentViewingBooking.status).bg}`}>
                        <div className={`w-3 h-3 rounded-full ${getStatusStyles(currentViewingBooking.status).dot}`}></div>
                        <span className={`font-medium ${getStatusStyles(currentViewingBooking.status).text}`}>
                          {currentViewingBooking.status.charAt(0).toUpperCase() + currentViewingBooking.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Action buttons based on status */}
                      {currentViewingBooking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(currentViewingBooking.id)}
                            disabled={processingBookingId === currentViewingBooking.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <Check size={16} />
                            {processingBookingId === currentViewingBooking.id ? 'Processing...' : 'Approve Booking'}
                          </button>
                          <button
                            onClick={() => handleReject(currentViewingBooking.id)}
                            disabled={processingBookingId === currentViewingBooking.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            Reject Booking
                          </button>
                        </div>
                      )}
                      
                      {currentViewingBooking.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(currentViewingBooking.id)}
                            disabled={processingBookingId === currentViewingBooking.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <X size={16} />
                            Cancel Booking
                          </button>
                        </div>
                      )}
                      
                      {currentViewingBooking.status === 'cancelled' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(currentViewingBooking.id)}
                            disabled={processingBookingId === currentViewingBooking.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <Check size={16} />
                            Reactivate Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Created on: {new Date(currentViewingBooking.createdAt).toLocaleDateString('en-us', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;