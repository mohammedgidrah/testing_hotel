import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Import global styles
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import './components/translate/i18n.jsx'; // Import i18n configuration for translations

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
