import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; 
import './styles/App.css';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ wrap App in router */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
