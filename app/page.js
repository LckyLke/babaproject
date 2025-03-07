'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Erzeuger from '@/components/Erzeuger';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useErzeugerContext } from '@/context/erzeuger';
import { useImportDataContext } from '@/context/importdata';
import ErzeugerObj from '@/classes/erzeuger';
import LineChart from '@/components/LineChart';
import PieChart from '@/components/PieChart';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Home() {
  const [numDivs, setNumDivs] = useState(0);
  const MAX_VALUE = 99;
  const [erzeugerValues, setErzeugerValues] = useErzeugerContext();
  const [importData, setImportData] = useImportDataContext();
  const [showGraph, setShowGraph] = useState(true);
  const [dataValid, setDataValid] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [usageMatrix, setUsageMatrix] = useState([]);

  // Set numDivs based on loaded Erzeuger data
  useEffect(() => {
    if (erzeugerValues.length > 0) {
      setNumDivs(erzeugerValues.length);
    }
  }, [erzeugerValues.length]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      setNumDivs(0);
      setErzeugerValues([]);
      return;
    }
    
    var value = parseInt(inputValue);
    if (isNaN(value)) return;
    
    if (value >= MAX_VALUE) {
      value = MAX_VALUE;
    }
    if (value < 0) {
      value = 0;
    }
    setNumDivs(value);
    
    // Preserve existing Erzeuger data when adding new ones
    const currentLength = erzeugerValues.length;
    if (value > currentLength) {
      // Add new Erzeuger objects while preserving existing ones
      const newErzeugerValues = [
        ...erzeugerValues,
        ...Array.from(
          { length: value - currentLength },
          () => new ErzeugerObj()
        )
      ];
      setErzeugerValues(newErzeugerValues);
    } else if (value < currentLength) {
      // Remove excess Erzeuger objects
      const newErzeugerValues = erzeugerValues.slice(0, value);
      setErzeugerValues(newErzeugerValues);
    }
    // If value === currentLength, no change needed
  };

  useEffect(() => {
    const isErzeugerValid =
      erzeugerValues.length > 0 &&
      erzeugerValues.every(
        (erzeuger) =>
          // Consider empty fields as valid (they'll be treated as 0)
          (erzeuger.maximalleistung === '' || !isNaN(parseFloat(erzeuger.maximalleistung))) &&
          (erzeuger.minimalleistung === '' || !isNaN(parseFloat(erzeuger.minimalleistung))) &&
          (erzeuger.benutzungsstunden === '' || !isNaN(parseFloat(erzeuger.benutzungsstunden)))
      );

    // Allow for 8760 or 8761 values (to accommodate the A1 cell)
    const isImportDataValid = importData.length >= 8760;

    setDataValid(isErzeugerValid && isImportDataValid);
  }, [erzeugerValues, importData]);

  useEffect(() => {
    if (importData.length > 0 && erzeugerValues.length > 0) {
      // Reset remaining hours for all erzeugers before calculation
      const workingErzeugers = erzeugerValues.map(erzeuger => {
        const copy = erzeuger.copy();
        copy.resetRemHours();
        return copy;
      });

      const matrix = [];
      for (let hour = 0; hour < importData.length; hour++) {
        const row = [];
        const demand = importData[hour];
        let remainingDemand = demand;

        for (let i = 0; i < workingErzeugers.length; i++) {
          const erzeuger = workingErzeugers[i];
          const maxLeistung = erzeuger.maximalleistung === '' ? 0 : parseFloat(erzeuger.maximalleistung);
          const minLeistung = erzeuger.minimalleistung === '' ? 0 : parseFloat(erzeuger.minimalleistung);
          const remstunden = erzeuger.remstunden === '' ? 0 : parseFloat(erzeuger.remstunden);

          let genutzteleistung = 0;
          if (remainingDemand > minLeistung && remstunden > 0) {
            // Only use the generator if remaining demand is higher than minimum power and we have hours left
            genutzteleistung = Math.min(maxLeistung, remainingDemand);
            if (genutzteleistung < minLeistung) {
              genutzteleistung = 0; // Don't use generator if we can't meet minimum power requirement
            } else {
              remainingDemand -= genutzteleistung;
              erzeuger.decreaseRemStunden(); // Decrease remaining hours when generator is used
            }
          }

          row.push({ 
            genutzteleistung,
            remstunden: erzeuger.remstunden // Store remaining hours in the matrix for reference
          });
        }
        matrix.push(row);
      }
      setUsageMatrix(matrix);
    } else {
      setUsageMatrix([]);
    }
  }, [importData, erzeugerValues]);

  const hanleFileUpload = (e) => {
    console.log(e);
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Use header: 1 to treat all rows as data (including the first row with A1)
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Extract the first column values and convert to numbers
      const hourlyValues = parsedData.map(row => Math.ceil(row[0] || 0));
      
      console.log('Data length:', hourlyValues.length);
      console.log('First few values:', hourlyValues.slice(0, 5));
      
      // Make sure we have exactly 8760 values
      if (hourlyValues.length > 8760) {
        setImportData(hourlyValues.slice(0, 8760));
      } else if (hourlyValues.length < 8760) {
        // If we have fewer than 8760 values, pad with zeros
        const paddedValues = [...hourlyValues];
        while (paddedValues.length < 8760) {
          paddedValues.push(0);
        }
        setImportData(paddedValues);
      } else {
        setImportData(hourlyValues);
      }
    };
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-blue-50/95 dark:bg-blue-900/95 border-b-2 border-blue-200 dark:border-blue-700 shadow-sm">
              <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <p className="text-base text-blue-700 dark:text-blue-200 font-medium">
                  Hinweis: Das neue Format erfordert keine führende 0 mehr in Zelle A1. Sie können jetzt direkt Ihre Daten in A1 eingeben.
                </p>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="ml-6 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-screen overflow-hidden">
        <motion.main 
          className="flex-1 container mx-auto px-4 py-2 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            <div className="lg:w-1/5 flex flex-col gap-4 min-h-0">
              <div className="modern-card shrink-0">
                <div className="input-container">
                  <label className="input-label">Anzahl Wärmeerzeuger</label>
                  <div className="input-spinner-container">
                    <input
                      type="number"
                      className="dark-mode-input with-spinner"
                      placeholder="Enter a number"
                      value={numDivs}
                      min="0"
                      max={MAX_VALUE}
                      onChange={handleInputChange}
                    />
                    <div className="input-spinner-buttons">
                      <div 
                        className="spinner-button spinner-button-up h-1/2" 
                        onClick={() => {
                          if (numDivs < MAX_VALUE) {
                            handleInputChange({ target: { value: numDivs + 1 } });
                          }
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </div>
                      <div 
                        className="spinner-button spinner-button-down h-1/2" 
                        onClick={() => {
                          if (numDivs > 0) {
                            handleInputChange({ target: { value: numDivs - 1 } });
                          }
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modern-card shrink-0">
                <div className="input-container">
                  <label className="input-label">Lastgang einlesen:</label>
                  <input
                    id="filePicker"
                    className="file-input"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => {
                      hanleFileUpload(e);
                    }}
                  />
                </div>
              </div>

              <div className="modern-card flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-auto">
                  <div className="space-y-4">
                    {erzeugerValues.map((_, index) => (
                      <Erzeuger
                        key={index}
                        num={index + 1}
                        values={erzeugerValues}
                        setValues={setErzeugerValues}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modern-card shrink-0">
                <button
                  className="modern-button w-full"
                  onClick={() => setShowGraph(prev => !prev)}
                >
                  {showGraph ? 'Graph ausblenden' : 'Graph einblenden'}
                </button>
              </div>
            </div>

            {showGraph && (
              <motion.div 
                className="lg:w-3/5 min-h-0 flex flex-col gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="modern-card flex-1 overflow-hidden">
                  <LineChart usageMatrix={usageMatrix} />
                </div>
                {usageMatrix.length > 0 && importData.length > 0 && (
                  <motion.div 
                    className="modern-card h-96"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <PieChart usageMatrix={usageMatrix} importData={importData} />
                  </motion.div>
                )}
              </motion.div>
            )}

            {showGraph && dataValid && importData.length > 0 && (
              <motion.div 
                className="lg:w-1/5 flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="modern-card py-2 shrink-0">
                  <h3 className="text-base font-medium mb-1">Gesamter Bedarfslastgang</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Summe: {Math.round(importData.reduce((a, b) => a + b, 0)).toLocaleString('de-DE')} kWh
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2 flex flex-col gap-3">
                  {erzeugerValues.map((erzeuger, index) => {
                    const currentErzeugerSum = usageMatrix.reduce((sum, row) => sum + (row[index]?.genutzteleistung || 0), 0);
                    return (
                      <div key={index} className="modern-card py-2">
                        <h3 className="text-base font-medium mb-1">Erzeuger {index + 1}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Arbeit: {Math.round(currentErzeugerSum || 0).toLocaleString('de-DE')} kWh
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Relativer Anteil: {((currentErzeugerSum || 0) / (importData.reduce((a, b) => a + b, 0) || 1) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="modern-card py-2 shrink-0">
                  <button
                    className="modern-button w-full text-sm"
                    onClick={() => {
                      const lineChartElement = document.querySelector('.lineChart');
                      if (lineChartElement) {
                        const tableRef = lineChartElement.parentElement.querySelector('table');
                        if (tableRef) {
                          const wb = XLSX.utils.table_to_book(tableRef);
                          XLSX.writeFile(wb, 'Erzeuger_Daten.xlsx');
                        }
                      }
                    }}
                  >
                    Excel export
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.main>
        <Footer />
      </div>
    </div>
  );
}
