'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export default function ExportReports({ taxResult, comparisonData }) {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount, currency) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Tax Calculation Results
      const calculationData = [
        ['Tax Calculation Results'],
        [''],
        ['Summary'],
        ['Annual Income', formatCurrency(taxResult.originalAmount, taxResult.originalCurrency)],
        ['Total Tax', formatCurrency(taxResult.totalTax, taxResult.originalCurrency)],
        ['Effective Tax Rate', `${taxResult.effectiveRate}%`],
        ['Net Income', formatCurrency(taxResult.netIncome, taxResult.originalCurrency)],
        [''],
        ['Tax Slabs Breakdown'],
        ['Income Range', 'Rate', 'Taxable Amount', 'Tax Amount']
      ];

      // Add tax slabs data
      taxResult.taxSlabs.forEach(slab => {
        const range = slab.nextThreshold === Infinity 
          ? `Above ${formatCurrency(slab.threshold, taxResult.originalCurrency)}`
          : `${formatCurrency(slab.threshold, taxResult.originalCurrency)} - ${formatCurrency(slab.nextThreshold, taxResult.originalCurrency)}`;
        
        calculationData.push([
          range,
          `${slab.rate}%`,
          formatCurrency(slab.taxableAmount, taxResult.originalCurrency),
          formatCurrency(slab.taxAmount, taxResult.originalCurrency)
        ]);
      });

      // Add comparison data
      calculationData.push(
        [''],
        ['Tax Rate Comparison'],
        ['Country', 'Effective Tax Rate']
      );

      comparisonData.forEach(data => {
        calculationData.push([
          data.country,
          `${data.effectiveRate}%`
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(calculationData);

      // Style the worksheet
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let i = 0; i <= range.e.r; i++) {
        for (let j = 0; j <= range.e.c; j++) {
          const cell = XLSX.utils.encode_cell({ r: i, c: j });
          if (!ws[cell]) continue;
          
          ws[cell].s = {
            font: { name: 'Arial', sz: 12 },
            alignment: { horizontal: 'left' }
          };
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Tax Report');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'tax-calculation-report.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
    setIsExporting(false);
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Helper function to add text and update position
      const addText = (text, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(text, 20, yPos);
        yPos += fontSize / 2 + 5;
      };

      // Title
      addText('Tax Calculation Report', 18, true);
      yPos += 10;

      // Summary Section
      addText('Summary', 14, true);
      addText(`Annual Income: ${formatCurrency(taxResult.originalAmount, taxResult.originalCurrency)}`);
      addText(`Total Tax: ${formatCurrency(taxResult.totalTax, taxResult.originalCurrency)}`);
      addText(`Effective Tax Rate: ${taxResult.effectiveRate}%`);
      addText(`Net Income: ${formatCurrency(taxResult.netIncome, taxResult.originalCurrency)}`);
      yPos += 10;

      // Tax Slabs Section
      addText('Tax Slabs Breakdown', 14, true);
      taxResult.taxSlabs.forEach(slab => {
        const range = slab.nextThreshold === Infinity 
          ? `Above ${formatCurrency(slab.threshold, taxResult.originalCurrency)}`
          : `${formatCurrency(slab.threshold, taxResult.originalCurrency)} - ${formatCurrency(slab.nextThreshold, taxResult.originalCurrency)}`;
        
        addText(`${range}`);
        addText(`Rate: ${slab.rate}% | Tax Amount: ${formatCurrency(slab.taxAmount, taxResult.originalCurrency)}`);
        yPos += 2;
      });
      yPos += 10;

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Comparison Section
      addText('Tax Rate Comparison', 14, true);
      comparisonData.forEach(data => {
        addText(`${data.country}: ${data.effectiveRate}%`);
      });

      // Save the PDF
      doc.save('tax-calculation-report.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
    setIsExporting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 space-y-4"
    >
      <h3 className="text-xl font-semibold text-purple-400">Export Report</h3>
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToExcel}
          disabled={isExporting}
          className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Exporting...
            </>
          ) : (
            'Export to Excel'
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Exporting...
            </>
          ) : (
            'Export to PDF'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
} 