import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // 경로를 './components/App'로 수정
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
