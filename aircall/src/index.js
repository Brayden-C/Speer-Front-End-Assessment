import './css/body.css';
import './css/app.css';
import './css/header.css';

import App from './App.jsx';

// import { StrictMode } from "react";
import React from 'react';
import ReactDOM from 'react';
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById('app');
//const root = ReactDOM.createRoot(rootElement);
const root = createRoot(rootElement);

root.render(
  <App />
);