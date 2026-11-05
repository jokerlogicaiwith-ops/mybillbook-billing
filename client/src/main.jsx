import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Automatically attach active business header to all API requests
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const opts = options ? { ...options } : {};
    let activeCompanyId = null;
    try {
      activeCompanyId = localStorage.getItem('mybillbook_active_company_id');
    } catch (e) {}

    if (activeCompanyId) {
      if (opts.headers instanceof Headers) {
        if (!opts.headers.has('x-company-id')) {
          opts.headers.set('x-company-id', activeCompanyId);
        }
      } else {
        opts.headers = {
          ...(opts.headers || {}),
          'x-company-id': activeCompanyId
        };
      }
    }
    return originalFetch.call(this, url, opts);
  }
  return originalFetch.call(this, url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
