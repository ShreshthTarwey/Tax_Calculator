'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export default function TaxHistory({ currentCalculation }) {
  const [user, setUser] = useState(null);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadCalculations(user.uid);
      } else {
        setCalculations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && currentCalculation) {
      saveCalculation(currentCalculation);
    }
  }, [currentCalculation, user]);

  const loadCalculations = async (userId) => {
    try {
      const q = query(
        collection(db, 'calculations'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const calculationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCalculations(calculationsData);
    } catch (error) {
      console.error('Error loading calculations:', error);
    }
  };

  const saveCalculation = async (calculation) => {
    try {
      const calculationData = {
        ...calculation,
        userId: user.uid,
        timestamp: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'calculations'), calculationData);
      loadCalculations(user.uid);
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Tax Calculation History', 20, 20);
    
    let yPos = 40;
    calculations.forEach((calc, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Calculation ${index + 1} - ${new Date(calc.timestamp).toLocaleDateString()}`, 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Income: ${formatCurrency(calc.income, calc.originalCurrency)}`, 30, yPos);
      yPos += 7;
      doc.text(`Total Tax: ${formatCurrency(calc.totalTax, calc.originalCurrency)}`, 30, yPos);
      yPos += 7;
      doc.text(`Net Income: ${formatCurrency(calc.netIncome, calc.originalCurrency)}`, 30, yPos);
      yPos += 7;
      doc.text(`Effective Tax Rate: ${calc.effectiveRate}%`, 30, yPos);
      yPos += 15;
    });
    
    doc.save('tax-history.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      calculations.map(calc => ({
        Date: new Date(calc.timestamp).toLocaleDateString(),
        Income: calc.income,
        'Total Tax': calc.totalTax,
        'Net Income': calc.netIncome,
        'Effective Rate': `${calc.effectiveRate}%`,
        Currency: calc.originalCurrency
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax History');
    XLSX.writeFile(workbook, 'tax-history.xlsx');
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-8"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 p-6 rounded-lg backdrop-blur-sm text-center"
      >
        <p className="text-gray-300 mb-4">Sign in to save your tax calculations</p>
        <button
          onClick={() => signIn()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-purple-400"
        >
          Tax History
        </motion.h2>
        <div className="space-x-4">
          <button
            onClick={exportToPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {calculations.map((calc, index) => (
            <motion.div
              key={calc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-700/50 p-4 rounded-lg backdrop-blur-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">
                    {new Date(calc.timestamp).toLocaleString()}
                  </p>
                  <p className="text-lg text-purple-300 mt-1">
                    Income: {formatCurrency(calc.income, calc.originalCurrency)}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-400">Total Tax</p>
                      <p className="text-purple-300">
                        {formatCurrency(calc.totalTax, calc.originalCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Net Income</p>
                      <p className="text-purple-300">
                        {formatCurrency(calc.netIncome, calc.originalCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Effective Rate</p>
                      <p className="text-purple-300">{calc.effectiveRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 