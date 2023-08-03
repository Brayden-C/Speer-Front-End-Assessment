import React, {useState, useEffect} from 'react';

import Header from './Header.jsx';

import { CallDataProvider } from './CallDataContext';

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
