'use client';
import { createContext, useContext, useState } from 'react';

const Context = createContext();

export function ErzeugerProvider({ children }) {
  const [erzeugerValues, setErzeugerValues] = useState([]);
  return (
    <Context.Provider value={[erzeugerValues, setErzeugerValues]}>
      {children}
    </Context.Provider>
  );
}

export function useErzeugerContext() {
  return useContext(Context);
}
