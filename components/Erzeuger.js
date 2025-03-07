import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Erzeuger({ num, values, setValues }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleInputChange = (e, field) => {
    const inputValue = e.target.value;
    
    // Allow empty field or valid numbers only
    if (field === 'name' || inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
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
  
  const handleNameSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };
  
  const moveErzeuger = (direction) => {
    const newIndex = num - 1 + direction;
    
    // Check if the new index is valid
    if (newIndex < 0 || newIndex >= values.length) return;
    
    setValues(prevValues => {
      const updatedValues = [...prevValues];
      
      // Get the Erzeugers being swapped
      const currentErzeuger = updatedValues[num - 1];
      const targetErzeuger = updatedValues[newIndex];
      
      // Check if names are default (based on position) and update them
      if (currentErzeuger.name === `Erzeuger ${num}`) {
        currentErzeuger.name = `Erzeuger ${newIndex + 1}`;
      }
      
      if (targetErzeuger.name === `Erzeuger ${newIndex + 1}`) {
        targetErzeuger.name = `Erzeuger ${num}`;
      }
      
      // Swap the Erzeugers
      [updatedValues[num - 1], updatedValues[newIndex]] = [updatedValues[newIndex], updatedValues[num - 1]];
      
      return updatedValues;
    });
  };
  
  const deleteErzeuger = () => {
    setValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues.splice(num - 1, 1);
      return updatedValues;
    });
  };

  // Get the current Erzeuger name or use the default
  const erzeugerName = values[num - 1].name || `Erzeuger ${num}`;

  return (
    <motion.div 
      className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4 z-10 border border-red-500">
          <p className="text-center mb-4">Sind Sie sicher, dass Sie diesen Erzeuger löschen möchten?</p>
          <div className="flex gap-3">
            <button 
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              onClick={deleteErzeuger}
            >
              Löschen
            </button>
            <button 
              className="px-3 py-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <div className="flex flex-col mr-2">
            <button 
              className="text-slate-500 hover:text-blue-500 transition-colors mb-1 disabled:opacity-30 disabled:hover:text-slate-500"
              onClick={() => moveErzeuger(-1)}
              disabled={num === 1}
              title="Nach oben verschieben"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button 
              className="text-slate-500 hover:text-blue-500 transition-colors disabled:opacity-30 disabled:hover:text-slate-500"
              onClick={() => moveErzeuger(1)}
              disabled={num === values.length}
              title="Nach unten verschieben"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              className="text-base font-medium bg-transparent border-b border-blue-500 focus:outline-none text-slate-700 dark:text-slate-200 w-full mr-2"
              value={erzeugerName}
              onChange={(e) => handleInputChange(e, 'name')}
              onKeyDown={handleNameSubmit}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <h3 className="text-base font-medium text-slate-700 dark:text-slate-200">
              {erzeugerName}
            </h3>
          )}
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => setIsEditing(true)}
            className="text-slate-500 hover:text-blue-500 transition-colors mr-2"
            title="Umbenennen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-slate-500 hover:text-red-500 transition-colors"
            title="Löschen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
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
