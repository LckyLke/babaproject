'use client';
import React, { createContext, useContext, useState } from 'react';

// Create a new context
const ImportDataContext = createContext();

// Create the ImportDataProvider component
export function ImportDataProvider({ children }) {
  // Define your state for import data here
  const [importData, setImportData] = useState([]);

  return (
    <ImportDataContext.Provider value={[importData, setImportData]}>
      {children}
    </ImportDataContext.Provider>
  );
}

// Create a custom hook to access the import data context
export function useImportDataContext() {
  return useContext(ImportDataContext);
}
