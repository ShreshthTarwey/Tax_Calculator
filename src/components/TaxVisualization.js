'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is greater than 1%
  if (percent < 0.01) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
    >
      {`${name} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};

export default function TaxVisualization({ taxResult }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (taxResult) {
      const data = {
        // Tax Breakdown Pie Chart Data
        taxBreakdown: taxResult.taxSlabs.map(slab => ({
          name: `${slab.rate}%`,
          value: slab.taxAmount,
          percentage: ((slab.taxAmount / taxResult.totalTax) * 100).toFixed(1)
        })),

        // Tax Bracket Visualization Data
        taxBrackets: taxResult.taxSlabs.map(slab => ({
          name: `${slab.rate}%`,
          tax: slab.taxAmount,
          taxableAmount: slab.taxableAmount
        })),

        // Take-home Pay Breakdown
        takeHomePay: [
          { name: 'Gross Income', value: taxResult.income },
          { name: 'Taxes', value: taxResult.totalTax },
          { name: 'Net Income', value: taxResult.netIncome }
        ],

        // Year-over-Year Comparison (Sample data)
        yearlyComparison: [
          { year: '2020', tax: taxResult.totalTax * 0.9 },
          { year: '2021', tax: taxResult.totalTax * 0.95 },
          { year: '2022', tax: taxResult.totalTax * 0.98 },
          { year: '2023', tax: taxResult.totalTax }
        ]
      };
      setChartData(data);
    }
  }, [taxResult]);

  if (!taxResult || !chartData) return null;

  const formatCurrency = (value) => {
    if (taxResult.originalCurrency === 'INR') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return `$${value.toLocaleString('en-US')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-purple-400 mb-4 relative inline-block"
      >
        Tax Visualization
        <motion.span 
          className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-500"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm"
        >
          <h3 className="text-lg font-medium text-purple-300 mb-4">Tax Breakdown by Bracket</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.taxBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.taxBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid #6B7280',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const item = chartData.taxBreakdown.find(item => item.name === value);
                    return `${value} Bracket (${item.percentage}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tax Bracket Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm"
        >
          <h3 className="text-lg font-medium text-purple-300 mb-4">Tax Bracket Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.taxBrackets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid #6B7280',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar dataKey="taxableAmount" name="Taxable Amount" fill="#8B5CF6" />
                <Bar dataKey="tax" name="Tax Amount" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Take-home Pay Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm"
        >
          <h3 className="text-lg font-medium text-purple-300 mb-4">Income Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.takeHomePay}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.takeHomePay.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid #6B7280',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Year-over-Year Comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm"
        >
          <h3 className="text-lg font-medium text-purple-300 mb-4">Year-over-Year Tax Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    border: '1px solid #6B7280',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tax" 
                  name="Tax Amount" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 