'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaxCalculator from '@/components/TaxCalculator';
import TaxSuggestion from '@/components/TaxSuggestion';
import TaxComparisonGraph from '@/components/TaxComparisonGraph';
import ExportReports from '@/components/ExportReports';
import TaxNews from '@/components/TaxNews';

export default function Home() {
  const [taxResult, setTaxResult] = useState(null);
  const [income, setIncome] = useState('');
  const [comparisonData, setComparisonData] = useState([]);

  const formatCurrency = useCallback((amount, currency) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  }, []);

  const formatRange = useCallback((start, end, currency) => {
    if (end === Infinity) {
      return `Above ${formatCurrency(start, currency)}`;
    }
    return `${formatCurrency(start, currency)} - ${formatCurrency(end, currency)}`;
  }, [formatCurrency]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]" />
      
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-center mb-4 relative"
          >
            <span className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-lg rounded-full" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">
              Global Tax Calculator
            </span>
          </motion.h1>
          <motion.div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
        </motion.div>
        
        <div className="max-w-4xl mx-auto space-y-8 mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200"
          >
            <TaxCalculator 
              onCalculate={(result) => {
                setTaxResult(result);
                setIncome(result.income);
              }}
            />
          </motion.div>
          
          {taxResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200"
            >
              <AnimatePresence mode="wait">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
                  >
                    Tax Calculation Results
                  </motion.h2>
                  
                  {/* Summary Section */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-medium text-purple-300">Summary</h3>
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-200"
                    >
                      Annual Income: {formatCurrency(taxResult.originalAmount, taxResult.originalCurrency)}
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="text-gray-200"
                    >
                      Total Tax: {formatCurrency(taxResult.totalTax, taxResult.originalCurrency)}
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                      className="text-gray-200"
                    >
                      Effective Tax Rate: {taxResult.effectiveRate}%
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                      className="text-gray-200"
                    >
                      Net Income: {formatCurrency(taxResult.netIncome, taxResult.originalCurrency)}
                    </motion.p>
                  </motion.div>

                  {/* Tax Slabs Section */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <h3 className="text-lg font-medium text-purple-300">Tax Slabs Breakdown</h3>
                    <div className="space-y-2">
                      {taxResult.taxSlabs.map((slab, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, backgroundColor: 'rgba(75, 85, 99, 0.6)' }}
                          className="bg-gray-700/50 p-3 rounded backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/30 transition-colors duration-200"
                        >
                          <p className="text-sm text-gray-300">
                            {formatRange(slab.threshold, slab.nextThreshold, taxResult.originalCurrency)}
                          </p>
                          <p className="text-sm text-gray-400">
                            Rate: {slab.rate}%
                          </p>
                          <p className="text-sm text-gray-400">
                            Taxable Amount: {formatCurrency(slab.taxableAmount, taxResult.originalCurrency)}
                          </p>
                          <p className="text-sm text-purple-300">
                            Tax: {formatCurrency(slab.taxAmount, taxResult.originalCurrency)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  <TaxSuggestion 
                    income={taxResult.income}
                    country={taxResult.country}
                    currency={taxResult.originalCurrency}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tax Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200"
          >
            <TaxComparisonGraph 
              income={taxResult?.income} 
              currency={taxResult?.originalCurrency}
              onComparisonDataChange={setComparisonData}
            />
          </motion.div>

          {/* Export Reports Section */}
          {taxResult && comparisonData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200"
            >
              <ExportReports 
                taxResult={taxResult}
                comparisonData={comparisonData}
              />
            </motion.div>
          )}

          {/* Add TaxNews component after existing components */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200"
          >
            <TaxNews />
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
