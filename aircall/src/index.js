import './css/body.css';
import './css/app.css';
import './css/header.css';

import App from './App.jsx';

import React from 'react';
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById('app');
const root = createRoot(rootElement);

root.render(
  <App />
);