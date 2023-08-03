/*
Author: Brayden Campbell
Date: 2023-08-03
*/

import React from 'react';

import Header from './Header.jsx';

import { CallDataProvider } from './CallDataContext';

//CallDataProvider is used as a wrapper to allow everything inside to view the call information. 
//This is useful for the archival of calls, as it allows pages to update without reloading the entire web page 

const App = () => {
  return (
    <CallDataProvider>
      <div id='App' className='container'>
        <Header/>
      </div>
    </CallDataProvider>
  );
};

export default App;
