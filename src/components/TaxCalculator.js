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
    { threshold: 0, rate: 0.00 },      // Up to 3,00,000
    { threshold: 300000, rate: 0.05 }, // 3,00,001 to 6,00,000
    { threshold: 600000, rate: 0.10 }, // 6,00,001 to 9,00,000
    { threshold: 900000, rate: 0.15 }, // 9,00,001 to 12,00,000
    { threshold: 1200000, rate: 0.20 }, // 12,00,001 to 15,00,000
    { threshold: 1500000, rate: 0.30 }  // Above 15,00,000
  ]
};

// Currency conversion rates (as of March 2024)
const currencyRates = {
  USD: 1,
  INR: 83.25  // 1 USD = 83.25 INR
};

export default function TaxCalculator({ onCalculate }) {
  const [country, setCountry] = useState('United States');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [convertedIncome, setConvertedIncome] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Update currency when country changes
  useEffect(() => {
    setCurrency(country === 'India' ? 'INR' : 'USD');
  }, [country]);

  // Convert income when currency changes
  useEffect(() => {
    if (income && currency === 'INR') {
      const usdAmount = parseFloat(income) / currencyRates.INR;
      setConvertedIncome(usdAmount.toFixed(2));
    } else {
      setConvertedIncome(income);
    }
  }, [income, currency]);

  const calculateTax = () => {
    setIsCalculating(true);
    const annualIncome = parseFloat(convertedIncome);
    if (!annualIncome || annualIncome < 0) return;

    const rates = taxRates[country];
    let totalTax = 0;
    let remainingIncome = annualIncome;
    const taxSlabs = [];

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

        taxSlabs.push({
          threshold,
          nextThreshold,
          rate: currentRate.rate * 100,
          taxableAmount: taxableInThisBracket,
          taxAmount: taxInThisBracket
        });
      }
    }

    const effectiveRate = (totalTax / annualIncome) * 100;
    const netIncome = annualIncome - totalTax;

    // Add a small delay for the animation
    setTimeout(() => {
      onCalculate({
        income: annualIncome,
        totalTax,
        effectiveRate: effectiveRate.toFixed(2),
        netIncome,
        originalCurrency: currency,
        originalAmount: parseFloat(income),
        taxSlabs
      });
      setIsCalculating(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-semibold text-purple-400"
      >
        Calculate Your Tax
      </motion.h2>
      
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label className="block text-sm font-medium mb-2">Select Country</label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
          >
            {Object.keys(taxRates).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </motion.select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="block text-sm font-medium mb-2">
            Annual Income ({currency})
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
            placeholder={`Enter your annual income in ${currency}`}
          />
          {currency === 'INR' && convertedIncome && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-gray-400 mt-1"
            >
              ≈ ${convertedIncome} USD
            </motion.p>
          )}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={calculateTax}
          disabled={isCalculating}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ${
            isCalculating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isCalculating ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Calculating...
            </motion.span>
          ) : (
            'Calculate Tax'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
} 