'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export default function TaxComparisonGraph({ income, currency }) {
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    if (!income) return;

    const calculateTaxForCountry = (country, amount) => {
      const rates = taxRates[country];
      let totalTax = 0;
      let remainingIncome = amount;

      if (country === 'India') {
        if (amount <= 300000) {
          return 0;
        }
        const slabs = [
          { min: 300001, max: 600000, rate: 0.05 },
          { min: 600001, max: 900000, rate: 0.10 },
          { min: 900001, max: 1200000, rate: 0.15 },
          { min: 1200001, max: 1500000, rate: 0.20 },
          { min: 1500001, max: Infinity, rate: 0.30 }
        ];

        let previousThreshold = 300000;
        for (const slab of slabs) {
          if (remainingIncome > previousThreshold) {
            const taxableAmount = Math.min(remainingIncome - previousThreshold, slab.max - previousThreshold);
            totalTax += taxableAmount * slab.rate;
            previousThreshold = slab.max;
          }
        }
      } else {
        for (let i = 0; i < rates.length; i++) {
          const currentRate = rates[i];
          const nextRate = rates[i + 1];
          const threshold = currentRate.threshold;
          const nextThreshold = nextRate ? nextRate.threshold : Infinity;

          if (remainingIncome > threshold) {
            const taxableInThisBracket = Math.min(remainingIncome - threshold, nextThreshold - threshold);
            totalTax += taxableInThisBracket * currentRate.rate;
            remainingIncome -= taxableInThisBracket;
          }
        }
      }
      return totalTax;
    };

    const amount = parseFloat(income);
    if (isNaN(amount)) return;

    const data = Object.keys(taxRates).map(country => {
      let countryAmount = amount;
      if (currency === 'INR' && country !== 'India') {
        countryAmount = amount / currencyRates.INR;
      } else if (currency === 'USD' && country === 'India') {
        countryAmount = amount * currencyRates.INR;
      }

      const tax = calculateTaxForCountry(country, countryAmount);
      const effectiveRate = (tax / countryAmount) * 100;

      return {
        country,
        effectiveRate: effectiveRate.toFixed(2)
      };
    });

    setComparisonData(data);
  }, [income, currency]);

  if (!income || comparisonData.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 p-6 bg-gray-800 rounded-lg"
    >
      <h3 className="text-xl font-semibold text-purple-400 mb-4">Tax Rate Comparison</h3>
      
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-4">Effective Tax Rates by Country</h4>
        <div className="space-y-4">
          {comparisonData.map((data, index) => (
            <div key={data.country} className="flex items-center">
              <div className="w-32 text-gray-300">{data.country}</div>
              <div className="flex-1 h-8 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.effectiveRate}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <div className="w-24 ml-4 text-right text-gray-300 font-medium">
                {data.effectiveRate}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 