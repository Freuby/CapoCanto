import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import ToastProvider from './components/ToastProvider'; // Import ToastProvider

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider /> {/* Add ToastProvider here */}
    <App />
  </React.StrictMode>
);