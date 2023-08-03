/*
Author: Brayden Campbell
Date: 2023-08-03
*/

//This file is used to create and store a state variable for the call data. 
//This allows the three tabs, Inbox, AllCalls, and Archives, to update the array for seamless transitions

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