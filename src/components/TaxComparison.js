'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const taxRates = {
  'United States': [
    { threshold: 0, rate: 0.10 },
    { threshold: 11000, rate: 0.12 },
    { threshold: 44725, rate: 0.22 },
    { threshold: 95375, rate: 0.24 },
    { threshold: 182100, rate: 0.32 },
    { threshold: 231250, rate: 0.35 },
    { threshold: 578125, rate: 0.37 }
  ],
  'United Kingdom': [
    { threshold: 0, rate: 0.20 },
    { threshold: 37700, rate: 0.40 },
    { threshold: 125140, rate: 0.45 }
  ],
  'Canada': [
    { threshold: 0, rate: 0.15 },
    { threshold: 53359, rate: 0.205 },
    { threshold: 106717, rate: 0.26 },
    { threshold: 165430, rate: 0.29 },
    { threshold: 235675, rate: 0.33 }
  ],
  'Australia': [
    { threshold: 0, rate: 0.19 },
    { threshold: 18201, rate: 0.325 },
    { threshold: 45000, rate: 0.37 },
    { threshold: 120000, rate: 0.45 }
  ],
  'India': [
    { threshold: 0, rate: 0.00 },
    { threshold: 300000, rate: 0.05 },
    { threshold: 600000, rate: 0.10 },
    { threshold: 900000, rate: 0.15 },
    { threshold: 1200000, rate: 0.20 },
    { threshold: 1500000, rate: 0.30 }
  ]
};

const currencyRates = {
  USD: 1,
  INR: 83.25
};

export default function TaxComparison({ income, currency }) {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (income) {
      calculateComparisons();
    }
  }, [income, currency]);

  const calculateTax = (country, amount) => {
    const rates = taxRates[country];
    let totalTax = 0;
    let remainingIncome = amount;

    for (let i = 0; i < rates.length; i++) {
      const currentRate = rates[i];
      const nextRate = rates[i + 1];
      const threshold = currentRate.threshold;
      const nextThreshold = nextRate ? nextRate.threshold : Infinity;

      if (remainingIncome > threshold) {
        const taxableInThisBracket = Math.min(remainingIncome - threshold, nextThreshold - threshold);
        const taxInThisBracket = taxableInThisBracket * currentRate.rate;
        totalTax += taxInThisBracket;
        remainingIncome -= taxableInThisBracket;
      }
    }

    return totalTax;
  };

  const calculateComparisons = () => {
    setLoading(true);
    const amount = currency === 'INR' ? parseFloat(income) / currencyRates.INR : parseFloat(income);
    
    const data = Object.keys(taxRates).map(country => {
      const tax = calculateTax(country, amount);
      const netIncome = amount - tax;
      const effectiveRate = (tax / amount) * 100;
      
      return {
        country,
        tax: currency === 'INR' ? tax * currencyRates.INR : tax,
        netIncome: currency === 'INR' ? netIncome * currencyRates.INR : netIncome,
        effectiveRate
      };
    });

    setComparisonData(data);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  if (!income) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-purple-400 mb-4 relative inline-block"
      >
        Tax Comparison Across Countries
        <motion.span 
          className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-500"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.h2>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-4"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-8 w-8 border-b-2 border-purple-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {comparisonData.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm"
          >
            <h3 className="text-lg font-medium text-purple-300 mb-4">Effective Tax Rate Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="country" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.9)',
                      border: '1px solid #6B7280',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value) => [`${value.toFixed(2)}%`, 'Effective Tax Rate']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="effectiveRate" 
                    name="Effective Tax Rate" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Detailed Comparison Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm overflow-x-auto"
          >
            <h3 className="text-lg font-medium text-purple-300 mb-4">Detailed Comparison</h3>
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Country</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">Tax Amount</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">Net Income</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">Effective Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {comparisonData.map((data, index) => (
                  <motion.tr
                    key={data.country}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-2 text-sm text-gray-200">{data.country}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-200">{formatCurrency(data.tax)}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-200">{formatCurrency(data.netIncome)}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-200">{data.effectiveRate.toFixed(2)}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 