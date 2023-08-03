import React from 'react';
import { createContext, useContext, useState } from 'react';

const CallDataContext = createContext();

export const useCallData = () => useContext(CallDataContext);

export function CallDataProvider({ children }) {
  const [data, setData] = useState([]);

  return (
    <CallDataContext.Provider value={{ data, setData }}>
      {children}
    </CallDataContext.Provider>
  );
}