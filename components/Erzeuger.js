import React from 'react';
import { motion } from 'framer-motion';

function Erzeuger({ num, values, setValues }) {
  const handleInputChange = (e, field) => {
    const inputValue = e.target.value;
    
    // Allow empty field or valid numbers only
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      setValues((prevValues) => {
        const updatedValues = [...prevValues];
        updatedValues[num - 1].set(field, inputValue === '' ? '' : inputValue);
        return updatedValues;
      });
    }
  };

  const handleSpinnerClick = (field, increment) => {
    const currentValue = parseFloat(values[num - 1][field === 'max' ? 'maximalleistung' : field === 'min' ? 'minimalleistung' : 'benutzungsstunden']) || 0;
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    if (newValue >= 0) {
      setValues((prevValues) => {
        const updatedValues = [...prevValues];
        updatedValues[num - 1].set(field, newValue.toString());
        return updatedValues;
      });
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-base font-medium mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        Erzeuger {num}
      </h3>
      <div className="space-y-3">
        <div className="input-container">
          <label className="input-label">Max Leistung</label>
          <div className="input-spinner-container">
            <input
              placeholder="Maximalleistung in KW"
              type="number"
              min="0"
              step="any"
              className="dark-mode-input with-spinner"
              value={values[num - 1].maximalleistung}
              onChange={(e) => handleInputChange(e, 'max')}
            />
            <div className="input-spinner-buttons">
              <div 
                className="spinner-button spinner-button-up h-1/2" 
                onClick={() => handleSpinnerClick('max', true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <div 
                className="spinner-button spinner-button-down h-1/2" 
                onClick={() => handleSpinnerClick('max', false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="input-container">
          <label className="input-label">Min Leistung</label>
          <div className="input-spinner-container">
            <input
              placeholder="Minimalleistung in KW"
              type="number"
              min="0"
              step="any"
              className="dark-mode-input with-spinner"
              value={values[num - 1].minimalleistung}
              onChange={(e) => handleInputChange(e, 'min')}
            />
            <div className="input-spinner-buttons">
              <div 
                className="spinner-button spinner-button-up h-1/2" 
                onClick={() => handleSpinnerClick('min', true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <div 
                className="spinner-button spinner-button-down h-1/2" 
                onClick={() => handleSpinnerClick('min', false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="input-container">
          <label className="input-label">Benutzungsstunden</label>
          <div className="input-spinner-container">
            <input
              placeholder="Maximal Benutzungsstunden"
              type="number"
              min="0"
              step="any"
              className="dark-mode-input with-spinner"
              value={values[num - 1].benutzungsstunden}
              onChange={(e) => handleInputChange(e, 'stunden')}
            />
            <div className="input-spinner-buttons">
              <div 
                className="spinner-button spinner-button-up h-1/2" 
                onClick={() => handleSpinnerClick('stunden', true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
              <div 
                className="spinner-button spinner-button-down h-1/2" 
                onClick={() => handleSpinnerClick('stunden', false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Erzeuger;
