import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Redux functionality for demo purposes
const mockInitialState = {
  lineChart: {
    data: [
      { name: 'Jan', bookings: 40, revenue: 240000 },
      { name: 'Feb', bookings: 30, revenue: 139800 },
      { name: 'Mar', bookings: 20, revenue: 980000 },
      { name: 'Apr', bookings: 27, revenue: 390800 },
      { name: 'May', bookings: 18, revenue: 480000 },
      { name: 'Jun', bookings: 23, revenue: 380000 },
      { name: 'Jul', bookings: 34, revenue: 430000 },
    ],
    loading: false,
    error: null,
    selectedMetrics: ['bookings', 'revenue'],
    totalBookings: 192,
    totalRevenue: 3059800,
    averageBookings: 27,
    averageRevenue: 437114
  }
};

// Mock hooks for demonstration (replace with actual redux hooks in your app)
const useSelector = (selector) => {
  const [state] = React.useState(mockInitialState);
  return selector(state);
};

const useDispatch = () => {
  return (action) => {
    console.log('Dispatch action:', action);
  };
};

const LineChartComponent = () => {
  // Redux selectors (replace with actual imports from your slice)
  const data = useSelector(state => state.lineChart.data);
  const loading = useSelector(state => state.lineChart.loading);
  const error = useSelector(state => state.lineChart.error);
  const selectedMetrics = useSelector(state => state.lineChart.selectedMetrics);
  const totalBookings = useSelector(state => state.lineChart.totalBookings);
  const totalRevenue = useSelector(state => state.lineChart.totalRevenue);
  const averageBookings = useSelector(state => state.lineChart.averageBookings);
  const averageRevenue = useSelector(state => state.lineChart.averageRevenue);
  
  const dispatch = useDispatch();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
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

  // Custom legend component
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Error Loading Data</div>
            <div className="text-gray-600 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Monthly Performance</h3>
        <p className="text-gray-600">Bookings and Revenue Overview</p>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Total Bookings</p>
          <p className="text-lg font-bold text-blue-700">{totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Total Revenue</p>
          <p className="text-lg font-bold text-green-700">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-purple-600 font-medium">Avg Bookings</p>
          <p className="text-lg font-bold text-purple-700">{averageBookings}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-orange-600 font-medium">Avg Revenue</p>
          <p className="text-lg font-bold text-orange-700">₦{averageRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {selectedMetrics.includes('bookings') && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="bookings" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Bookings"
              />
            )}
            
            {selectedMetrics.includes('revenue') && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                name="Revenue (₦)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metric Toggle Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {selectedMetrics.length} of 2 metrics
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => console.log('Toggle bookings')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              selectedMetrics.includes('bookings')
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Bookings
          </button>
          <button 
            onClick={() => console.log('Toggle revenue')}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
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