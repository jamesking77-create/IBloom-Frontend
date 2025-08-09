import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Calendar, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { 
  fetchBookings, 
  selectBookings, 
  selectBookingsLoading, 
  selectBookingsError 
} from '../store/slices/booking-slice'; // Adjust import path as needed

const LineChartComponent = () => {
  const dispatch = useDispatch();
  
  // Get real data from Redux store
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingsLoading);
  const error = useSelector(selectBookingsError);
  
  // State for responsive chart settings
  const [selectedMetrics, setSelectedMetrics] = useState(['bookings', 'revenue']);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Process booking data to create monthly statistics
  const chartData = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [];
    }

    // Get current year and create month buckets
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize monthly data
    const monthlyData = monthNames.map((name, index) => ({
      name,
      month: index,
      bookings: 0,
      revenue: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0
    }));

    // Process each booking
    bookings.forEach(booking => {
      try {
        // Get booking date (try different date fields)
        const bookingDate = new Date(
          booking.bookingDate || 
          booking.createdAt || 
          booking.startDate || 
          booking.eventSchedule?.startDate
        );
        
        // Only include bookings from current year
        if (bookingDate.getFullYear() !== currentYear) {
          return;
        }

        const month = bookingDate.getMonth();
        
        // Extract revenue amount
        let revenue = 0;
        if (booking.pricing?.total) {
          revenue = typeof booking.pricing.total === 'number' 
            ? booking.pricing.total 
            : parseFloat(booking.pricing.total.toString().replace(/[₦,\s]/g, '')) || 0;
        } else if (booking.amount) {
          revenue = typeof booking.amount === 'number'
            ? booking.amount
            : parseFloat(booking.amount.toString().replace(/[₦,\s]/g, '')) || 0;
        }

        // Update monthly statistics
        if (monthlyData[month]) {
          monthlyData[month].bookings += 1;
          monthlyData[month].revenue += revenue;
          
          // Count by status
          const status = booking.status || 'pending';
          if (status === 'confirmed') {
            monthlyData[month].confirmedBookings += 1;
          } else if (status === 'pending' || status === 'pending_confirmation') {
            monthlyData[month].pendingBookings += 1;
          } else if (status === 'cancelled') {
            monthlyData[month].cancelledBookings += 1;
          }
        }
      } catch (error) {
        console.warn('Error processing booking date:', error, booking);
      }
    });

    // Only return months that have data (or show all months with 0 data)
    return monthlyData.filter((month, index) => {
      // Show current month and previous months, or months with data
      const currentMonth = new Date().getMonth();
      return index <= currentMonth || month.bookings > 0;
    });
  }, [bookings]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookings: 0,
        averageRevenue: 0
      };
    }

    const totalBookings = chartData.reduce((sum, month) => sum + month.bookings, 0);
    const totalRevenue = chartData.reduce((sum, month) => sum + month.revenue, 0);
    const monthsWithData = chartData.filter(month => month.bookings > 0).length;

    return {
      totalBookings,
      totalRevenue,
      averageBookings: monthsWithData > 0 ? Math.round(totalBookings / monthsWithData) : 0,
      averageRevenue: monthsWithData > 0 ? Math.round(totalRevenue / monthsWithData) : 0
    };
  }, [chartData]);

  // Toggle metrics
  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        // Don't allow removing all metrics
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== metric);
      } else {
        return [...prev, metric];
      }
    });
  };

  // Custom tooltip component - RESPONSIVE
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl shadow-lg max-w-xs">
          <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs sm:text-sm">
              {`${entry.name}: ${
                entry.dataKey === 'revenue' 
                  ? '₦' + entry.value.toLocaleString() 
                  : entry.value.toLocaleString()
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend component - RESPONSIVE
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-xs sm:text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state - RESPONSIVE
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg h-full min-h-[300px] sm:min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading booking data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - RESPONSIVE
  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg h-full min-h-[300px] sm:min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-base sm:text-lg mb-2">Error Loading Data</div>
            <div className="text-gray-600 text-sm mb-4">{error}</div>
            <button 
              onClick={() => dispatch(fetchBookings())}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg sm:rounded-xl hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state - RESPONSIVE
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg h-full min-h-[300px] sm:min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <div className="text-gray-500 text-base sm:text-lg mb-2">No Booking Data</div>
            <div className="text-gray-400 text-sm">No bookings found for this year</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-lg h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
      {/* Header - RESPONSIVE */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
            <TrendingUp className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Monthly Performance</h3>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="text-gray-500 w-4 h-4" />
            <span className="text-xs sm:text-sm text-gray-600">{new Date().getFullYear()}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">Bookings and Revenue Overview</p>
      </div>
      
      {/* Stats Summary - FULLY RESPONSIVE GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-blue-200">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <BarChart3 className="text-blue-600 w-3 h-3 sm:w-4 sm:h-4" />
            <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Bookings</p>
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-blue-700">
            {summaryStats.totalBookings.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-green-200">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <DollarSign className="text-green-600 w-3 h-3 sm:w-4 sm:h-4" />
            <p className="text-xs sm:text-sm text-green-600 font-medium">Total Revenue</p>
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-green-700">
            ₦{summaryStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-purple-200">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Activity className="text-purple-600 w-3 h-3 sm:w-4 sm:h-4" />
            <p className="text-xs sm:text-sm text-purple-600 font-medium">Avg Bookings</p>
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-purple-700">
            {summaryStats.averageBookings}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-orange-200">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <TrendingUp className="text-orange-600 w-3 h-3 sm:w-4 sm:h-4" />
            <p className="text-xs sm:text-sm text-orange-600 font-medium">Avg Revenue</p>
          </div>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-orange-700">
            ₦{summaryStats.averageRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart - RESPONSIVE HEIGHT */}
      <div className={`mb-4 ${isMobile ? 'h-64' : 'h-72 sm:h-80 lg:h-96'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ 
              top: 5, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 20, 
              bottom: 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: isMobile ? 10 : 12, 
                fill: '#666' 
              }}
              interval={isMobile ? 1 : 0} // Show every other month on mobile
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: isMobile ? 10 : 12, 
                fill: '#666' 
              }}
              width={isMobile ? 30 : 60}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: isMobile ? 10 : 12, 
                fill: '#666' 
              }}
              width={isMobile ? 30 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend content={<CustomLegend />} />}
            
            {selectedMetrics.includes('bookings') && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="bookings" 
                stroke="#3B82F6" 
                strokeWidth={isMobile ? 2 : 3}
                dot={{ 
                  fill: '#3B82F6', 
                  strokeWidth: 2, 
                  r: isMobile ? 3 : 4 
                }}
                activeDot={{ 
                  r: isMobile ? 5 : 6, 
                  stroke: '#3B82F6', 
                  strokeWidth: 2 
                }}
                name="Bookings"
              />
            )}
            
            {selectedMetrics.includes('revenue') && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={isMobile ? 2 : 3}
                dot={{ 
                  fill: '#10B981', 
                  strokeWidth: 2, 
                  r: isMobile ? 3 : 4 
                }}
                activeDot={{ 
                  r: isMobile ? 5 : 6, 
                  stroke: '#10B981', 
                  strokeWidth: 2 
                }}
                name="Revenue (₦)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile Legend - Show when desktop legend is hidden */}
      {isMobile && (
        <div className="flex justify-center gap-4 mb-4">
          {selectedMetrics.includes('bookings') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Bookings</span>
            </div>
          )}
          {selectedMetrics.includes('revenue') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Revenue</span>
            </div>
          )}
        </div>
      )}

      {/* Metric Toggle Controls - RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {selectedMetrics.length} of 2 metrics • {chartData.length} months
        </div>
        <div className="flex gap-2 justify-center sm:justify-end">
          <button 
            onClick={() => toggleMetric('bookings')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
              selectedMetrics.includes('bookings')
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Bookings
          </button>
          <button 
            onClick={() => toggleMetric('revenue')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
              selectedMetrics.includes('revenue')
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent;