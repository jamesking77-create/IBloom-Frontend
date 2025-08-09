import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  fetchBookings, 
  selectBookings, 
  selectBookingsLoading, 
  selectBookingsError 
} from '../store/slices/booking-slice'; // Adjust import path as needed

const ProgressChart = () => {
  const dispatch = useDispatch();
  
  // Get bookings from Redux store
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingsLoading);
  const error = useSelector(selectBookingsError);

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Process booking data to create status statistics
  const chartData = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [];
    }

    // Count bookings by status
    const statusCounts = {
      confirmed: 0,
      pending: 0,
      cancelled: 0
    };

    bookings.forEach(booking => {
      const status = booking.status?.toLowerCase() || 'pending';
      
      if (status === 'confirmed') {
        statusCounts.confirmed++;
      } else if (status === 'pending' || status === 'pending_confirmation') {
        statusCounts.pending++;
      } else if (status === 'cancelled') {
        statusCounts.cancelled++;
      } else {
        // Default unknown status to pending
        statusCounts.pending++;
      }
    });

    const total = statusCounts.confirmed + statusCounts.pending + statusCounts.cancelled;
    
    if (total === 0) {
      return [];
    }

    // Calculate percentages and create chart data
    return [
      {
        name: 'Confirmed',
        value: Math.round((statusCounts.confirmed / total) * 100),
        count: statusCounts.confirmed,
        color: '#4CAF50'
      },
      {
        name: 'Pending',
        value: Math.round((statusCounts.pending / total) * 100),
        count: statusCounts.pending,
        color: '#FF9800'
      },
      {
        name: 'Cancelled',
        value: Math.round((statusCounts.cancelled / total) * 100),
        count: statusCounts.cancelled,
        color: '#F44336'
      }
    ].filter(item => item.count > 0); // Only show statuses that have bookings
  }, [bookings]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        totalRevenue: 0,
        confirmedRevenue: 0
      };
    }

    const confirmed = bookings.filter(booking => booking.status === 'confirmed');
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      let amount = 0;
      if (booking.pricing?.total) {
        amount = typeof booking.pricing.total === 'number' 
          ? booking.pricing.total 
          : parseFloat(booking.pricing.total.toString().replace(/[₦,\s]/g, '')) || 0;
      } else if (booking.amount) {
        amount = typeof booking.amount === 'number'
          ? booking.amount
          : parseFloat(booking.amount.toString().replace(/[₦,\s]/g, '')) || 0;
      }
      return sum + amount;
    }, 0);

    // Calculate confirmed revenue
    const confirmedRevenue = confirmed.reduce((sum, booking) => {
      let amount = 0;
      if (booking.pricing?.total) {
        amount = typeof booking.pricing.total === 'number' 
          ? booking.pricing.total 
          : parseFloat(booking.pricing.total.toString().replace(/[₦,\s]/g, '')) || 0;
      } else if (booking.amount) {
        amount = typeof booking.amount === 'number'
          ? booking.amount
          : parseFloat(booking.amount.toString().replace(/[₦,\s]/g, '')) || 0;
      }
      return sum + amount;
    }, 0);

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      totalRevenue,
      confirmedRevenue
    };
  }, [bookings]);

  const COLORS = chartData.map(item => item.color);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="font-semibold text-gray-800">{data.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div>{data.count} bookings ({data.value}%)</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Booking Status</h3>
          <p className="text-sm text-gray-600">Current Progress Overview</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading chart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Booking Status</h3>
          <p className="text-sm text-gray-600">Current Progress Overview</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-sm mb-2">Error loading data</div>
            <button 
              onClick={() => dispatch(fetchBookings())}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Booking Status</h3>
          <p className="text-sm text-gray-600">Current Progress Overview</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-2">No booking data available</div>
            <p className="text-gray-400 text-xs">Start accepting bookings to see statistics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Booking Status</h3>
        <p className="text-sm text-gray-600">Current Progress Overview</p>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 min-h-32 md:min-h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="80%"
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{item.value}%</span>
                <div className="text-xs text-gray-500">({item.count} bookings)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-gray-800">
            {summaryStats.totalBookings.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-green-600">
            {summaryStats.confirmedBookings.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Confirmed</div>
        </div>
      </div>
      
      {/* Revenue Summary */}
      <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-100">
        <div className="text-center">
          <div className="text-sm md:text-base font-bold text-blue-600">
            ₦{summaryStats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-sm md:text-base font-bold text-green-600">
            ₦{summaryStats.confirmedRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Confirmed Revenue</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;