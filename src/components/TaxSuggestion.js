'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function TaxSuggestion({ income, country = 'India', currency = 'INR' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (income && country) {
      getTaxSuggestion();
    }
  }, [income, country, currency]);

  const getTaxSuggestion = async () => {
    setLoading(true);
    setError('');
    
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const formattedIncome = currency === 'INR' 
        ? `₹${income.toLocaleString('en-IN')}`
        : `$${income.toLocaleString()}`;

      const prompt = `Provide 3 tax-saving strategies for a ${country} resident with annual income of ${formattedIncome}. Format each strategy exactly as follows:

Strategy: [Name of tax-saving method]
Details: [One clear sentence about how it works]
Savings: [Estimated annual tax savings in ${formattedIncome}]
Action: [One specific step to implement]

Keep responses strictly focused on ${country}'s tax laws and common deductions.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response and split into individual suggestions
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      // Split into individual suggestions and filter out empty lines
      const suggestionList = cleanText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toLowerCase().includes('please provide'));
      
      setSuggestions(suggestionList);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Failed to generate tax suggestions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!income || !country) return null;

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
        Tax Saving Suggestions for {country}
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
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-purple-500/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 bg-red-900/20 p-4 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {suggestions.length > 0 && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200"
              >
                <div className="flex items-start space-x-3">
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-purple-400 font-semibold">{index + 1}</span>
                  </motion.div>
                  <motion.p 
                    className="text-gray-200 flex-grow whitespace-pre-line"
                    whileHover={{ color: '#a78bfa' }}
                  >
                    {suggestion}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 