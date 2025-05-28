import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ProgressChart = () => {
  // Sample data for the pie chart
  const data = [
    { name: 'Completed', value: 65, color: '#4CAF50' },
    { name: 'In Progress', value: 25, color: '#FF9800' },
    { name: 'Pending', value: 10, color: '#F44336' }
  ];

  const COLORS = data.map(item => item.color);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">Transaction Status</h3>
        <p className="text-sm text-gray-600">Current Progress Overview</p>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 min-h-32 md:min-h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius="80%"
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-gray-800">127</div>
          <div className="text-xs md:text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="text-center">
          <div className="text-lg md:text-xl font-bold text-green-600">83</div>
          <div className="text-xs md:text-sm text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;